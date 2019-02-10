import {Group} from "three";

import {defineAccessor, connect} from "./utils";
import {rotateZ} from "./threeutil";

export default class Element extends Group {
	constructor(nativeContent, options) {
		super();
		this.add(nativeContent);
		if (!options.customScale) {
			nativeContent.scale.x = options.width;
			nativeContent.scale.y = options.height;
			connect(this, "width", nativeContent.scale, "x");
			connect(this, "height", nativeContent.scale, "y");
		}
		this.opacity = options.opacity;
		connect(this, "selfOpacity", nativeContent, "opacity");
		nativeContent.opacity = options.selfOpacity;
		let rotation;
		defineAccessor(this, "rotation", {
			get() {return rotation;},
			set(v) {
				rotation = v;
				this.quaternion.set(0, 0, 0, 1);
				rotateZ(this, rotation);
			}
		});
		this.rotation = options.rotation || 0;
	}
}
