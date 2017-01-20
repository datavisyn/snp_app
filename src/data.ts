/**
 * author:  Samuel Gratzl
 * email:   samuel_gratzl@gmx.at
 * created: 2016-12-07T13:38:55.615Z
 */

import * as species from './resources/json/svgsForSpecies.json';
import * as idsMap from './resources/json/idsForSvgs.json';

const homoSapiensKey = "homo sapiens";

const humanSVGs = {
  male: species[homoSapiensKey].male,
  female: species[homoSapiensKey].female
};

export class Species {
  readonly name: string;
  readonly ids: string[];

  constructor(name: string, private file: string, ids: string[]) {
    this.name = name;
    this.ids = ids;
  }

  /**
   * load the underlying svg data
   */
  load(): Promise<string> {
    return System.import(`!!raw-loader!./resources/svg/human_male.svg`);
  }
}

/**
 * list of all known species
 * @type {Array}
 */
const list : Species[]= [];
export default list;

Object.keys(humanSVGs).forEach((k) => {
  list.push(new Species(k, humanSVGs[k], idsMap[humanSVGs[k]]));
});
