/**
 * Created by sam on 26.01.2017.
 */
import * as React from 'react';
import {observer} from 'mobx-react';
import AppState from './state';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Subheader from 'material-ui/Subheader';
import {List, ListItem} from 'material-ui/List';

@observer
export default class SelectionInfo extends React.Component<{state: AppState},{}> {
  render() {
    const {selection} = this.props.state;
    return <MuiThemeProvider>
      <List>
        <Subheader>Selection Info</Subheader>
        { selection.map((s) => <ListItem primaryText={s.refsnpId} key={s.refsnpId}/>) }
      </List>
    </MuiThemeProvider>;
  }
}
