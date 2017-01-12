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
var LocusZoom_1 = require("datavisyn-scatterplot-react/src/LocusZoom");
var mobx_react_1 = require("mobx-react");
var ItemLocusZoom = (function (_super) {
    __extends(ItemLocusZoom, _super);
    function ItemLocusZoom() {
        return _super.apply(this, arguments) || this;
    }
    return ItemLocusZoom;
}(LocusZoom_1.default));
var ObservedLocusZoom = (function (_super) {
    __extends(ObservedLocusZoom, _super);
    function ObservedLocusZoom() {
        return _super.apply(this, arguments) || this;
    }
    ObservedLocusZoom.prototype.render = function () {
        var selection = this.props.state.selection;
        var _a = this.props, chromosome = _a.chromosome, data = _a.data, options = _a.options;
        return <ItemLocusZoom data={data} options={options} selection={selection.slice()} onSelectionChanged={this.onSelectionChanged.bind(this)} chromosome={chromosome}/>;
    };
    ObservedLocusZoom.prototype.onSelectionChanged = function (selection) {
        this.props.state.selection = selection;
    };
    return ObservedLocusZoom;
}(React.Component));
ObservedLocusZoom = __decorate([
    mobx_react_1.observer
], ObservedLocusZoom);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ObservedLocusZoom;
