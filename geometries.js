import {
	Mesh, Group,
	Geometry, ShapeBufferGeometry, PlaneBufferGeometry, CircleBufferGeometry,
	MeshBasicMaterial,
	Shape, Vector3
} from "three";

import {createMeshLine, setMeshLineGeometry} from "./threeutil";
import Element from "./element";
import {hitTestRectangle, hitTestEllipse} from './hittest';

const rectgeometry = new PlaneBufferGeometry(1, 1);
const rectlinegeometry = (w, h) => [-w, h, w, h, w, -h, -w, -h, -w, h];
export class Rectangle extends Element {
	constructor(options) {
		options = options || {};
		const group = new Group();
		group.fill = new Mesh(
			rectgeometry,
			new MeshBasicMaterial({color: options.fillColor})
		);
		group.fill.visible = !!options.fillColor;
		group.fill.opacity = options.fillOpacity;
		group.add(group.fill);

		group.stroke = createMeshLine(
			rectlinegeometry(options.width / 2, options.height / 2),
			{
				color: options.strokeColor,
				lineWidth: options.strokeWidth !== undefined ? options.strokeWidth : 2
			},
			true
		);
		group.stroke.visible = !!options.strokeColor;
		group.stroke.opacity = options.strokeOpacity;
		group.add(group.stroke);

		super(group, Object.assign(options, {customScale: true}));

		this.hitTest = hitTestRectangle;

		this.addEventListener("render", () => {
			if (this._dirty) setMeshLineGeometry(group.stroke, rectlinegeometry(group.fill.scale.x / 2, group.fill.scale.y / 2), true);
			this._dirty = false;
		});
	}
	get width() {return this.nativeContent.fill.scale.x}
	set width(v) {
		this.nativeContent.fill.scale.x = v;
		this._dirty = true;
	}

	get height() {return this.nativeContent.fill.scale.y}
	set height(v) {
		this.nativeContent.fill.scale.y = v;
		this._dirty = true;
	}

	get fillOpacity() {return this.nativeContent.fill.opacity}
	set fillOpacity(v) {this.nativeContent.fill.opacity = v}

	get strokeOpacity() {return this.nativeContent.stroke.opacity}
	set strokeOpacity(v) {this.nativeContent.stroke.opacity = v}

	get strokeWidth() {return this.nativeContent.stroke.material.uniforms.lineWidth.value}
	set strokeWidth(v) {this.nativeContent.stroke.material.uniforms.lineWidth.value = v}

	get fillColor() {return this.nativeContent.fill.material.color}
	set fillColor(v) {
		this.nativeContent.fill.visible = Boolean(v);
		this.nativeContent.fill.material.color.set(v);
	}

	get strokeColor() {return this.nativeContent.stroke.material.uniforms.color.value}
	set strokeColor(v) {
		this.nativeContent.stroke.visible = Boolean(v);
		this.nativeContent.stroke.material.uniforms.color.value.set(v);
	}
}

const circlegeometries = {};
function getCircleGeometry(segments) {
	if (!circlegeometries[segments]) circlegeometries[segments] = new CircleBufferGeometry(0.5, segments);
	return circlegeometries[segments];
}
const ellipselinegeometry = (w, h, s) => {
	w /= 2;
	h /= 2;
	const g = [];
	for (let i = 0; i <= s; i++) {
		const r = i / s * Math.PI * 2;
		g.push(Math.cos(r) * w, Math.sin(r) * h);
	}
	return g;
};
export class Ellipse extends Element {
	constructor(options) {
		options = options || {};

		if (options.segments === undefined) options.segments = 32;
		if (options.radius) options.width = options.height = options.radius * 2;

		const group = new Group();
		group.fill = new Mesh(
			getCircleGeometry(options.segments),
			new MeshBasicMaterial({color: options.fillColor})
		);
		group.fill.visible = !!options.fillColor;
		group.fill.opacity = options.fillOpacity;
		group.add(group.fill);

		group.stroke = createMeshLine(
			ellipselinegeometry(options.width, options.height, options.segments),
			{
				color: options.strokeColor,
				lineWidth: options.strokeWidth !== undefined ? options.strokeWidth : 2
			},
			true
		);
		group.stroke.visible = !!options.strokeColor;
		group.stroke.opacity = options.strokeOpacity;
		group.add(group.stroke);

		super(group, options);

		this._segments = options.segments;

		this.hitTest = hitTestEllipse;

		this.addEventListener("render", () => {
			if (this._dirty) setMeshLineGeometry(group.stroke, ellipselinegeometry(group.fill.scale.x, group.fill.scale.y, this._segments), true);
			this._dirty = false;
		});
	}
	get width() {return this.nativeContent.fill.scale.x}
	set width(v) {
		this.nativeContent.fill.scale.x = v;
		this._dirty = true;
	}

