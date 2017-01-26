/**
 * Created by sam on 22.01.2017.
 */


import * as React from 'react';
import {observer} from 'mobx-react';
import AppState from './state';
import {scaleLinear} from 'd3-scale';


@observer
export default class DetailBand extends React.Component<{state: AppState},{width: number}> {
  constructor(props: {state: AppState}, context) {
    super(props, context);

    this.state = {
      width: 1000
    };
  }

  render() {
    const {windowManhattan, windowAbsoluteLocusZoom} = this.props.state;
    if (windowManhattan == null || windowAbsoluteLocusZoom == null) {
      return;
    }
    const width = this.state.width;
    const marginManhattan = {left: 32, right: 10};
    const marginLocusZoom = {left: 50, right: 10};

    const xscale = scaleLinear()
      .domain(windowManhattan)
      .range([marginManhattan.left, width - marginManhattan.right]);

    const xPos = xscale(windowAbsoluteLocusZoom[0]);
    const xPos2 = xscale(windowAbsoluteLocusZoom[1]);
    return <svg className="detailBand" preserveAspectRatio="xMinYMax" viewBox={`0,0,${width},30`} height="30"
                width="100%" ref={(svg) => this.updateSize(svg as Element)}>
      <path d={`M${xPos},0 L${marginLocusZoom.left},30 L${width-marginLocusZoom.right},30 L${xPos2},0 Z`}/>
    </svg>;
  }

  private updateSize(elem: Element) {
    if (elem && elem.clientWidth !== this.state.width) {
      this.setState({width: elem.clientWidth});
    }
  }
}
