from __future__ import print_function
import sqlite3
import matplotlib
import pandas as pd
import flask
import os

# http://stackoverflow.com/questions/2801882/generating-a-png-with-matplotlib-when-display-is-undefined#3054314
# Force matplotlib to not use any Xwindows backend.
matplotlib.use('Agg')

conn = sqlite3.connect(os.path.normpath(os.path.dirname(__file__) + '/../data/db.sqlite'))


def _to_abs_position(chromosome, location):
  r = conn.execute('SELECT shift, length FROM chromosome WHERE chr_name = ?', (chromosome,)).fetchone()
  shift = r[0]
  length = r[1]
  # clamp to max length
  if location > length:
    location = length
  return shift + location


def chromosome_get():
  chromosomes = pd.read_sql('select * from chromosome order by rowid', con=conn)

  r = chromosomes.to_json(orient='records')
  return flask.Response(r, mimetype='application/json')


def manhattan_meta_get(geqSignificance=None):
  import numpy as np
  chromosomes = pd.read_sql('select * from chromosome order by rowid', con=conn).to_records()

  def to_meta(chromosome):
    return dict(name=chromosome.chr_name, shift=long(chromosome.shift), start=long(chromosome.start + chromosome.shift),
                end=long(chromosome.end + chromosome.shift))

  x_max = chromosomes[-1].length + chromosomes[-1].shift

  r = conn.execute('SELECT min(pval) FROM snp WHERE pval <= ?',
                   (sig2pval(geqSignificance) if geqSignificance is not None else 1,)).fetchone()
  y_max = float(-np.log10(r[0]))
  return dict(ylim=[0, y_max], xlim=[0, long(x_max)],
              chromosomes=[to_meta(d) for d in chromosomes])


def sig2pval(sig):
  import numpy as np
  r = float(np.exp(-sig))
  print(sig, r)
  return r


def manhattan_get(width=None, height=None, geqSignificance=None, plain=None):
  import numpy as np
  import matplotlib.pyplot as plt
  from io import BytesIO
  import json
  import os.path

  cache_key = os.path.normpath(
    os.path.dirname(__file__) + '/../tmp/manhattan_{width}_{height}_{geqSignificance}_{plain}.png'.format(width=width,
                                                                                                          height=height,
                                                                                                          geqSignificance=geqSignificance,
                                                                                                          plain=plain))
  if os.path.isfile(cache_key):
    return flask.send_file(cache_key, as_attachment=False,
                           attachment_filename='manhattan.png',
                           mimetype='image/png')

  # http://stackoverflow.com/questions/37463184/how-to-create-a-manhattan-plot-with-matplotlib-in-python
  chromosomes = pd.read_sql('select * from chromosome order by rowid', con=conn).to_records()

  fig = plt.figure()
  ax = fig.add_subplot(111)
  colors = ['red', 'blue']
  x_labels = []
  x_labels_pos = []

  maxes = []

  for num, chromosome in enumerate(chromosomes):
    group = pd.read_sql(
      'select s.*, (s.chrom_start + c.shift) as abs_location from snp s left join chromosome c on s.chr_name = c.chr_name where pval <= ? and s.chr_name = ? order by abs_location',
      params=(sig2pval(geqSignificance) if geqSignificance is not None else 1, chromosome.chr_name), con=conn)

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


def data_get(fromChromosome, fromLocation, toChromosome, toLocation, geqSignificance=None):
  abs_from = _to_abs_position(fromChromosome, fromLocation)
  abs_to = _to_abs_position(toChromosome, toLocation)

  query = 'select s.*, (s.chrom_start + c.shift) as abs_location from snp s left join chromosome c on s.chr_name = c.chr_name where abs_location between ? and ? and pval <= ? order by abs_location'
  params = (abs_from, abs_to, 1 if geqSignificance is None else sig2pval(geqSignificance),)
  data = pd.read_sql(query, params=params, con=conn)

  r = data.to_json(orient='records')
  return flask.Response(r, mimetype='application/json')
