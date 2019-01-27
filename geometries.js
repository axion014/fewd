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

export function createRectangle(options) {
	const group = new Group();

	const fill = new Element(new Mesh(
		new PlaneBufferGeometry(1, 1),
		new MeshBasicMaterial({color: options.fillColor})
	), options);
	fill.opacity = 1;
	group.add(fill);

	const geometry = (w, h) => [-w, h, w, h, w, -h, -w, -h, -w, h];

	const stroke = createMeshLine(
		geometry(options.width / 2, options.height / 2),
		{color: options.strokeColor},
		true
	);
	group.add(stroke);

	defineAccessor(group, "width", {
		get() {return fill.width},
		set(v) {
			fill.width = v;
			setMeshLineGeometry(stroke, geometry(v / 2, fill.height / 2), true);
		}
	});
	defineAccessor(group, "height", {
		get() {return fill.height},
		set(v) {
			fill.height = v;
			setMeshLineGeometry(stroke, geometry(fill.width / 2, v / 2), true);
		}
	});
	group.opacity = options.opacity;
	defineAccessor(group, "selfOpacity", {
		get() {return fill.opacity},
		set(v) {fill.opacity = stroke.opacity = v}
	});
	connectColor(group, "fillColor", fill.material, "color", fill);
	connectColor(group, "strokeColor", stroke.material.uniforms.color, "value", stroke);
	connect(group, "fillOpacity", fill);
	connect(group, "strokeOpacity", stroke);

	group.hitTest = hitTestRectangle;

	return group;
}

export function createEllipse(options) {
	if (options.radius) options.width = options.height = options.radius * 2;

	const mesh = new Mesh(
		new CircleBufferGeometry(0.5, options.segments !== undefined ? options.segments : 32),
		new MeshBasicMaterial({color: options.fillColor})
	);

	const element = new Element(mesh, options);

	connectColor(element, "fillColor", mesh.material, "color", mesh);
	//connectColor(element, "strokeColor", stroke.material.uniforms.color, "value");

	element.hitTest = hitTestEllipse;

	return element;
}

export function createMark(options) {
	const group = new Group();

	const material = new MeshBasicMaterial({color: options.strokeColor});

	const vertical = new Mesh(new PlaneBufferGeometry(1, 1), material);
	group.add(vertical);

	const horizontal = new Mesh(new PlaneBufferGeometry(1, 1), material);
	group.add(horizontal);

	defineAccessor(group, "strokeColor", {
		get: () => vertical.material.color,
		set: v => {
			vertical.material.color.set(v);
			horizontal.material.color.set(v);
		}
	});
	connect(group, "width", horizontal.scale, "x");
	connect(group, "height", vertical.scale, "y");
	defineAccessor(group, "strokeWidth", {
		get: () => vertical.scale.x,
		set: v => {
			vertical.scale.x = v;
			horizontal.scale.y = v;
		}
	});

	return group;
}

export function createSymmetricTriangle(options) {
	const shape = new Shape();
	shape.moveTo(0, -0.5);
	shape.lineTo(0.5, 0.5);
	shape.lineTo(-0.5, 0.5);
	shape.lineTo(0, -0.5);
	const mesh = new Mesh(
		new ShapeBufferGeometry(shape),
		new MeshBasicMaterial({color: options.fillColor})
	);

	const element = new Element(mesh, options);

	connectColor(element, "fillColor", mesh.material, "color", mesh);
	//connectColor(element, "strokeColor", stroke.material.uniforms.color, "value", stroke);

	return element;
}
