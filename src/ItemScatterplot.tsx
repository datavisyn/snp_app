/**
 * Created by sam on 29.10.2016.
 */

import * as React from 'react';
import LocusZoom, {IScatterplotOptions} from 'datavisyn-scatterplot-react/src/LocusZoom';
import {observer} from 'mobx-react';
import {action} from 'mobx';
import AppState, {Item} from './state';
import {ISymbol, ERenderMode} from 'datavisyn-scatterplot/src/symbol';
import Scatterplot, {IWindow, IScale} from 'datavisyn-scatterplot/src';


export {IScatterplotOptions, scale} from 'datavisyn-scatterplot-react/src';
export {IScale} from 'datavisyn-scatterplot/src';

class ItemLocusZoom extends LocusZoom<Item> {

}

export function circleSymbol(fillStyle: string = 'steelblue', size = 20, diamondSize = 60): ISymbol<Item> {
  const r = Math.sqrt(size / Math.PI);
  const tau = 2 * Math.PI;
  const tan30 = Math.sqrt(1 / 3);
  const tan30Times2 = tan30 * 2;

  const styles = {
    [ERenderMode.NORMAL]: fillStyle,
    [ERenderMode.HOVER]: 'orange',
    [ERenderMode.SELECTED]: 'red'
  };

  return (ctx: CanvasRenderingContext2D, mode: ERenderMode) => {
    //before
    ctx.beginPath();
    return {
      //during
      render: (x: number, y: number, item: Item) => {
        if (item.isLeadSNP()) {
          // diamond
          const dy = Math.sqrt(diamondSize / tan30Times2);
          const dx = dy * tan30;
          ctx.moveTo(x, y - dy);
          ctx.lineTo(x + dx, y);
          ctx.lineTo(x, y + dy);
          ctx.lineTo(x - dx, y);
          ctx.lineTo(x, y - dy);
        } else {
          ctx.moveTo(x + r, y);
          //circle
          ctx.arc(x, y, r, 0, tau);
        }
      },
      //after
      done: () => {
        ctx.closePath();
        ctx.fillStyle = styles[mode];
        ctx.fill();
      }
    };
  };
}


export function renderSignificanceLine(state: AppState, ctx: CanvasRenderingContext2D, xscale: IScale, yscale: IScale) {
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


@observer
export default class ObservedLocusZoom extends React.Component<{data: Item[], options: IScatterplotOptions<Item>, state: AppState, chromosome: string},{}> {
  render() {
    const {selection} = this.props.state;
    const {chromosome, data, options} = this.props;
    return <ItemLocusZoom data={data} options={options} selection={selection.slice()}
                          onSelectionChanged={this.onSelectionChanged.bind(this)}
                          onWindowChanged={this.onWindowChanged.bind(this)} chromosome={chromosome}/>;
  }

  @action
  private onSelectionChanged(selection: Item[]) {
    this.props.state.selection = selection;
  }

  @action
  private onWindowChanged(window: IWindow) {
    this.props.state.windowLocusZoom = window.xMinMax;
  }
}
