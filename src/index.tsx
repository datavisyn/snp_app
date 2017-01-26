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

import {IScatterplotOptions} from './ItemScatterplot';
import LocusZoom, {circleSymbol, scale, renderSignificanceLine} from './ItemScatterplot';
import ManhattanPlot, {IWindow} from './ManhattanPlot';
import GeneExon, {IGene} from './GeneExon';
import LineUp from './ItemLineUp';
import AppState, {Item} from './state';
import {extent, max} from 'd3-array';
import {reaction} from 'mobx';
import {observer} from 'mobx-react';
import Dialog from './Dialog';

const state = new AppState();


function toState(genes: IGene[], snp: any[]) {
  const data = snp.map((r) => new Item(r));

  const chromStartExtent = extent(data, (d) => d.chromStart);
  const pvalMin = Math.min(60, 5 + max(data, (d) => d.mlogpval)); // rounding error

  const desc = LineUp.deriveLineUpDescription(data, pvalMin);

  const options: IScatterplotOptions<Item> = {
    x: (d: Item) => d.chromStart,
    y: (d: Item) => d.mlogpval,
    xscale: scale.scaleLinear().domain(chromStartExtent),
    yscale: scale.scaleLinear().domain([0, pvalMin]).clamp(true),
    symbol: circleSymbol(),
    extras: renderSignificanceLine.bind(this, state)
  };

  // for having local data in the locuszoom but can convert it to absolute data
  const locusZoomOffset = data[0].absChromStart - data[0].chromStart;
  state.locusZoomOffset = locusZoomOffset;
  //set the window that is visible
  state.windowLocusZoom = chromStartExtent;
  // reset selection for new data
  state.selection = [];

  return {data, options, desc, genes};
}


@observer
class ObservedRootElement extends React.Component<{state: AppState},{data: Item[], genes: IGene[], desc: any[], options: IScatterplotOptions<Item>}> {
  constructor(props, context) {
    super(props, context);

    // if the window or significance changes trigger a loading operation
    reaction(
      () => ({window: this.props.state.window, significance: this.props.state.significance}),
      (args: {window: IWindow, significance: number}) => this.onLoad(args.window, args.significance)
    );
  }
  render() {
    return <section>
      <section style={{width: '50vw'}}>
        <ManhattanPlot state={this.props.state}/>
        { this.state && this.state.data &&
        <LocusZoom data={this.state.data} state={this.props.state} options={this.state.options}
                   chromosome={`Chromosome ${this.state.data[0].chrName}`}/>}
        { this.state && this.state.genes && <GeneExon data={this.state.genes} state={this.props.state}/>}
      </section>
      <section>
        <div>
          <Dialog />
          Selection Info
        </div>
        {this.state && this.state.data &&
        <LineUp data={this.state.data} desc={this.state.desc} state={this.props.state}/>}
      </section>
    </section>;
  }

  private onLoad(w: IWindow, significance: number) {
    if (w) {
      console.log('get data');
      const fetchSNP: Promise<any[]> = (self as any).fetch(`/api/data?from_chromosome=${w.fromChromosome}&from_location=${w.fromLocation}&to_chromosome=${w.toChromosome}&to_location=${w.toLocation}&geq_significance=${significance}`)
        .then((r) => r.json());
      const fetchGenes: Promise<any[]> = (self as any).fetch(`/api/gene?from_chromosome=${w.fromChromosome}&from_location=${w.fromLocation}&to_chromosome=${w.toChromosome}&to_location=${w.toLocation}`)
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
