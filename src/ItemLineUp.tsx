/**
 * Created by sam on 29.10.2016.
 */


import * as React from 'react';
import LineUp, {} from 'lineupjs/src/react';
import {observer} from 'mobx-react';
import AppState, {Item} from './state';

class ItemLineUp extends LineUp<Item> {

}

@observer
export default class ObservedLineUp extends React.Component<{ data: Item[], state: AppState, desc: any[]},{}> {
  render() {
    const { selection } = this.props.state;
    return <ItemLineUp data={this.props.data} desc={this.props.desc} options={{}} selection={selection.slice()} onSelectionChanged={this.onSelectionChanged.bind(this)} />;
  }

  private onSelectionChanged(selection: Item[]) {
    console.log('set state');
    this.props.state.selection = selection;
  }
}
