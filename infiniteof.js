import {Group} from "three";

import Element from "./element";
import {vw, vh} from "./main";

export default class Infiniteof extends Element {
	constructor(generator, interval, options) {
		super(new Group(), options);
		this.addEventListener('render', () => {
	    const globalpos = this.localToWorld(this.position);
	    const backrate = -Math.floor(Math.min((globalpos.x - (interval.x < 0 ? vw : 0)) / interval.x,
				(globalpos.y - (interval.y < 0 ? vh : 0)) / interval.y));

	    const base = interval.clone().multiplyScalar(backrate + 1);
			let i = -1;
	    for(const pos = interval.clone().multiplyScalar(backrate - 1);
					pos.x - base.x < vw && pos.x - base.x > -vw && pos.y - base.y < vh && pos.y - base.y > -vh;
	        pos.add(this.pitch), i++) {
	      if (i + backrate >= this.nodemin && i + backrate < this.nodemax) continue;
	      const node = this.add(generator(i + backrate));
	      node.position = pos.clone();
	      node._i = i + backrate;

				// update before it gets rendered for the first time
	      node.dispatchEvent({type: 'update'});
				node.update();
	    }
	    this.nodemin = backrate - 1;
	    this.nodemax = i + backrate;
	    for (const child of this.children) {
	      if (child._i < this.nodemin || child._i > this.nodemax) child.remove();
	    }
	  });
	}
  /*
   * Remove every generated instances and have the generator function make them again.
   */
  refresh() {
    this.nodemin = Infinity;
    this.nodemax = -Infinity;
		for (const child of this.children) child.remove();
  }
}
