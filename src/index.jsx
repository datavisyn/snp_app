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
/**
 * author:  Samuel Gratzl
 * email:   samuel_gratzl@gmx.at
 * created: 2016-10-28T11:19:52.797Z
 */
//copy index.html
require("file-loader?name=index.html!./index.html");
//include styles
require("font-awesome/scss/font-awesome.scss");
require("./style.scss");
/* tslint:disable */
var React = require("react");
/* tslint:enable */
var react_dom_1 = require("react-dom");
var ItemScatterplot_1 = require("./ItemScatterplot");
var src_1 = require("datavisyn-scatterplot-react/src");
var ManhattanPlot_1 = require("datavisyn-scatterplot-react/src/ManhattanPlot");
var ItemLineUp_1 = require("./ItemLineUp");
var lineup_1 = require("lineupjs/src/lineup");
var state_1 = require("./state");
var d3_array_1 = require("d3-array");
var mobx_react_1 = require("mobx-react");
var state = new state_1.default();
var ACGT = [
    { label: 'c', color: 'red' },
    { label: 't', color: 'cyan' },
    { label: 'a', color: 'blue' },
    { label: 'g', color: 'yellow' }
];
function toState(raw) {
    var data = raw.map(function (r) { return new state_1.Item(r); });
    var chromStartExtent = d3_array_1.extent(data, function (d) { return d.chromStart; });
    var pvalMin = Math.min(50, d3_array_1.max(data, function (d) { return d.mlogpval; })); // rounding error
    var desc = [
        { type: 'string', column: 'refsnpId' },
        { type: 'string', column: 'chrName' },
        { type: 'number', column: 'chromStart', domain: chromStartExtent },
        { type: 'categorical', column: 'allele1', categories: ACGT },
        { type: 'categorical', column: 'allele2', categories: ACGT },
        { type: 'number', column: 'freqA1', domain: d3_array_1.extent(data, function (d) { return d.freqA1; }) },
        { type: 'number', column: 'beta', domain: d3_array_1.extent(data, function (d) { return d.beta; }) },
        { type: 'number', column: 'se', domain: d3_array_1.extent(data, function (d) { return d.se; }) },
        { type: 'number', column: 'mlogpval', domain: [0, pvalMin] },
        { type: 'number', column: 'pval', domain: d3_array_1.extent(data, function (d) { return d.pval; }) },
        { type: 'number', column: 'N', domain: d3_array_1.extent(data, function (d) { return d.N; }) }
    ];
    lineup_1.deriveColors(desc);
    var options = {
        x: function (d) { return d.chromStart; },
        y: function (d) { return d.mlogpval; },
        xscale: src_1.scale.scaleLinear().domain(chromStartExtent),
        yscale: src_1.scale.scaleLinear().domain([0, pvalMin]).clamp(true)
    };
    return { data: data, options: options, desc: desc };
}
var ObservedRootElement = (function (_super) {
    __extends(ObservedRootElement, _super);
    function ObservedRootElement() {
        return _super.apply(this, arguments) || this;
    }
    ObservedRootElement.prototype.render = function () {
        return <section>
      <header>
        <ManhattanPlot_1.default serverUrl=".." onSignificanceChanged={this.onSignificanceChanged.bind(this)} onWindowChanged={this.onWindowChanged.bind(this)}/>
        <button onClick={this.onLoad.bind(this)}>Load Window</button>
      </header>
      <section>
        <section>
          {this.state && this.state.data &&
            <ItemScatterplot_1.default data={this.state.data} state={this.props.state} options={this.state.options} chromosome={"Chromosome " + this.state.data[0].chrName}/>}
        </section>
        <section>
          {this.state && this.state.data &&
            <ItemLineUp_1.default data={this.state.data} desc={this.state.desc} state={this.props.state}/>}
        </section>
      </section>
    </section>;
    };
    ObservedRootElement.prototype.onLoad = function () {
        var _this = this;
        var w = state.window;
        var significance = state.significance;
        if (w) {
            console.log('get data');
            self.fetch("../data?fromChromosome=" + w.fromChromosome + "&fromLocation=" + w.fromLocation + "&toChromosome=" + w.toChromosome + "&toLocation=" + w.toLocation + "&geqSignificance=" + significance)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                _this.setState(toState(data));
            });
        }
    };
    ObservedRootElement.prototype.onSignificanceChanged = function (sig) {
        this.props.state.significance = sig;
    };
    ObservedRootElement.prototype.onWindowChanged = function (fromChromosome, fromLocation, toChromosome, toLocation) {
        this.props.state.window = { fromChromosome: fromChromosome, fromLocation: fromLocation, toChromosome: toChromosome, toLocation: toLocation };
    };
    return ObservedRootElement;
}(React.Component));
ObservedRootElement = __decorate([
    mobx_react_1.observer
], ObservedRootElement);
react_dom_1.render(<ObservedRootElement state={state}/>, document.querySelector('main'));
