import Element from "./element";
import {define} from "./utils";

const lengthChangedEvent = {type: "lengthchanged"};

export class List extends Element {
	constructor(vertical, padding, options) {
		options = options || {};
		super(null, options);
		this.vertical = vertical;
    this.padding = padding;
		this.addEventListener("render", () => {
			let length = 0;
			for (const child of this.children) {
				if (child.visible === false && !child.interactive) return;

				length += (this.vertical ?
					-child.height * child.scale.y * 0.5 /*child.originY*/ :
					child.width * child.scale.x * 0.5 /*child.originX*/
				);
				if (this.vertical) {
					child.position.y = length;
				} else {
					child.position.x = length;
				}
				length += (this.vertical ?
					-child.height * child.scale.y * 0.5 /*(1 - child.originY)*/ :
					child.width * child.scale.x * 0.5 /*(1 - child.originX)*/
				) + this.padding;
			}
			if (this.vertical) {
				const old = this.height;
				this.height = length - this.padding;
				if (this.height !== old) this.dispatchEvent(lengthChangedEvent);
			} else {
				const old = this.width;
				this.width = length - this.padding;
				if (this.width !== old) this.dispatchEvent(lengthChangedEvent);
			}
		});
	}
}

define(List.prototype, "width", undefined);
define(List.prototype, "height", undefined);