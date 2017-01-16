/**
 * Created by sam on 16.01.2017.
 */

import * as React from 'react';
import {observer} from 'mobx-react';
import AppState from './state';
import ManhattanPlot, {IWindow} from 'datavisyn-scatterplot-react/src/ManhattanPlot';

@observer
export default class ObservedManhattanPlot extends React.Component<{state: AppState},{}> {
  render() {
    return <ManhattanPlot serverUrl="/api" onSignificanceChanged={this.onSignificanceChanged.bind(this)}
                       geqSignificance={this.props.state.significance} onWindowChanged={this.onWindowChanged.bind(this)} />;
  }

  private onSignificanceChanged(sig: number) {
    this.props.state.significance = sig;
  }

  private onWindowChanged(window: IWindow) {
    this.props.state.window = window;
  }
}
