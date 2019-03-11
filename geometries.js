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
		super(new Group(), Object.assign(options, {customScale: true}));

		this.fill = new Mesh(
			rectgeometry,
			new MeshBasicMaterial({color: options.fillColor})
		);
		this.fill.visible = !!options.fillColor;
		this.fill.scale.set(options.width, options.height, 1);
		this.nativeContent.add(this.fill);

		this.stroke = createMeshLine(
			rectlinegeometry(options.width / 2, options.height / 2),
			{
				color: options.strokeColor,
				lineWidth: options.strokeWidth !== undefined ? options.strokeWidth : 2
			},
			true
		);
		this.stroke.visible = !!options.strokeColor;
		this.nativeContent.add(this.stroke);

		this.hitTest = hitTestRectangle;
	}
	get width() {return this.fill.scale.x}
	set width(v) {
		this.fill.scale.x = v;
		setMeshLineGeometry(this.stroke, rectlinegeometry(v / 2, this.fill.scale.y / 2), true);
	}

	get height() {return this.fill.scale.y}
	set height(v) {
		this.fill.scale.y = v;
		setMeshLineGeometry(this.stroke, rectlinegeometry(this.fill.scale.x / 2, v / 2), true);
	}

	get fillOpacity() {return this.fill.opacity}
	set fillOpacity(v) {this.fill.opacity = v}

	get strokeOpacity() {return this.stroke.opacity}
	set strokeOpacity(v) {this.stroke.opacity = v}

	get strokeWidth() {return this.stroke.material.uniforms.lineWidth.value}
	set strokeWidth(v) {this.stroke.material.uniforms.lineWidth.value = v}

	get fillColor() {return this.fill.material.color}
	set fillColor(v) {
		this.fill.visible = Boolean(v);
		this.fill.material.color.set(v)
	}

	get strokeColor() {return this.stroke.material.uniforms.color.value}
	set strokeColor(v) {
		this.stroke.visible = Boolean(v);
		this.stroke.material.uniforms.color.value.set(v)
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
