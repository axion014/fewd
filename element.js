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

		defineAccessor(this, "rotation", {
			get() {return this._rotation},
			set(v) {
				this._rotation = v;
				this.quaternion.set(0, 0, 0, 1);
				rotateZ(this, v);
			}
		});
		this.rotation = options.rotation || 0;
		if (options.x) this.x = options.x;
		if (options.y) this.y = options.y;
		if (options.z) this.z = options.z;
	}

	get x() {return this.position.x}
	set x(v) {this.position.x = v}

	get y() {return this.position.y}
	set y(v) {this.position.y = v}

	get z() {return this.position.z}
	set z(v) {this.position.z = v}

	get selfOpacity() {return this.nativeContent.opacity}
	set selfOpacity(v) {this.nativeContent.opacity = v}
}
