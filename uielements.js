import {Group, Math as THREE_Math} from "three";

import {SpriteText2D} from "../three-text2d/lib/SpriteText2D.js";
import {textAlign} from "../three-text2d/lib/utils.js";

import Mikan from "mikan.js";

import {createRectangle} from "./geometries";
import {define, defineAccessor, connect} from "./utils";
import {connectColor} from "./threeutil";
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

export function createLabel(text, options) {
	const element = new SpriteText2D(text || " ", Object.assign({
		align: textAlign.center,
		fillStyle: 'hsla(0, 0%, 0%, 0.6)',
		font: "32px 'HiraKakuProN-W3'"
	}, options));
	element.opacity = options ? options.opacity : 1;
	element.hitTest = hitTestRectangle;
	return element;
}

export function createLabelArea(text, options) {
	const element = new MultilineSpriteText2D(text, Object.assign({
		align: textAlign.center,
		fillStyle: 'hsla(0, 0%, 0%, 0.6)',
		font: "32px 'HiraKakuProN-W3'",
		lineHeight: 1.2
	}, options));
	element.opacity = options ? options.opacity : 1;
	element.hitTest = hitTestRectangle;
	return element;
}

export function createGauge(options) {
	const group = new Group();

	const background = createRectangle({
		width: 1,
		height: 1,
		fillColor: options.fillColor,
		strokeColor: options.strokeColor
	});
	group.add(background);

  const foreground = createRectangle({
		width: options.value / options.maxValue,
		height: 1,
		fillColor: options.gaugeColor
	});
  foreground.position.z = 0.0001;
	group.add(foreground);

	group.maxValue = options.maxValue;

	defineAccessor(group, "value", {
		get: () => foreground.width * group.maxValue,
		set: v => {
			foreground.width = v / group.maxValue;
			foreground.x = -(1 - foreground.width) / 2
		}
	});

	const element = new Element(group, options);

	connect(element, "fillColor", background);
	connect(element, "strokeColor", background);
	connectColor(element, "gaugeColor", foreground, "fillColor");
	connect(element, "fillOpacity", background, "fillOpacity");
	connect(element, "strokeOpacity", background, "strokeOpacity");
	connect(element, "gaugeOpacity", foreground, "opacity");

	element.hitTest = hitTestRectangle;

	return element;
}

export {textAlign};
