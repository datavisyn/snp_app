/**
 * Created by sam on 16.01.2017.
 */

import * as React from 'react';
import {observer} from 'mobx-react';
import {action} from 'mobx';
import AppState from './state';
import ManhattanPlot, {IWindow} from 'datavisyn-scatterplot-react/src/ManhattanPlot';

export {IWindow} from 'datavisyn-scatterplot-react/src/ManhattanPlot';

@observer
export default class ObservedManhattanPlot extends React.Component<{state: AppState, width?: number},{}> {
  render() {
    const width = this.props.width || window.innerWidth - 30;
    return <ManhattanPlot xAxisLabel="Chromosome" yAxisLabel="-log10 p-value" serverUrl="/api" onSignificanceChanged={this.onSignificanceChanged.bind(this)}
                          geqSignificance={this.props.state.significance}
                          onWindowChanged={this.onWindowChanged.bind(this)} snapToChromosome={true}
                          detailWindow={this.props.state.windowAbsoluteLocusZoom}
                          onMetadataLoaded={this.onMetaDataLoaded.bind(this)} width={width}/>;
  }

  @action
  private onMetaDataLoaded(xlim: number[]) {
    this.props.state.windowManhattan = xlim;
  }

  @action
  private onSignificanceChanged(sig: number) {
    this.props.state.significance = sig;
  }

  @action
  private onWindowChanged(w: IWindow) {
    const scatterplotElement = document.querySelector('#snp-scatterplot');
    scatterplotElement.classList.add('active')
    document.querySelector('#snp-lineup').classList.add('active');
    window.scrollTo(0, window.pageYOffset + scatterplotElement.getBoundingClientRect().top);
    this.props.state.window = w;
  }
}
