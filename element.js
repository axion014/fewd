import {Group} from "three";

import {defineAccessor} from "./utils";

export default class Element extends Group {
	constructor(nativeContent, options) {
		super();
		if (nativeContent) {
			this.add(nativeContent);
			this.nativeContent = nativeContent;
			this.selfOpacity = options.selfOpacity;
		}
		this.opacity = options.opacity;
		if (options.visible !== undefined) this.visible = options.visible;
		if (options.width !== undefined) this.width = options.width;
		if (options.height !== undefined) this.height = options.height;

		// Can't put this in prototype because Object3D defines this in the constructor
		defineAccessor(this, "rotation", {
			get() {return this._rotation},
			set(v) {
				this._rotation = v;
				this.quaternion.set(0, 0, 0, 1);
				this.rotateZ(v);
			}
		});
		this.rotation = options.rotation || 0;
		if (options.x !== undefined) this.x = options.x;
		if (options.y !== undefined) this.y = options.y;
		if (options.z !== undefined) this.z = options.z;
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
