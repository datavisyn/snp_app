/**
 * author:  Samuel Gratzl
 * email:   samuel_gratzl@gmx.at
 * created: 2016-10-28T11:19:52.797Z
 */
//copy index.html
import 'file-loader?name=index.html!./index.html';
//include styles
import 'font-awesome/scss/font-awesome.scss';
import './style.scss';

/* tslint:disable */
import * as React from 'react';
/* tslint:enable */
import {render} from 'react-dom';

import {IScatterplotOptions, IScale} from './ItemScatterplot';
import LocusZoom, {circleSymbol, scale} from './ItemScatterplot';
import ManhattanPlot from './ManhattanPlot';
import GeneExon, {IGene} from './GeneExon';
import LineUp, {ILineUpConfig, ADataProvider, deriveColors, createActionDesc} from './ItemLineUp';
import AppState, {Item} from './state';
import {extent, max} from 'd3-array';
import {observer} from 'mobx-react';

const state = new AppState();

const ACGT = [
  {label: 'c', color: 'red'},
  {label: 't', color: 'cyan'},
  {label: 'a', color: 'blue'},
  {label: 'g', color: 'yellow'}];

const lineupOptions: ILineUpConfig = {
  body: {
    actions: [{
      name: 'Comment',
      icon: '\uf0e5', //'fa-comment-o',
      action: (row: Item) => {
        console.log('comment button pressed for Item', row);
      }
    }, {
      name: 'Bookmark',
      icon: '\uf097', //'fa-bookmark-o',
      action: (row: Item) => {
        console.log('bookmark for Item', row);
      }
    }, {
      name: 'Open Details',
      icon: '\uf002', //'fa-search',
      action: (row: Item) => {
        console.log('open details for Item', row);
      }
    }]
  }
};

function defineLineUp(data: ADataProvider) {
  data.deriveDefault();
  // add a action column
  const ranking = data.getLastRanking();
  data.push(ranking, createActionDesc());
}

function renderSignificanceLine(ctx: CanvasRenderingContext2D, xscale: IScale, yscale: IScale) {
  const signifiance = state.significance;
  const y = yscale(signifiance) + 1; // don't know the offset
  const x0x1 = xscale.domain().map(xscale);
  ctx.beginPath();
  ctx.moveTo(x0x1[0], y);
  ctx.lineTo(x0x1[1], y);
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.stroke();
}

function toState(genes: IGene[], snp: any[]) {
  const data = snp.map((r) => new Item(r));
  const chromStartExtent = extent(data, (d) => d.chromStart);
  const pvalMin = Math.min(50, 3 + max(data, (d) => d.mlogpval)); // rounding error
  const desc = [
    {type: 'string', column: 'refsnpId'},
    {type: 'string', column: 'chrName'},
    {type: 'number', column: 'chromStart', domain: chromStartExtent},
    {type: 'categorical', column: 'allele1', categories: ACGT},
    {type: 'categorical', column: 'allele2', categories: ACGT},
    {type: 'number', column: 'freqA1', domain: extent(data, (d) => d.freqA1)},
    {type: 'number', column: 'beta', domain: extent(data, (d) => d.beta)},
    {type: 'number', column: 'se', domain: extent(data, (d) => d.se)},
    {type: 'number', column: 'mlogpval', domain: [0, pvalMin]},
    {type: 'number', column: 'pval', domain: extent(data, (d) => d.pval)},
    {type: 'number', column: 'N', domain: extent(data, (d) => d.N)}
  ];
  deriveColors(desc as any);
  const options: IScatterplotOptions<Item> = {
    x: (d: Item) => d.chromStart,
    y: (d: Item) => d.mlogpval,
    xscale: scale.scaleLinear().domain(chromStartExtent),
    yscale: scale.scaleLinear().domain([0, pvalMin]).clamp(true),
    symbol: circleSymbol(),
    extras: renderSignificanceLine
  };

  return {data, options, desc, genes};
}

@observer
class ObservedRootElement extends React.Component<{state: AppState},{data: Item[], genes: IGene[], desc: any[], options: IScatterplotOptions<Item>}> {
  render() {
    return <section>
      <section>
        <ManhattanPlot state={this.props.state}/>
        { this.state && this.state.data && <LocusZoom data={this.state.data} state={this.props.state} options={this.props.options}
                     chromosome={`Chromosome ${this.state.data[0].chrName}`}/>}
        { this.state && this.state.genes && <GeneExon data={this.state.genes} state={this.props.state}/>}
      </section>
      <section>
          {this.state && this.state.data &&
          <LineUp data={this.state.data} desc={this.state.desc} state={this.props.state} options={lineupOptions}
                  defineLineUp={defineLineUp}/>}
      </section>
    </section>;
  }

  private onLoad() {
    const w = state.window;
    const significance = state.significance;
    if (w) {
      console.log('get data');
      const fetchSNP: Promise<any[]> = (self as any).fetch(`/api/data?from_chromosome=${w.fromChromosome}&from_location=${w.fromLocation}&to_chromosome=${w.toChromosome}&to_location=${w.toLocation}&geq_significance=${significance}`)
        .then((r) => r.json());
      const fetchGenes: Promise<any[]> = (self as any).fetch(`/api/gene?from_chromosome=${w.fromChromosome}&from_location=${w.fromLocation}&to_chromosome=${w.toChromosome}&to_location=${w.toLocation}&geq_significance=${significance}`)
        .then((r) => r.json());
      Promise.all([fetchGenes, fetchSNP]).then(([genes, snp]) => {
        this.setState(toState(genes, snp));
      });
    }
  }

}

render(
  <ObservedRootElement state={state}/>
  , document.querySelector('main'));
