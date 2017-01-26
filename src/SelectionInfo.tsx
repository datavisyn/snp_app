/**
 * Created by sam on 26.01.2017.
 */
import * as React from 'react';
import {action} from 'mobx';
import {observer} from 'mobx-react';
import AppState,{Item} from './state';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Subheader from 'material-ui/Subheader';
import {List, ListItem} from 'material-ui/List';
import IconButton from 'material-ui/IconButton';

@observer
export default class SelectionInfo extends React.Component<{state: AppState},{}> {
  render() {
    const {bookmarks} = this.props.state;
    return <MuiThemeProvider>
      <List>
        <Subheader>Selection Info</Subheader>
        { bookmarks.map((s) => <ListItem primaryText={s.refsnpId} key={s.refsnpId} rightIconButton={<IconButton iconClassName="fa fa-remove" onClick={this.onRemove.bind(this, s)} />} />) }
      </List>
    </MuiThemeProvider>;
  }

  @action
  private onRemove(s: Item) {
    const {bookmarks} = this.props.state;
    bookmarks.splice(bookmarks.indexOf(s),1);
  }
}
