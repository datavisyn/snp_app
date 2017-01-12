/**
 * Created by sam on 29.10.2016.
 */

import * as React from 'react';
import LocusZoom, {IScatterplotOptions} from 'datavisyn-scatterplot-react/src/LocusZoom';
import {observer} from 'mobx-react';
import AppState, {Item} from './state';

class ItemLocusZoom extends LocusZoom<Item> {

}

@observer
export default class ObservedLocusZoom extends React.Component<{ data: Item[], options: IScatterplotOptions<Item>, state: AppState, chromosome: string},{}> {
  render() {
    const {selection} = this.props.state;
    const {chromosome, data, options} = this.props;
    return <ItemLocusZoom data={data} options={options} selection={selection.slice()}
                          onSelectionChanged={this.onSelectionChanged.bind(this)} chromosome={chromosome}/>;
  }

  private onSelectionChanged(selection: Item[]) {
    this.props.state.selection = selection;
  }
}
