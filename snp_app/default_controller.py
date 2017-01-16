from __future__ import print_function
import sqlite3
import matplotlib
import pandas as pd
import flask
from sys import maxint
import os

# http://stackoverflow.com/questions/2801882/generating-a-png-with-matplotlib-when-display-is-undefined#3054314
# Force matplotlib to not use any Xwindows backend.
matplotlib.use('Agg')


def get_db():
  db = getattr(flask.g, '_database', None)
  if db is None:
    db = flask.g._database = sqlite3.connect(os.path.normpath(os.path.dirname(__file__) + '/../data/db.sqlite'))
  return db


def _to_abs_position(chromosome, location):
  location = int(location)
  r = get_db().execute('SELECT shift, length FROM chromosome WHERE chr_name = ?', (chromosome,)).fetchone()
  shift = r[0]
  length = r[1]
  # clamp to max length
  if location > length:
    location = length
  return shift + location


def chromosome_get():
  chromosomes = pd.read_sql('select * from chromosome order by rowid', con=get_db())

  r = chromosomes.to_json(orient='records')
  return flask.Response(r, mimetype='application/json')


def manhattan_meta_get(geq_significance=None):
  import numpy as np
  chromosomes = pd.read_sql('select * from chromosome order by rowid', con=get_db()).to_records()

  def to_meta(chromosome):
    return dict(name=chromosome.chr_name, shift=long(chromosome.shift), start=long(chromosome.start + chromosome.shift),
                end=long(chromosome.end + chromosome.shift))

  x_max = chromosomes[-1].length + chromosomes[-1].shift

  r = get_db().execute('SELECT min(pval) FROM snp WHERE pval <= ?',
                       (sig2pval(geq_significance) if geq_significance is not None else 1,)).fetchone()
  y_max = float(-np.log10(r[0]))
  return dict(ylim=[0, y_max], xlim=[0, long(x_max)],
              chromosomes=[to_meta(d) for d in chromosomes])


def sig2pval(sig):
  import numpy as np
  r = float(np.exp(-sig))
  return r


def manhattan_get(width=None, height=None, geq_significance=None, plain=None):
  import numpy as np
  import matplotlib.pyplot as plt
  from io import BytesIO
  import os.path

  file_name = 'manhattan_{w}_{h}_{s}_{p}.png'.format(w=width, h=height, s=geq_significance, p=plain)
  cache_key = os.path.normpath(os.path.dirname(__file__) + '/../tmp/' + file_name)

  if os.path.isfile(cache_key):
    with open(cache_key) as f:
      buffer = BytesIO()
      buffer.write(f.read())
      buffer.seek(0)
      return flask.send_file(buffer, as_attachment=False,
                             attachment_filename='manhattan.png',
                             mimetype='image/png')

  # http://stackoverflow.com/questions/37463184/how-to-create-a-manhattan-plot-with-matplotlib-in-python
  chromosomes = pd.read_sql('select * from chromosome order by rowid', con=get_db()).to_records()

  fig = plt.figure()
  ax = fig.add_subplot(111)
  colors = ['0.9', '0.6']  # http://matplotlib.org/api/colors_api.html
  x_labels = []
  x_labels_pos = []

  maxes = []

  for num, chromosome in enumerate(chromosomes):
    query = 'select s.*, (s.chrom_start + c.shift) as abs_location from snp s left join chromosome c on s.chr_name = c.chr_name where pval <= ? and s.chr_name = ? order by abs_location'
    group = pd.read_sql(query,
                        params=(sig2pval(geq_significance) if geq_significance is not None else 1, chromosome.chr_name),
                        con=get_db())

    # -log_10(pvalue)
    group['minuslog10pvalue'] = -np.log10(group.pval)
    # print(num, chromosome.chr_name, len(group) if group is not None else 0)
    if group is not None and not group.empty:
      maxes.append(np.max(group.minuslog10pvalue))
      plt.scatter(x=group.abs_location, y=group.minuslog10pvalue, color=colors[num % len(colors)], s=10)

    x_labels.append(chromosome.chr_name)
    # center
    x_labels_pos.append(chromosome.start + chromosome.shift + chromosome.length / 2)

  x_max = chromosomes[-1].length + chromosomes[-1].shift
  ax.set_xlim([0, x_max])
  ax.set_ylim([0, np.max(maxes)])

  if plain:
    ax.axis('off')
    ax.get_xaxis().set_visible(False)
    ax.get_yaxis().set_visible(False)
  else:
    ax.set_xticks(x_labels_pos)
    ax.set_xticklabels(x_labels)
    ax.set_xlabel('Chromosome')

  # write to memory
  buffer = BytesIO()
  fig.set_size_inches((width or 160) / 50, (height or 90) / 50)
  args = dict(dpi=50)
  if plain:
    args['bbox_inches'] = 'tight'
    args['pad_inches'] = 0
  plt.savefig(buffer, **args)
  buffer.seek(0)

  plt.savefig(cache_key, **args)
  print('generated image')

  result = flask.send_file(buffer, as_attachment=False,
                           attachment_filename='manhattan.png',
                           mimetype='image/png')
  return result


