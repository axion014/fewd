import {Group, Math as THREE_Math} from "three";

import {SpriteText2D, textAlign} from "three-text2d";

import Mikan from "mikan.js";

import {Rectangle} from "./geometries";
import {defineAccessor, connect} from "./utils";
import Element from "./element";
import {hitTestRectangle} from './hittest';
import {CENTER} from "./constants";
import Scene from "./scene";
import {renderFrameBuffer} from "./main";

class ModifiedSpriteText2D extends SpriteText2D {
	constructor(text, options) {
		options = options || {};
		super(text, Object.assign({
			align: textAlign.center,
			fillStyle: 'hsla(0, 0%, 0%, 0.6)',
			font: "32px 'HiraKakuProN-W3'"
		}, options));
		// Can't put this in prototype because Object3D defines this in the constructor
		connect(this, "rotation", this.material);
		if (options.rotation) this.rotation = options.rotation;
		this.opacity = options.opacity;
		this.hitTest = hitTestRectangle;
		if (options.x) this.x = options.x;
		if (options.y) this.y = options.y;
		if (options.z) this.z = options.z;
		this.origin = options.origin || CENTER;
	}

	get x() {return this.position.x}
	set x(v) {this.position.x = v}

	get y() {return this.position.y}
	set y(v) {this.position.y = v}

	get z() {return this.position.z}
	set z(v) {this.position.z = v}
}

export class Label extends ModifiedSpriteText2D {
	constructor(text, options) {
		super(text, Object.assign({
			align: textAlign.center,
			fillStyle: 'hsla(0, 0%, 0%, 0.6)',
			font: "32px 'HiraKakuProN-W3'"
		}, options));
	}
}

export class LabelArea extends ModifiedSpriteText2D {
	constructor(text, options) {
		super(text, Object.assign({
			align: textAlign.center,
			fillStyle: 'hsla(0, 0%, 0%, 0.6)',
			font: "32px 'HiraKakuProN-W3'",
			lineHeight: 1.2
		}, options));
		this.width = options.width;
	}
	_wrapText(text) {
		let wrappedText = "";
		for (let line of text.split("\n")) {
			if (/\S/.test(line)) {
				let width = 0;
				for (let word of Mikan.split(line)) {
					const wordWidth = this.canvas.ctx.measureText(word).width;
					if (this.width - width >= wordWidth) {
						wrappedText += word;
						width += wordWidth;
					} else {
						wrappedText += "\n" + word;
						width = wordWidth;
					}
				}
			}
			wrappedText += "\n";
		}
		return wrappedText;
	}
}

defineAccessor(LabelArea.prototype, "width", {
	get: function() {
		return this._width;
	},
	set: function(value) {
		if (this._width !== value) {
			this._width = value;
			this._text = this._wrapText(this.text);
			this.updateText();
		}
	}
});
defineAccessor(LabelArea.prototype, "text", {
	get: function() {
		return this._originalText;
	},
	set: function(value) {
		if (this._originalText !== value) {
			this._originalText = value;
			this._text = this._wrapText(value);
			this.updateText();
		}
	}
});

export class Gauge extends Element {
	constructor(options) {
		options = Object.assign({interaction: "absolute"}, options);

		super(new Group(), options);

		this.background = new Rectangle({
			width: 1,
			height: 1,
			fillColor: options.fillColor,
			fillOpacity: options.fillOpacity,
			strokeColor: options.strokeColor,
			strokeOpacity: options.strokeOpacity,
			strokeWidth: options.strokeWidth
		});
		this.nativeContent.add(this.background);

		this.minValue = options.minValue || 0;
		this.maxValue = options.maxValue;
		this._value = options.value;
		this.interaction = options.interaction;
		this.interactive = false;

		let currentPointer, previousPosition;

		this.addEventListener('pointstart', e => {
			currentPointer = e.identifier;
			previousPosition = e.localX;
			e.startTracking();
		});

		this.addEventListener('pointmove', e => {
			if (e.identifier === currentPointer) {
				let value;
				if (this._interaction.type === "absolute") {
					value = (e.localX / this.width + 0.5) * (this.maxValue - this.minValue) + this.minValue;
				} else {
					value = this.value + (e.localX - previousPosition) * this._interaction.sensivity;
					previousPosition = e.localX;
				}
				this.value = Math.min(Math.max(value, this.minValue), this.maxValue);
			}
		});

  	this.foreground = new Rectangle({
			width: this.rate,
			height: 1,
			fillColor: options.gaugeColor,
			opacity: options.gaugeOpacity
		});
		this.foreground.position.x = -(1 - this.foreground.width) / 2;
  	this.foreground.position.z = 0.0001;
		this.nativeContent.add(this.foreground);

		this.hitTest = hitTestRectangle;
	}
	get width() {return this.nativeContent.scale.x}
	set width(v) {this.nativeContent.scale.x = v}

