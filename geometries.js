import {
	Mesh, Group,
	Geometry, ShapeBufferGeometry, PlaneBufferGeometry, CircleBufferGeometry,
	MeshBasicMaterial,
	Shape, Vector3
} from "three";

import {defineAccessor, connect} from "./utils";
import {createMeshLine, setMeshLineGeometry, connectColor} from "./threeutil";
import Element from "./element";
import {hitTestRectangle, hitTestEllipse} from './hittest';

const rectgeometry = new PlaneBufferGeometry(1, 1);
const rectlinegeometry = (w, h) => [-w, h, w, h, w, -h, -w, -h, -w, h];
export class Rectangle extends Element {
	constructor(options) {
		options = options || {};
		const group = new Group();

		const fill = new Mesh(
			rectgeometry,
			new MeshBasicMaterial({color: options.fillColor})
		);
		fill.visible = !!options.fillColor;
		group.add(fill);

		const stroke = createMeshLine(
			rectlinegeometry(options.width / 2, options.height / 2),
			{
				color: options.strokeColor,
				lineWidth: options.strokeWidth !== undefined ? options.strokeWidth : 2
			},
			true
		);
		stroke.visible = !!options.strokeColor;
		group.add(stroke);

		super(group, Object.assign(options, {customScale: true}));

		fill.scale.set(options.width, options.height, 1);
		defineAccessor(this, "width", {
			get() {return fill.scale.x},
			set(v) {
				fill.scale.x = v;
				setMeshLineGeometry(stroke, rectlinegeometry(v / 2, fill.scale.y / 2), true);
			}
		});
		defineAccessor(this, "height", {
			get() {return fill.scale.y},
			set(v) {
				fill.scale.y = v;
				setMeshLineGeometry(stroke, rectlinegeometry(fill.scale.x / 2, v / 2), true);
			}
		});
		connectColor(this, "fillColor", fill.material, "color", fill);
		connectColor(this, "strokeColor", stroke.material.uniforms.color, "value", stroke);
		connect(this, "fillOpacity", fill, "opacity");
		connect(this, "strokeOpacity", stroke, "opacity");
		connect(this, "strokeWidth", stroke.material.uniforms.lineWidth, "value");

		this.hitTest = hitTestRectangle;
	}
}

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

		connectColor(this, "fillColor", mesh.material, "color", mesh);
		//connectColor(element, "strokeColor", stroke.material.uniforms.color, "value");
		defineAccessor(this, "radius", {
			get() {
				if (this.width !== this.height)
				throw new Error("Attempted to access radius property of a ellipse whose width and height is 	different");
				return this.width / 2;
			},
			set(v) {this.width = this.height = v * 2}
		});
		if (options.radius) this.radius = options.radius;

		this.hitTest = hitTestEllipse;
	}
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

		const mesh = new Mesh(
			symmetrictrianglegeometry,
			new MeshBasicMaterial({color: options.fillColor})
		);

		mesh.visible = !!options.fillColor;

		super(mesh, options);

		connectColor(this, "fillColor", mesh.material, "color", mesh);
		//connectColor(this, "strokeColor", stroke.material.uniforms.color, "value");
	}
}
