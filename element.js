import {Group} from "three";

import {defineAccessor} from "./utils";
import {rotateZ} from "./threeutil";

export default class Element extends Group {
	constructor(nativeContent, options) {
		super();
		this.add(nativeContent);
		this.nativeContent = nativeContent;
		this.opacity = options.opacity;
		this.selfOpacity = options.selfOpacity;
		this.rotation = options.rotation || 0;
		if (options.x) this.x = options.x;
		if (options.y) this.y = options.y;
		if (options.z) this.z = options.z;
	}
}

defineAccessor(Element.prototype, "x", {
	get() {return this.position.x},
	set(v) {this.position.x = v}
});
defineAccessor(Element.prototype, "y", {
	get() {return this.position.y},
	set(v) {this.position.y = v}
});
defineAccessor(Element.prototype, "z", {
	get() {return this.position.z},
	set(v) {this.position.z = v}
});
defineAccessor(Element.prototype, "selfOpacity", {
	get() {return this.nativeContent.opacity},
	set(v) {this.nativeContent.opacity = v}
});
defineAccessor(Element.prototype, "rotation", {
	get() {return this._rotation;},
	set(v) {
		this._rotation = v;
		this.quaternion.set(0, 0, 0, 1);
		rotateZ(this, v);
	}
});
