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
export function createRectangle(options) {
	options = options || {};
	const group = new Group();

	const fill = new Mesh(
		rectgeometry,
		new MeshBasicMaterial({color: options.fillColor})
	);
	fill.visible = !!options.fillColor;
	group.add(fill);

	const geometry = (w, h) => [-w, h, w, h, w, -h, -w, -h, -w, h];

	const stroke = createMeshLine(
		geometry(options.width / 2, options.height / 2),
		{
			color: options.strokeColor,
			lineWidth: options.strokeWidth !== undefined ? options.strokeWidth : 2
		},
		true
	);
	stroke.visible = !!options.strokeColor;
	group.add(stroke);

	const element = new Element(group, Object.assign(options, {customScale: true}));

	fill.scale.set(options.width, options.height, 1);
	defineAccessor(element, "width", {
		get() {return fill.scale.x},
		set(v) {
			fill.scale.x = v;
			setMeshLineGeometry(stroke, geometry(v / 2, fill.scale.y / 2), true);
		}
	});
	defineAccessor(element, "height", {
		get() {return fill.scale.y},
		set(v) {
			fill.scale.y = v;
			setMeshLineGeometry(stroke, geometry(fill.scale.x / 2, v / 2), true);
		}
	});
	connectColor(element, "fillColor", fill.material, "color", fill);
	connectColor(element, "strokeColor", stroke.material.uniforms.color, "value", stroke);
	connect(element, "fillOpacity", fill, "opacity");
	connect(element, "strokeOpacity", stroke, "opacity");
	connect(element, "strokeWidth", stroke.material.uniforms.lineWidth, "value");

	element.hitTest = hitTestRectangle;

	return element;
}

const circlegeometries = {};
export function createEllipse(options) {
	options = options || {};

	if (options.radius) options.width = options.height = options.radius * 2;

	if (options.segments === undefined) options.segments = 32;
	if (!circlegeometries[options.segments])
		circlegeometries[options.segments] = new CircleBufferGeometry(0.5, options.segments);

	const mesh = new Mesh(
		circlegeometries[options.segments],
		new MeshBasicMaterial({color: options.fillColor})
	);

	mesh.visible = !!options.fillColor;

	const element = new Element(mesh, options);

	connectColor(element, "fillColor", mesh.material, "color", mesh);
	//connectColor(element, "strokeColor", stroke.material.uniforms.color, "value");
	defineAccessor(element, "radius", {
		get() {
			if (element.width !== element.height)
				throw new Error("Attempted to access radius property of a ellipse whose width and height is different");
			return element.width;
		},
		set(v) {element.width = element.height = v}
	});

	element.hitTest = hitTestEllipse;

	return element;
}

const shape = new Shape();
shape.moveTo(0, -0.5);
shape.lineTo(0.5, 0.5);
shape.lineTo(-0.5, 0.5);
shape.lineTo(0, -0.5);
const symmetrictrianglegeometry = new ShapeBufferGeometry(shape);
export function createSymmetricTriangle(options) {
	options = options || {};

	const mesh = new Mesh(
		symmetrictrianglegeometry,
		new MeshBasicMaterial({color: options.fillColor})
	);

	mesh.visible = !!options.fillColor;

	const element = new Element(mesh, options);

	connectColor(element, "fillColor", mesh.material, "color", mesh);
	//connectColor(element, "strokeColor", stroke.material.uniforms.color, "value");

	return element;
}
