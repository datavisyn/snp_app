import * as React from 'react';
import UIDialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Anatomogram from 'datavisyn-anatomogram/src/react';
import bundled from 'datavisyn-anatomogram/src/loader';
import {observable, action} from 'mobx';

import * as injectTapEventPlugin from 'react-tap-event-plugin';
import {observer} from 'mobx-react/native';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const customStyle = {
  width: '500px',
  height: '500px'
};

@observer
export default class Dialog extends React.Component<undefined, undefined> {

  @observable showDialog: boolean = false;

  @action
  toggleDialog() {
    this.showDialog = !this.showDialog;
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.toggleDialog.bind(this)}
      />
    ];

    return (
      <div>
        <MuiThemeProvider>
          <FlatButton label="Open Anatomogram" primary={true} onClick={this.toggleDialog.bind(this)}/>
        </MuiThemeProvider>
        <MuiThemeProvider>
          <UIDialog title="Anatomogram" open={this.showDialog} actions={actions} contentStyle={customStyle}>
            <Anatomogram species="homo sapiens.male" selectClass="datavisyn-selected" imageLoader={bundled}
                         defaultClass="datavisyn-default"/>
          </UIDialog>
        </MuiThemeProvider>
      </div>
    );
  }
}