	get height() {return this.nativeContent.fill.scale.y}
	set height(v) {
		this.nativeContent.fill.scale.y = v;
		this._dirty = true;
	}

	get fillOpacity() {return this.nativeContent.fill.opacity}
	set fillOpacity(v) {this.nativeContent.fill.opacity = v}

	get strokeOpacity() {return this.nativeContent.stroke.opacity}
	set strokeOpacity(v) {this.nativeContent.stroke.opacity = v}

	get fillColor() {return this.nativeContent.fill.material.color}
	set fillColor(v) {
		this.nativeContent.fill.visible = Boolean(v);
		this.nativeContent.fill.material.color.set(v);
	}

	get strokeColor() {return this.nativeContent.stroke.material.uniforms.color.value}
	set strokeColor(v) {
		this.nativeContent.stroke.visible = Boolean(v);
		this.nativeContent.stroke.material.uniforms.color.value.set(v);
	}

	get radius() {
		if (this.width !== this.height)
			throw new Error("Attempted to access radius property of a ellipse whose width and height is different");
		return this.width / 2;
	}
	set radius(v) {this.width = this.height = v * 2}

	get segments() {return this._segments}
	set segments(v) {
		this.nativeContent.fill.geometry = getCircleGeometry(v);
		this._segments = v;
		this._dirty = true;
	}
}

const shape = new Shape();
shape.moveTo(0, 0.5);
shape.lineTo(0.5, -0.5);
shape.lineTo(-0.5, -0.5);
shape.lineTo(0, 0.5);
const symmetrictrianglegeometry = new ShapeBufferGeometry(shape);
const symmetrictrianglelinegeometry = (w, h) => [0, h, w, -h, -w, -h, 0, h];
export class SymmetricTriangle extends Element {
	constructor(options) {
		options = options || {};
		const group = new Group();
		group.fill = new Mesh(
			symmetrictrianglegeometry,
			new MeshBasicMaterial({color: options.fillColor})
		);
		group.fill.visible = !!options.fillColor;
		group.fill.opacity = options.fillOpacity;
		group.add(group.fill);

		group.stroke = createMeshLine(
			symmetrictrianglelinegeometry(options.width / 2, options.height / 2),
			{
				color: options.strokeColor,
				lineWidth: options.strokeWidth !== undefined ? options.strokeWidth : 2
			},
			true
		);
		group.stroke.visible = !!options.strokeColor;
		group.stroke.opacity = options.strokeOpacity;
		group.add(group.stroke);

		super(group, options);

		this.addEventListener("render", () => {
			if (this._dirty) setMeshLineGeometry(group.stroke, symmetrictrianglelinegeometry(group.fill.scale.x / 2, group.fill.scale.y / 2), true);
			this._dirty = false;
		});
	}
	get width() {return this.nativeContent.fill.scale.x}
	set width(v) {
		this.nativeContent.fill.scale.x = v;
		this._dirty = true;
	}

	get height() {return this.nativeContent.fill.scale.y}
	set height(v) {
		this.nativeContent.fill.scale.y = v;
		this._dirty = true;
	}

	get fillOpacity() {return this.nativeContent.fill.opacity}
	set fillOpacity(v) {this.nativeContent.fill.opacity = v}

	get strokeOpacity() {return this.nativeContent.stroke.opacity}
	set strokeOpacity(v) {this.nativeContent.stroke.opacity = v}

	get strokeWidth() {return this.nativeContent.stroke.material.uniforms.lineWidth.value}
	set strokeWidth(v) {this.nativeContent.stroke.material.uniforms.lineWidth.value = v}

	get fillColor() {return this.nativeContent.fill.material.color}
	set fillColor(v) {
		this.nativeContent.fill.visible = Boolean(v);
		this.nativeContent.fill.material.color.set(v);
	}

	get strokeColor() {return this.nativeContent.stroke.material.uniforms.color.value}
	set strokeColor(v) {
		this.nativeContent.stroke.visible = Boolean(v);
		this.nativeContent.stroke.material.uniforms.color.value.set(v);
	}
}
