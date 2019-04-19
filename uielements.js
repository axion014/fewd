import {Group, Math as THREE_Math} from "three";

import {SpriteText2D, textAlign} from "three-text2d";

import Mikan from "mikan.js";

import {Rectangle} from "./geometries";
import {define, defineAccessor} from "./utils";
import Element from "./element";
import {hitTestRectangle} from './hittest';

const fontHeightCache = {};
function getFontHeight(fontStyle) {
  let result = fontHeightCache[fontStyle];
  if (!result) {
    const body = document.getElementsByTagName('body')[0];
    const dummy = document.createElement('div');
    const dummyText = document.createTextNode('MÉq');
    dummy.appendChild(dummyText);
    dummy.setAttribute('style', "font:" + fontStyle + ";position:absolute;top:0;left:0");
    body.appendChild(dummy);
    result = dummy.offsetHeight;
    fontHeightCache[fontStyle] = result;
    body.removeChild(dummy);
  }
  return result;
}

class ModifiedSpriteText2D extends SpriteText2D {
	constructor(text, options) {
		options = options || {};
		super(text || " ", Object.assign({
			align: textAlign.center,
			fillStyle: 'hsla(0, 0%, 0%, 0.6)',
			font: "32px 'HiraKakuProN-W3'"
		}, options));
		// Can't put this in prototype because Object3D defines this in the constructor
		defineAccessor(this, "rotation", {
			get() {return this.material.rotation},
			set(v) {this.material.rotation = v}
		});
		if (options.rotation) this.rotation = options.rotation;
		this.opacity = options.opacity;
		this.hitTest = hitTestRectangle;
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
}

function MultilineSpriteText2D(text, options) {
	this.width = options.width;
	this.lineHeight = options.lineHeight;
	SpriteText2D.apply(this, arguments);
	const self = this;
	this.canvas.drawText = function (text, ctxOptions) {
		const lineHeight = getFontHeight(ctxOptions.font);
		const words = /\S/.test(text) ? Mikan.split(text) : [];
		let width = 0;
		const lines = [];
		let lineIndex = 0;
		lines[lineIndex] = "";
		words.forEach(word => {
			const wordWidth = this.ctx.measureText(word).width;
			if (self.width - width >= wordWidth) {
				lines[lineIndex] += word;
				width += wordWidth;
			} else {
				lineIndex++;
				lines[lineIndex] = word;
				width = 0;
			}
		});
		this.textWidth = 0;
		lines.forEach(line => this.textWidth = Math.max(this.textWidth, Math.ceil(this.ctx.measureText(line).width)));
		this.textHeight = lineHeight * self.lineHeight * lines.length;
		this.canvas.width = Math.max(1, THREE_Math.ceilPowerOfTwo(this.textWidth));
		this.canvas.height = Math.max(1, THREE_Math.ceilPowerOfTwo(this.textHeight));
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.font = ctxOptions.font;
		this.ctx.fillStyle = ctxOptions.fillStyle;
		this.ctx.textAlign = 'left';
		this.ctx.textBaseline = 'top';
		this.ctx.shadowColor = ctxOptions.shadowColor || 'transparent';
		this.ctx.shadowBlur = ctxOptions.shadowBlur;
		this.ctx.shadowOffsetX = ctxOptions.shadowOffsetX;
		this.ctx.shadowOffsetY = ctxOptions.shadowOffsetY;
		let y = 0;
		lines.forEach(line => {
	    this.ctx.fillText(line, 0, y);
			y += lineHeight * self.lineHeight;
		});
    return this.canvas;
	};
	return this;
}

MultilineSpriteText2D.prototype = Object.create(ModifiedSpriteText2D.prototype);

define(MultilineSpriteText2D.prototype, "width", null);

export class Label extends ModifiedSpriteText2D {
	constructor(text, options) {
		super(text || " ", Object.assign({
			align: textAlign.center,
			fillStyle: 'hsla(0, 0%, 0%, 0.6)',
			font: "32px 'HiraKakuProN-W3'"
		}, options));
	}
}

export class LabelArea extends MultilineSpriteText2D {
	constructor(text, options) {
		super(text, Object.assign({
			align: textAlign.center,
			fillStyle: 'hsla(0, 0%, 0%, 0.6)',
			font: "32px 'HiraKakuProN-W3'",
			lineHeight: 1.2
		}, options));
	}
}

export class Gauge extends Element {
	constructor(options) {
		options = options || {};

		super(new Group(), options);

		this.background = new Rectangle({
			width: 1,
			height: 1,
			fillColor: options.fillColor,
			fillOpacity: options.fillOpacity,
			strokeColor: options.strokeColor,
			strokeOpacity: options.strokeOpacity,
			strokeWidth: options.strokeWidth
		}).nativeContent;
		this.nativeContent.add(this.background);

  	this.foreground = new Rectangle({
			width: options.value / options.maxValue,
			height: 1,
			fillColor: options.gaugeColor,
			opacity: options.gaugeOpacity
		}).nativeContent;
  	this.foreground.position.z = 0.0001;
		this.nativeContent.add(this.foreground);

		this.maxValue = options.maxValue;
		this.hitTest = hitTestRectangle;
	}
	get width() {return this.nativeContent.scale.x}
	set width(v) {this.nativeContent.scale.x = v}

	get height() {return this.nativeContent.scale.y}
	set height(v) {this.nativeContent.scale.y = v}

	get value() {this.foreground.width * this.maxValue}
	set value(v) {
		this.foreground.width = v / this.maxValue;
		this.foreground.x = -(1 - this.foreground.width) / 2
	}

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
}

export class DebugTexts extends Group {
	constructor(options) {
		options = options || {};
		super(options);
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

export {textAlign};
