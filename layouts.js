import Element from "./element";
import {define} from "./utils";
import {TOP, LEFT, CENTER} from "./constants";

const lengthChangedEvent = {type: "lengthchanged"};

export class List extends Element {
	constructor(vertical, padding, options) {
		options = options || {};
		super(null, options);
		this.vertical = vertical;
    this.padding = padding;
		if (!options.origin) this.origin = vertical ? TOP : LEFT;
		this.addEventListener("render", () => {
			let length = 0;
			for (const child of this.children) {
				if (child.visible === false && !child.interactive) continue;
				const w = child.width * child.scale.x;
				const h = -child.height * child.scale.y;
				const origin = child.origin || CENTER;

				length += this.vertical ? h * (1 - origin.y) : w * origin.x;
				if (this.vertical) child.position.y = length;
				else child.position.x = length;
				length += (this.vertical ? h * origin.y - this.padding: w * (1 - origin.x) + this.padding);
			}
			if (this.vertical) {
				const old = this.height;
				this.height = -length - this.padding;
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

export function setupLayoutExpression(element, initialRules) {
	element.rules = initialRules || {};
	element.addEventListener('render', e => {
		for (const k of Object.keys(element.rules)) element[k] = element.rules[k](e);
	});
}