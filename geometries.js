import {
	Mesh, Group,
	Geometry, ShapeBufferGeometry, PlaneBufferGeometry, CircleBufferGeometry,
	MeshBasicMaterial,
	Shape, Vector3
} from "three";

import {defineAccessor} from "./utils";
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
}

defineAccessor(Rectangle.prototype, "width", {
	get() {return this.fill.scale.x},
	set(v) {
		this.fill.scale.x = v;
		setMeshLineGeometry(this.stroke, rectlinegeometry(v / 2, this.fill.scale.y / 2), true);
	}
});
defineAccessor(Rectangle.prototype, "height", {
	get() {return this.fill.scale.y},
	set(v) {
		this.fill.scale.y = v;
		setMeshLineGeometry(this.stroke, rectlinegeometry(this.fill.scale.x / 2, v / 2), true);
	}
});
defineAccessor(Rectangle.prototype, "fillOpacity", {
	get() {return this.fill.opacity},
	set(v) {this.fill.opacity = v}
});
defineAccessor(Rectangle.prototype, "strokeOpacity", {
	get() {return this.stroke.opacity},
	set(v) {this.stroke.opacity = v}
});
defineAccessor(Rectangle.prototype, "strokeWidth", {
	get() {return this.stroke.material.uniforms.lineWidth.value},
	set(v) {this.stroke.material.uniforms.lineWidth.value = v}
});
defineAccessor(Rectangle.prototype, "fillColor", {
	get() {return this.fill.material.color},
	set(v) {
		this.fill.visible = Boolean(v);
		this.fill.material.color.set(v)
	}
});
defineAccessor(Rectangle.prototype, "strokeColor", {
	get() {return this.stroke.material.uniforms.color.value},
	set(v) {
		this.stroke.visible = Boolean(v);
		this.stroke.material.uniforms.color.value.set(v)
	}
});

const circlegeometries = {};
export class Ellipse extends Element {
	constructor(options) {
		options = options || {};

		if (options.segments === undefined) options.segments = 32;
		if (!circlegeometries[options.segments])
			circlegeometries[options.segments] = new CircleBufferGeometry(0.5, options.segments);

		const mesh = new Mesh(
			circlegeometries[options.segments],
			new MeshBasicMaterial({color: options.fillColor})
		);

		mesh.visible = !!options.fillColor;

		super(mesh, options);

		if (options.radius) this.radius = options.radius;

		this.hitTest = hitTestEllipse;
	}
}
defineAccessor(Ellipse.prototype, "width", {
	get() {return this.nativeContent.scale.x},
	set(v) {this.nativeContent.scale.x = v}
});
defineAccessor(Ellipse.prototype, "height", {
	get() {return this.nativeContent.scale.y},
	set(v) {this.nativeContent.scale.y = v}
});
defineAccessor(Ellipse.prototype, "fillColor", {
	get() {return this.nativeContent.material.color},
	set(v) {
		this.nativeContent.visible = Boolean(v);
		this.nativeContent.material.color.set(v)
	}
});
defineAccessor(Ellipse.prototype, "radius", {
	get() {
		if (this.width !== this.height)
			throw new Error("Attempted to access radius property of a ellipse whose width and height is different");
		return this.width;
	},
	set(v) {this.width = this.height = v}
});
defineAccessor(Ellipse.prototype, "segments", {
	set(v) {this.nativeContent.geometry = getCircleGeometry(v)}
});

const shape = new Shape();
shape.moveTo(0, -0.5);
shape.lineTo(0.5, 0.5);
shape.lineTo(-0.5, 0.5);
shape.lineTo(0, -0.5);
const symmetrictrianglegeometry = new ShapeBufferGeometry(shape);
export class SymmetricTriangle extends Element {
	constructor(options) {
		options = options || {};

		const mesh = new Mesh(
			symmetrictrianglegeometry,
			new MeshBasicMaterial({color: options.fillColor})
		);

		mesh.visible = !!options.fillColor;

		super(mesh, options);

	}
}
defineAccessor(SymmetricTriangle.prototype, "width", {
	get() {return this.nativeContent.scale.x},
	set(v) {this.nativeContent.scale.x = v}
});
defineAccessor(SymmetricTriangle.prototype, "height", {
	get() {return this.nativeContent.scale.y},
	set(v) {this.nativeContent.scale.y = v}
});
defineAccessor(SymmetricTriangle.prototype, "fillColor", {
	get() {return this.nativeContent.material.color},
	set(v) {
		this.nativeContent.visible = Boolean(v);
		this.nativeContent.material.color.set(v)
	}
});
