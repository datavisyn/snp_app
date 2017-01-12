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

import LocusZoom from './ItemScatterplot';
import {IScatterplotOptions, scale} from 'datavisyn-scatterplot-react/src';
import ManhattanPlot from 'datavisyn-scatterplot-react/src/ManhattanPlot';
import LineUp from './ItemLineUp';
import {deriveColors} from 'lineupjs/src/lineup';
import AppState, {Item} from './state';
import {extent, max} from 'd3-array';
import {observer} from 'mobx-react';

const state = new AppState();

const ACGT = [
  {label: 'c', color: 'red'},
  {label: 't', color: 'cyan'},
  {label: 'a', color: 'blue'},
  {label: 'g', color: 'yellow'}];


function toState(raw: any[]) {
  const data = raw.map((r) => new Item(r));
  const chromStartExtent = extent(data, (d) => d.chromStart);
  const pvalMin = Math.min(50, max(data, (d) => d.mlogpval)); // rounding error
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
    yscale: scale.scaleLinear().domain([0, pvalMin]).clamp(true)
  };

  return {data, options, desc};
}

@observer
class ObservedRootElement extends React.Component<{state: AppState},{data: Item[], desc: any[], options: IScatterplotOptions<Item>}> {
  render() {
    return <section>
      <header>
        <ManhattanPlot serverUrl="/api" onSignificanceChanged={this.onSignificanceChanged.bind(this)}
                       onWindowChanged={this.onWindowChanged.bind(this)}/>
        <button onClick={this.onLoad.bind(this)}>Load Window</button>
      </header>
      <section>
        <section>
          {this.state && this.state.data &&
          <LocusZoom data={this.state.data} state={this.props.state} options={this.state.options}
                     chromosome={`Chromosome ${this.state.data[0].chrName}`}/>}
        </section>
        <section>
          {this.state && this.state.data &&
          <LineUp data={this.state.data} desc={this.state.desc} state={this.props.state}/>}
        </section>
      </section>
    </section>;
  }

  private onLoad() {
    const w = state.window;
    const significance = state.significance;
    if (w) {
      console.log('get data');
      (self as any).fetch(`/api/data?fromChromosome=${w.fromChromosome}&fromLocation=${w.fromLocation}&toChromosome=${w.toChromosome}&toLocation=${w.toLocation}&geqSignificance=${significance}`)
        .then((r) => r.json())
        .then((data: Item[]) => {
          this.setState(toState(data));
        });
    }
  }

  private onSignificanceChanged(sig: number) {
    this.props.state.significance = sig;
  }

  private onWindowChanged(fromChromosome: string, fromLocation: number, toChromosome: string, toLocation: number) {
    this.props.state.window = {fromChromosome, fromLocation, toChromosome, toLocation};
  }
}

render(
  <ObservedRootElement state={state}/>
  , document.querySelector('main'));
