/**
 * Created by sam on 29.10.2016.
 */


import * as React from 'react';
import LineUp, {} from 'lineupjs/src/react';
import {observer} from 'mobx-react';
import AppState, {Item} from './state';
import {ILineUpConfig} from 'lineupjs/src/lineup';
import ADataProvider from 'lineupjs/src/provider/ADataProvider';

class ItemLineUp extends LineUp<Item> {

}

@observer
export default class ObservedLineUp extends React.Component<{ data: Item[], state: AppState, desc: any[], options?: ILineUpConfig, defineLineUp?(data: ADataProvider): void},{}> {
  render() {
    const { selection } = this.props.state;
    return <ItemLineUp data={this.props.data} desc={this.props.desc} options={this.props.options} selection={selection.slice()} onSelectionChanged={this.onSelectionChanged.bind(this)} defineLineUp={this.props.defineLineUp} />;
  }


  private onSelectionChanged(selection: Item[]) {
    console.log('set state');
    this.props.state.selection = selection;
  }
}
