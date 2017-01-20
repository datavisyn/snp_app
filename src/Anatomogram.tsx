import * as React from 'react';

import { default as humans } from './data';

export type AnatomogramTissueElement = SVGElement&SVGStylable;

export default class Anatomogram extends React.Component<{}, {svgLoaded: boolean}> {

  private svg: Document;
  private tissues: AnatomogramTissueElement[];

  constructor() {
    super();

    humans[0].load().then((svg) => {
      const parser = new DOMParser();
      this.svg = parser.parseFromString(svg, 'image/svg+xml');
      this.setState({
        svgLoaded: true
      });
    });
  }

  private initializeTissues() {
    this.tissues = humans[0].ids.map((t) => {
      const tissue = this.findTissue(t);

       // reset styles
      tissue.style.fill = null;
      tissue.style.stroke = null;

      if(Math.round(Math.random()) === 0) {
        tissue.classList.add('datavisyn-default');
      }
      else {
        tissue.classList.add('datavisyn-selected');
      }


      tissue.addEventListener('mouseover', () => {
        console.log("TEST");
      });

      return tissue;
    });
  }

  private findTissue(tissue: string) {
    return (this.svg.querySelector(`#${tissue}`) as AnatomogramTissueElement);
  }

  render () {
    const svgOptions = {
      height: 500,
      width: 250
    };

    if(this.state && this.state.svgLoaded) {
      this.initializeTissues();
      this.svg.documentElement.setAttribute('viewBox', `0 0 ${svgOptions.width/2} ${svgOptions.height/2}`);
      this.svg.documentElement.setAttribute('width', `${svgOptions.width}`);
      this.svg.documentElement.setAttribute('height', `${svgOptions.height}`);

      console.log(this.svg.documentElement);

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(this.svg.documentElement);

      return <div className="datavisyn-anatomogram" dangerouslySetInnerHTML={{ __html: svgString}}></div>;
    }
    return <div>Loading anatomogram. Please wait...</div>
  }
}
