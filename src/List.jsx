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
var mobx_react_1 = require("mobx-react");
var ObservedList = (function (_super) {
    __extends(ObservedList, _super);
    function ObservedList() {
        return _super.apply(this, arguments) || this;
    }
    ObservedList.prototype.render = function () {
        var _this = this;
        var s = this.props.state.selection;
        return <ul>
      {this.props.data.map(function (d) { return <li key={d.refsnpId} className={s.indexOf(d) >= 0 ? 'selected' : ''} onClick={_this.onClick.bind(_this, d)}>{d.refsnpId}</li>; })}
    </ul>;
    };
    ObservedList.prototype.onClick = function (d) {
        var s = this.props.state.selection;
        if (s.indexOf(d) >= 0) {
            s.splice(s.indexOf(d), 1);
        }
        else {
            s.push(d);
        }
    };
    return ObservedList;
}(React.Component));
ObservedList = __decorate([
    mobx_react_1.observer
], ObservedList);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ObservedList;
