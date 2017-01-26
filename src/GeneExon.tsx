/**
 * Created by sam on 16.01.2017.
 */

import * as React from 'react';
import {observer} from 'mobx-react';
import AppState from './state';
import GeneExon, {IGene} from 'datavisyn-scatterplot-react/src/GeneExon';

export {IGene} from 'datavisyn-scatterplot-react/src/GeneExon';


@observer
export default class ObservedGeneExon extends React.Component<{data: IGene[], state: AppState},{}> {
  render() {
    const {data} = this.props;
    const {windowAbsoluteLocusZoom} = this.props.state;
    return <GeneExon genes={data} serverUrl="./api" absLocationMin={windowAbsoluteLocusZoom[0]} absLocationMax={windowAbsoluteLocusZoom[1]} />;
  }
}