	get height() {return this.nativeContent.scale.y}
	set height(v) {this.nativeContent.scale.y = v}

	get value() {return this._value}
	set value(v) {
		this._value = v;
		this.foreground.width = this.rate;
		this.foreground.position.x = -(1 - this.foreground.width) / 2;
		this.dispatchEvent({type: "changed"});
	}

	get rate() {return (this._value - this.minValue) / (this.maxValue - this.minValue)}

	get fillOpacity() {return this.background.fillOpacity}
	set fillOpacity(v) {this.background.fillOpacity = v}

	get strokeOpacity() {return this.background.strokeOpacity}
	set strokeOpacity(v) {this.background.strokeOpacity = v}

	get gaugeOpacity() {return this.foreground.opacity}
	set gaugeOpacity(v) {this.foreground.opacity = v}

	get strokeWidth() {return this.background.strokeWidth}
	set strokeWidth(v) {this.background.strokeWidth = v}

	get fillColor() {return this.background.fillColor}
	set fillColor(v) {this.background.fillColor = v}

	get strokeColor() {return this.background.strokeColor}
	set strokeColor(v) {this.background.strokeColor = v}

	get gaugeColor() {return this.foreground.fillColor}
	set gaugeColor(v) {this.foreground.fillColor = v}

	get interaction() {return this._interaction}
	set interaction(v) {
		if (typeof v === "string") v = {type: v};
		if (v.type === "absolute") {
		} else if (v.type === "relative") {
			if (!v.sensivity) v.sensivity = 1;
		} else throw new Error("invaild interaction type");
		this._interaction = v;
	}
}

export class DebugTexts extends Element {
	constructor(options) {
		options = options || {};
		super(null, options);
		this.labels = {};
		this.font = options.font || "16px 'HiraKakuProN-W3'";
		this.lineHeight = options.lineHeight || 24;
	}
	set(id, text) {
		text = `${id}: ${text}`;
		if (this.labels[id]) {
			this.labels[id].text = text;
			return;
		}
		const label = new Label(text, {
			align: textAlign.left, font: this.font,
			fillStyle: 'hsla(0, 0%, 0%, 0.8)', y: -this.children.length * this.lineHeight
		});
		this.add(label);
		this.labels[id] = label;
	}
	get parent() {return this._parent}
	set parent(v) {
		this._parent = v;
		if (!v) return;
		for (; v.parent || v._meta; v = v.parent || v._meta);
		v.debug = this.set.bind(this);
	}
}

export class Screen extends Rectangle {
	constructor(options) {
		options = Object.assign({fillColor: 0xffffff}, options);
		super(options);
		this.content = new Scene(this);
		this.content.frame = this;
		this.scroll = this.content.UICamera.position;
		this.buffer = null;

		this.addEventListener('render', () => {
			this.buffer = renderFrameBuffer(this.content, this.buffer);
			this.nativeContent.fill.material.map = this.buffer.texture;
		});

		['pointstart', 'pointmove', 'pointend', 'click'].forEach(name => {
			this.addEventListener(name, e => {
				this.content.dispatchEvent(e);
			});
		});
	}

	update(e) {
		this.content.update(e.deltaTime);
	}
}

export {textAlign};
