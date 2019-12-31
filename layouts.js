import {Group} from "three";

export class List extends Group {
	constructor(vertical, padding, options) {
		options = options || {};
		super();
		this.vertical = vertical;
    this.padding = padding;
		this.opacity = options.opacity;
		this.addEventListener("render", () => {
			let length = 0;
			for (const child of this.children) {
				if (child.visible === false && !child.interactive) return;

				length += (this.vertical ?
					child.height * child.scale.y * 0.5 /*child.originY*/ :
					child.width * child.scale.x * 0.5 /*child.originX*/
				);
				if (this.vertical) {
					child.y = length;
				} else {
					child.x = length;
				}
				length += (this.vertical ?
					child.height * child.scale.y * 0.5 /*(1 - child.originY)*/ :
					child.width * child.scale.x * 0.5 /*(1 - child.originX)*/
				) + this.padding;
			}
			if (this.vertical) this.height = length - this.padding;
			else this.width = length - this.padding;
		});
	}
}