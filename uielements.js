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

function MultilineSpriteText2D(text, options) {
	options = options || {};

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

MultilineSpriteText2D.prototype = Object.create(SpriteText2D.prototype);

define(MultilineSpriteText2D.prototype, "width", null);

export class Label extends SpriteText2D {
	constructor(text, options) {
		super(text || " ", Object.assign({
			align: textAlign.center,
			fillStyle: 'hsla(0, 0%, 0%, 0.6)',
			font: "32px 'HiraKakuProN-W3'"
		}, options));
		this.opacity = options ? options.opacity : 1;
		this.hitTest = hitTestRectangle;
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
		this.opacity = options ? options.opacity : 1;
		this.hitTest = hitTestRectangle;
	}
}

export class Gauge extends Element {
	constructor(options) {
		options = options || {};

		const group = new Group();

		const background = new Rectangle({
			width: 1,
			height: 1,
			fillColor: options.fillColor,
			strokeColor: options.strokeColor
		});
		group.add(background);

  	const foreground = new Rectangle({
			width: options.value / options.maxValue,
			height: 1,
			fillColor: options.gaugeColor
		});
  	foreground.position.z = 0.0001;
		group.add(foreground);

		super(group, options);

		this.maxValue = options.maxValue;
		this.hitTest = hitTestRectangle;
	}
}

defineAccessor(Gauge.prototype, "width", {
	get() {return this.nativeContent.scale.x},
	set(v) {this.nativeContent.scale.x = v}
});
defineAccessor(Gauge.prototype, "height", {
	get() {return this.nativeContent.scale.y},
	set(v) {this.nativeContent.scale.y = v}
});
defineAccessor(Gauge.prototype, "value", {
	get() {this.foreground.width * this.maxValue},
	set(v) {
		foreground.width = v / this.maxValue;
		foreground.x = -(1 - foreground.width) / 2
	}
});
defineAccessor(Gauge.prototype, "fillOpacity", {
	get() {return this.background.fillOpacity},
	set(v) {this.background.fillOpacity = v}
});
defineAccessor(Gauge.prototype, "strokeOpacity", {
	get() {return this.background.strokeOpacity},
	set(v) {this.background.strokeOpacity = v}
});
defineAccessor(Gauge.prototype, "gaugeOpacity", {
	get() {return this.foreground.opacity},
	set(v) {this.foreground.opacity = v}
});
defineAccessor(Gauge.prototype, "strokeWidth", {
	get() {return this.background.strokeWidth},
	set(v) {this.background.strokeWidth = v}
});
defineAccessor(Gauge.prototype, "fillColor", {
	get() {return this.background.fillColor},
	set(v) {this.background.fillColor = v}
});
defineAccessor(Gauge.prototype, "strokeColor", {
	get() {return this.background.strokeColor},
	set(v) {this.background.strokeColor = v}
});
defineAccessor(Gauge.prototype, "gaugeColor", {
	get() {return this.foreground.fillColor},
	set(v) {this.foreground.fillColor = v}
});


export {textAlign};
