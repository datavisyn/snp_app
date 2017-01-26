/**
 * Created by sam on 29.10.2016.
 */

import {observable, computed} from 'mobx';
import {IWindow} from './ManhattanPlot';


export const ACGT = [
  {label: 'c', color: 'red'},
  {label: 't', color: 'cyan'},
  {label: 'a', color: 'blue'},
  {label: 'g', color: 'yellow'}];

export class Item {
  readonly refsnpId: string;
  readonly chrName: string;
  readonly chromStart: number;
  readonly absChromStart: number;
  readonly allele1: string;
  readonly allele2: string;
  readonly freqA1: number;
  readonly beta: number;
  readonly se: number;
  readonly pval: number;
  readonly N: number;

  constructor(item: any) {
    this.refsnpId = item.refsnp_id;
    this.chrName = item.chr_name;
    this.chromStart = parseInt(item.chrom_start, 10);
    this.absChromStart = parseInt(item.abs_chrom_start, 10);
    this.allele1 = item.allele1;
    this.allele2 = item.allele2;
    this.freqA1 = parseFloat(item.freqA1);
    this.beta = parseFloat(item.beta);
    this.se = parseFloat(item.se);
    this.pval = parseFloat(item.pval);
    this.N = parseInt(item.N, 10);
  }

  get mlogpval() {
    return -Math.log(this.pval) * Math.LOG10E;
  }

  isLeadSNP() {
    // TODO get real data
    return this.mlogpval > 10;
  }

  toString() {
    return `${this.refsnpId}: @${this.chrName}#${this.chromStart} p-value=${this.pval}`;
  }
}


export default class AppState {
  @observable selection: Item[] = [];
  @observable bookmarks: Item[] = [];

  @observable significance: number = 5; //10^-5
  @observable window: IWindow = null;

  @observable locusZoomOffset: number = 0;
  @observable windowLocusZoom: number[] = null;

  @observable windowManhattan: number[] = null;

  @observable filterLineUpToLocusZoomWindow: boolean = false;

  @computed
  get windowAbsoluteLocusZoom() {
    return this.windowLocusZoom ? this.windowLocusZoom.map((d) => d + this.locusZoomOffset) : null;
  }
}
