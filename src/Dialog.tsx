import * as React from 'react';
import AppState from './state';
import UIDialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Anatomogram from './Anatomogram';


export default class Dialog extends React.Component<{showDialog: boolean, toggleDialog: () => void, state: AppState}, undefined> {

  closeDialog() {
    this.props.toggleDialog();
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.closeDialog.bind(this)}
      />
    ];

    const customStyle = {
      width: "500px",
      height: "600px"
    }

    return (
      <MuiThemeProvider>
        <UIDialog title="Anatomogram" open={this.props.showDialog} actions={actions} contentStyle={customStyle}>
          <Anatomogram/>
        </UIDialog>
      </MuiThemeProvider>
    );
  }
}
