import {Group, Vector2, Vector3, Vector4, Matrix3} from "three";

import Element from "./element";

export default class Infiniteof extends Element {
	constructor(generator, interval, options) {
		options = Object.assign({}, options);
		if (!options.margin) options.margin = new Vector4(0, 0, 0, 0); // margin in CSS order(top - right - bottom - left)
		super(null, options);
		this.interval = interval;
		this.margin = options.margin;
		const position1 = new Vector3();
		const position2 = new Vector3();
		const globalInterval = new Vector2();
		const currentPosition = new Vector3();
		const matrix = new Matrix3();
		this.nodes = [];
		this.nodes.offset = 0;

		const addRange = (start, end) => {
			currentPosition.set(this.interval.x, this.interval.y, 0).multiplyScalar(start);
			this.nodes.length += end - start;
			this.nodes.copyWithin(end, start, start - end);
			if (start < this.nodes.offset) this.nodes.offset = start;
			for(let i = start; i <= end; currentPosition.x += this.interval.x, currentPosition.y += this.interval.y, i++) {
				const node = generator(i);
				this.add(node);
				node.position.copy(currentPosition);
				this.nodes[i - this.nodes.offset] = node;

				// update before it gets rendered for the first time
				node.dispatchEvent({type: 'update'});
				if (node.update) node.update();
			}
		};

		this.addEventListener('render', e => {
			if (this.interval.x > 0 === this.interval.y > 0) {
				position1.set(-this.margin.w, this.margin.x, 0); // upperleft
				position2.set(this.margin.y, -this.margin.z, 0); // lowerright
			} else {
				position1.set(this.margin.y, this.margin.x, 0); // upperright
				position2.set(-this.margin.w, -this.margin.z, 0); // lowerleft
			}
			this.localToWorld(position1);
			this.localToWorld(position2);

			globalInterval.set(this.interval.x, this.interval.y);
			matrix.setFromMatrix4(this.matrixWorld); // ignore translation
			globalInterval.applyMatrix3(matrix);

			const top = e.scene.height / 2;
			const right = e.scene.width / 2;
			const bottom = -top;
			const left = -right;
			const horizontalStart = globalInterval.x > 0 ? left : right;
			const horizontalEnd = globalInterval.x > 0 ? right : left;
			const verticalStart = globalInterval.y > 0 ? bottom : top;
			const verticalEnd = globalInterval.y > 0 ? top : bottom;

			const lowerBound = Math.floor(Math.max(
				globalInterval.x !== 0 ? (horizontalStart - Math[globalInterval.x > 0 ? "max" : "min"](position1.x, position2.x)) / globalInterval.x : -Infinity,
				globalInterval.y !== 0 ? (verticalStart - Math[globalInterval.y > 0 ? "max" : "min"](position1.y, position2.y)) / globalInterval.y : -Infinity
			));
			const upperBound = Math.ceil(Math.min(
				globalInterval.x !== 0 ? (horizontalEnd - Math[globalInterval.x > 0 ? "min" : "max"](position1.x, position2.x)) / globalInterval.x : Infinity,
				globalInterval.y !== 0 ? (verticalEnd - Math[globalInterval.y > 0 ? "min" : "max"](position1.y, position2.y)) / globalInterval.y : Infinity
			));

			// extend
			if (lowerBound < this.upperBound && upperBound > this.lowerBound) {
				// Old boundary overraps new ones. Reuse the nodes.
				if (lowerBound < this.lowerBound) addRange(lowerBound, this.lowerBound - 1);
				if (upperBound > this.upperBound) addRange(this.upperBound + 1, upperBound);
			} else {
				addRange(lowerBound, upperBound);
			}

			// trim
			for (let i = this.nodes.length + this.nodes.offset - 1; i > upperBound; i--) {
				const node = this.nodes[i - this.nodes.offset];
				node && node.remove();
			}
			for (let i = lowerBound; i >= this.nodes.offset; i--) {
				const node = this.nodes[i - this.nodes.offset];
				node && node.remove();
			}
			this.nodes.offset = lowerBound;
	    this.nodes.length = upperBound - lowerBound + 1;

			this.lowerBound = lowerBound;
			this.upperBound = upperBound;
	  });
	}
  /*
   * Remove every generated instances and have the generator function make them again.
   */
  refresh() {
    this.lowerBound = Infinity;
    this.upperBound = -Infinity;
		for (let i = this.nodes.length - 1; i >= 0; i--) this.nodes[i].remove();
		this.nodes.length = 0;
		this.nodes.offset = 0;
  }
}
