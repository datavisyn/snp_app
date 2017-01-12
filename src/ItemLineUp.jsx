/**
 * Created by sam on 29.10.2016.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var React = require("react");
var react_1 = require("lineupjs/src/react");
var mobx_react_1 = require("mobx-react");
var ItemLineUp = (function (_super) {
    __extends(ItemLineUp, _super);
    function ItemLineUp() {
        return _super.apply(this, arguments) || this;
    }
    return ItemLineUp;
}(react_1.default));
var ObservedLineUp = (function (_super) {
    __extends(ObservedLineUp, _super);
    function ObservedLineUp() {
        return _super.apply(this, arguments) || this;
    }
    ObservedLineUp.prototype.render = function () {
        var selection = this.props.state.selection;
        return <ItemLineUp data={this.props.data} desc={this.props.desc} options={{}} selection={selection.slice()} onSelectionChanged={this.onSelectionChanged.bind(this)}/>;
    };
    ObservedLineUp.prototype.onSelectionChanged = function (selection) {
        console.log('set state');
        this.props.state.selection = selection;
    };
    return ObservedLineUp;
}(React.Component));
ObservedLineUp = __decorate([
    mobx_react_1.observer
], ObservedLineUp);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ObservedLineUp;