def _to_snp_query(from_chromosome=None, from_location=0, to_chromosome=None, to_location=maxint, geq_significance=None,
                  leq_significance=None):
  params = []
  q = 'from snp s left join chromosome c on s.chr_name = c.chr_name '
  append = 'where'
  if to_chromosome is not None and from_chromosome is None:
    abs_to = _to_abs_position(to_chromosome, to_location)
    q += append + ' (s.chrom_start + c.shift) <= ?'
    append = 'and'
    params.append(abs_to)
  elif from_chromosome is not None:
    abs_from = _to_abs_position(from_chromosome, from_location)
    abs_to = _to_abs_position(to_chromosome or from_chromosome, to_location)
    q += append + ' (s.chrom_start + c.shift) between ? and ?'
    append = 'and'
    params.extend((abs_from, abs_to))

  if geq_significance or leq_significance is not None:
    q += append + ' (pval between ? and ?)'
    append = 'and'
    params.extend((0 if leq_significance is None else sig2pval(leq_significance),
                   1 if geq_significance is None else sig2pval(geq_significance)))

  return q, params


def data_get(from_chromosome=None, from_location=0, to_chromosome=None, to_location=maxint, geq_significance=None,
             leq_significance=None):
  query_from_where, params = _to_snp_query(from_chromosome, from_location, to_chromosome, to_location, geq_significance,
                                           leq_significance)

  query = 'select s.*, (s.chrom_start + c.shift) as abs_chrom_start ' + query_from_where + ' order by abs_chrom_start'
  data = pd.read_sql(query, params=params, con=get_db())

  r = data.to_json(orient='records')
  return flask.Response(r, mimetype='application/json')


def data_count_get(from_chromosome=None, from_location=0, to_chromosome=None, to_location=maxint, geq_significance=None,
                   leq_significance=None):
  query_from_where, params = _to_snp_query(from_chromosome, from_location, to_chromosome, to_location, geq_significance,
                                           leq_significance)

  query = 'select count(*) ' + query_from_where
  count = get_db().execute(query, params).fetchone()[0]

  return count


def _to_exon_query(from_chromosome=None, from_location=0, to_chromosome=None, to_location=maxint, ):
  params = []
  q = 'from exon s left join chromosome c on s.chr_name = c.chr_name '
  append = 'where'
  if to_chromosome is not None and from_chromosome is None:
    abs_to = _to_abs_position(to_chromosome, to_location)
    q += append + ' (s.end + c.shift) <= ?'
    append = 'and'
    params.append(abs_to)
  elif from_chromosome is not None:
    abs_from = _to_abs_position(from_chromosome, from_location)
    abs_to = _to_abs_position(to_chromosome or from_chromosome, to_location)
    q += append + ' (s.start + c.shift) >= ? and (s.end + c.shift) <= ?'
    append = 'and'
    params.extend((abs_from, abs_to))

  return q, params


def exon_get(from_chromosome=None, from_location=0, to_chromosome=None, to_location=maxint):
  query_from_where, params = _to_exon_query(from_chromosome, from_location, to_chromosome, to_location)

  query = 'select s.*, (s.start + c.shift) as abs_start, (s.end + c.shift) as abs_end ' + query_from_where + ' order by abs_start'
  data = pd.read_sql(query, params=params, con=get_db())

  r = data.to_json(orient='records')
  return flask.Response(r, mimetype='application/json')


def exon_count_get(from_chromosome=None, from_location=0, to_chromosome=None, to_location=maxint):
  query_from_where, params = _to_exon_query(from_chromosome, from_location, to_chromosome, to_location)

  query = 'select count(*) ' + query_from_where
  count = get_db().execute(query, params).fetchone()[0]

  return count


def _gene_exon_get(query, params):
  from json import dumps
  data = pd.read_sql(query, params=params, con=get_db())
  grouped = data.groupby('gene_name')
  gene_list = []
  for name, group in grouped:
    exons = group.loc[:, ['start', 'end', 'abs_start', 'abs_end']]
    # build base data
    gene = dict(gene_name=name, strand=group.strand.min(), start=group.start.min(), abs_start=group.abs_start.min(),
                end=group.end.max(), abs_end=group.abs_end.max(), exons='EXONS')
    gene_string = dumps(gene)
    # use fast pandas to string for the detail data
    gene_string = gene_string.replace('"EXONS"', exons.to_json(orient='records'))
    gene_list.append(gene_string)
  return '[' + ','.join(gene_list) + ']'


def gene_get(from_chromosome=None, from_location=0, to_chromosome=None, to_location=maxint, with_exons=False):
  query_from_where, params = _to_exon_query(from_chromosome, from_location, to_chromosome, to_location)

  if with_exons:
    query = 'select s.*, (s.start + c.shift) as abs_start, (s.end + c.shift) as abs_end ' + query_from_where + ' order by abs_start'
    r = _gene_exon_get(query, params)
  else:
    query = """select s.gene_name, s.strand, min(s.start) as start, max(s.end) as end, min(s.start + c.shift) as abs_start, max(s.end + c.shift) as abs_end
    {from_where}
    group by s.gene_name order by s.gene_name, s.strand""" \
      .format(from_where=query_from_where)
    data = pd.read_sql(query, params=params, con=get_db())

    r = data.to_json(orient='records')
  return flask.Response(r, mimetype='application/json')


def gene_exon_get(gene_name):
  query = """
    select s.*, (s.start + c.shift) as abs_start, (s.end + c.shift) as abs_end
    from exon s left join chromosome c on s.chr_name = c.chr_name
    where s.gene_name in ("{names}") order by abs_start
  """.format(names='","'.join(gene_name))
  r = _gene_exon_get(query, ())
  return flask.Response(r, mimetype='application/json')


def gene_count_get(from_chromosome=None, from_location=0, to_chromosome=None, to_location=maxint):
  query_from_where, params = _to_exon_query(from_chromosome, from_location, to_chromosome, to_location)

  query = 'select count(*) from (select s.gene_name, s.strand ' + query_from_where + ' group by s.gene_name, s.strand)'
  count = get_db().execute(query, params).fetchone()[0]

  return count
