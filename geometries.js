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
		this.nativeContent.fill.material.color.set(v)
	}

	get strokeColor() {return this.nativeContent.stroke.material.uniforms.color.value}
	set strokeColor(v) {
		this.nativeContent.stroke.visible = Boolean(v);
		this.nativeContent.stroke.material.uniforms.color.value.set(v)
	}
}

const circlegeometries = {};
export class Ellipse extends Element {
	constructor(options) {
		options = options || {};

		if (options.segments === undefined) options.segments = 32;
		if (!circlegeometries[options.segments])
			circlegeometries[options.segments] = new CircleBufferGeometry(0.5, options.segments);

		super(new Mesh(
			circlegeometries[options.segments],
			new MeshBasicMaterial({color: options.fillColor})
		), options);

		this.nativeContent.visible = !!options.fillColor;

		if (options.radius) this.radius = options.radius;

		this.hitTest = hitTestEllipse;
	}
	get width() {return this.nativeContent.scale.x}
	set width(v) {this.nativeContent.scale.x = v}

	get height() {return this.nativeContent.scale.y}
	set height(v) {this.nativeContent.scale.y = v}

	get fillColor() {return this.nativeContent.material.color}
	set fillColor(v) {
		this.nativeContent.visible = Boolean(v);
		this.nativeContent.material.color.set(v)
	}

	get radius() {
		if (this.width !== this.height)
			throw new Error("Attempted to access radius property of a ellipse whose width and height is different");
		return this.width / 2;
	}
	set radius(v) {this.width = this.height = v * 2}

	set segments(v) {this.nativeContent.geometry = getCircleGeometry(v)}
}

const shape = new Shape();
shape.moveTo(0, -0.5);
shape.lineTo(0.5, 0.5);
shape.lineTo(-0.5, 0.5);
shape.lineTo(0, -0.5);
const symmetrictrianglegeometry = new ShapeBufferGeometry(shape);
export class SymmetricTriangle extends Element {
	constructor(options) {
		options = options || {};

		super(new Mesh(
			symmetrictrianglegeometry,
			new MeshBasicMaterial({color: options.fillColor})
		), options);

		this.nativeContent.visible = !!options.fillColor;
	}
	get width() {return this.nativeContent.scale.x}
	set width(v) {this.nativeContent.scale.x = v}

	get height() {return this.nativeContent.scale.y}
	set height(v) {this.nativeContent.scale.y = v}

	get fillColor() {return this.nativeContent.material.color}
	set fillColor(v) {
		this.nativeContent.visible = Boolean(v);
		this.nativeContent.material.color.set(v)
	}
}
