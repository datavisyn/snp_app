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
export default class ObservedManhattanPlot extends React.Component<{state: AppState},{}> {
  render() {
    return <ManhattanPlot serverUrl="/api" onSignificanceChanged={this.onSignificanceChanged.bind(this)}
                          geqSignificance={this.props.state.significance}
                          onWindowChanged={this.onWindowChanged.bind(this)} snapToChromosome={true}
                          detailWindow={this.props.state.windowLocusZoom}
                          onMetadataLoaded={this.onMetaDataLoaded.bind(this)}/>;
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
  private onWindowChanged(window: IWindow) {
    this.props.state.window = window;
  }
}
