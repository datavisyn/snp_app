/**
 * Created by sam on 29.10.2016.
 */

import {observable} from 'mobx';

export class Item {
  readonly refsnpId: string;
  readonly chrName: string;
  readonly chromStart: number;
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

  toString() {
    return `${this.refsnpId}: @${this.chrName}#${this.chromStart} p-value=${this.pval}`;
  }
}

export interface IWindow {
  fromChromosome: string;
  fromLocation: number;
  toChromosome: string;
  toLocation: number;
}

export default class AppState {
  @observable selection: Item[] = [];

  @observable significance: number = 1;
  @observable window: IWindow = null;
}