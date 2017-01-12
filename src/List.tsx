/**
 * Created by sam on 29.10.2016.
 */

import * as React from 'react';
import {observer} from 'mobx-react';
import AppState, {Item} from './state';


@observer
export default class ObservedList extends React.Component<{ data: Item[], state: AppState},{}> {
  render() {
    const s = this.props.state.selection;
    return <ul>
      {this.props.data.map((d) => <li key={d.refsnpId} className={s.indexOf(d) >= 0 ? 'selected': ''} onClick={this.onClick.bind(this, d)}>{d.refsnpId}</li>)}
    </ul>;
  }

  private onClick(d: Item) {
    const s = this.props.state.selection;
    if (s.indexOf(d) >= 0) {
      s.splice(s.indexOf(d),1);
    } else {
      s.push(d);
    }
  }
}
