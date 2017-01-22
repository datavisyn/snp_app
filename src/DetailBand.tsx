/**
 * Created by sam on 22.01.2017.
 */


import * as React from 'react';
import {observer} from 'mobx-react';
import AppState from './state';
import {scaleLinear} from 'd3-scale';


@observer
export default class DetailBand extends React.Component<{state: AppState},{width: number}> {
  render() {
    const {windowManhattan, windowLocusZoom} = this.props.state;
    if (windowManhattan == null || windowLocusZoom == null) {
      return;
    }
    const width = this.state ? this.state.width : 1000;
    const marginManhattan = { left: 32, right: 10};
    const marginLocusZoom = { left: 50, right: 10};

    const xscale = scaleLinear()
      .domain(windowManhattan)
      .range([marginManhattan.left, width - marginManhattan.right]);

    const xPos = xscale(windowLocusZoom[0]);
    const xPos2 = xscale(windowLocusZoom[1]);
    return <svg className="detailBand" preserveAspectRatio="xMinYMax" viewBox={`0,0,${width},30`} height="30" width="100%" ref={(svg) => this.setState({width: (svg as SVGElement).clientWidth})}>
      <path d={`M${xPos},0 L${marginLocusZoom.left},30 L${width-marginLocusZoom.right},30 L${xPos2},0 Z`} />
    </svg>;
  }
}
