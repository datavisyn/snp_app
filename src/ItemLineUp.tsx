/**
 * Created by sam on 29.10.2016.
 */


import * as React from 'react';
import LineUp from 'lineupjs/src/react';
import {deriveColors} from 'lineupjs/src';
import {createActionDesc} from 'lineupjs/src/model';
import NumberColumn from 'lineupjs/src/model/NumberColumn';
import {action} from 'mobx';
import {observer} from 'mobx-react';
import AppState, {Item, ACGT} from './state';
import {ILineUpConfig} from 'lineupjs/src/lineup';
import ADataProvider from 'lineupjs/src/provider/ADataProvider';
import {extent} from 'd3-array';

class ItemLineUp extends LineUp<Item> {

}



@observer
export default class ObservedLineUp extends React.Component<{data: Item[], state: AppState, desc: any[]},{}> {
  private chromStartColumn: NumberColumn;

  private config: ILineUpConfig = {
    body: {
      actions: [{
        name: 'Comment',
        icon: '\uf0e5', //'fa-comment-o',
        action: this.onComment.bind(this)
      }, {
        name: 'Bookmark',
        icon: '\uf097', //'fa-bookmark-o',
        action: this.onBookmark.bind(this)
      }, {
        name: 'Open Details',
        icon: '\uf002', //'fa-search',
        action: this.onDetails.bind(this)
      }]
    }
  };

  render() {
    const {selection, filterLineUpToLocusZoomWindow, windowLocusZoom} = this.props.state;
    if (this.chromStartColumn) {
      if (filterLineUpToLocusZoomWindow && windowLocusZoom) {
        this.chromStartColumn.setFilter({ min: windowLocusZoom[0], max: windowLocusZoom[1], filterMissing: false});
      } else {
        // reset
        this.chromStartColumn.setFilter();
      }
    }
    return <ItemLineUp data={this.props.data} desc={this.props.desc} options={this.config}
                       selection={selection.slice()} onSelectionChanged={this.onSelectionChanged.bind(this)}
                       defineLineUp={this.defineLineUp.bind(this)}/>;
  }

  private onComment(row: Item) {
    console.log('comment button pressed for Item', row);
  }

  @action
  private onBookmark(row: Item) {
    const act = this.props.state.bookmarks;
    if (act.indexOf(row) >= 0) {
      act.splice(act.indexOf(row), 1);
    } else {
      act.push(row);
    }
  }

  private onDetails(row: Item) {
    console.log('comment button pressed for Item', row);
  }

  static deriveLineUpDescription(data: Item[], pvalMin: number) {
    const chromStartExtent = extent(data, (d) => d.chromStart);

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

    return desc;
  }

  private defineLineUp(data: ADataProvider) {
    const cols = data.getColumns();
    const ranking = data.pushRanking();
    ranking.push(data.create(cols[0])).setWidth(50);
    ranking.push(data.create(cols[1])).setWidth(20);
    this.chromStartColumn = data.create(cols[2]) as NumberColumn;
    ranking.push(this.chromStartColumn);
    ranking.push(data.create(cols[3])).setWidth(20);
    ranking.push(data.create(cols[4])).setWidth(20);
    cols.slice(5).forEach((col) => ranking.push(data.create(col)).setWidth(90));
    // add a action column
    ranking.push(data.create(createActionDesc()));
  }

  @action
  private onSelectionChanged(selection: Item[]) {
    this.props.state.selection = selection;
  }
}
