import {
	Mesh, Group,
	Geometry, ShapeBufferGeometry, PlaneBufferGeometry, CircleBufferGeometry,
	MeshBasicMaterial,
	Shape, Vector3
} from "three";

import {createMeshLine, setMeshLineGeometry} from "./threeutil";
import Element from "./element";
import {hitTestRectangle, hitTestEllipse} from './hittest';
import {defineAccessor} from './utils';

export class GeometricElement extends Element {
	constructor(options, vertices, geometry) {
		const group = new Group();

		group.fill = new Mesh(geometry(options), new MeshBasicMaterial({color: options.fillColor}));
		group.fill.visible = !!options.fillColor;
		group.fill.opacity = options.fillOpacity;
		group.add(group.fill);

		group.stroke = createMeshLine(
			vertices(options),
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
			if (this._dirty) {
				this.updateGeometry();
				this._dirty = false;
			}
		});
	}

	updateGeometry() {
		group.fill.geometry = geometry(this);
		setMeshLineGeometry(group.stroke, vertices(this), true);
	}

	get width() {return this._width}
	set width(v) {
		this._width = v;
		this._dirty = true;
	}

	get height() {return this._height}
	set height(v) {
		this._height = v;
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

export function setScaleToResize(c) {
	defineAccessor(c.prototype, "width", {
		get: function() {return this.nativeContent.fill.scale.x},
		set: function(v) {this.nativeContent.fill.scale.x = v}
	});
	defineAccessor(c.prototype, "height", {
		get: function() {return this.nativeContent.fill.scale.y},
		set: function(v) {this.nativeContent.fill.scale.y = v}
	});
	c.prototype.updateGeometry = function() {
		setMeshLineGeometry(this.nativeContent.stroke, vertices(this), true);
	};
}

const rectgeometry = new PlaneBufferGeometry(1, 1);
function rectlinegeometry(self) {
	const w = self.width / 2, h = self.height / 2;
	return [-w, h, w, h, w, -h, -w, -h, -w, h];
}
export class Rectangle extends GeometricElement {
	constructor(options) {
		options = Object.assign({width: 10, height: 10}, options);

		super(options, rectlinegeometry, () => rectgeometry);

		this.hitTest = hitTestRectangle;
	}
}
setScaleToResize(Rectangle);

function arcvertices(x, y, w, h, s, b, e) {
	const g = [];
	for (let i = 0; i <= s; i++) {
		const r = b + i / s * (e - b);
		g.push(x + Math.cos(r) * w, y + Math.sin(r) * h);
	}
	return g;
}

const circlegeometries = {};
function circlegeometry(self) {
	const s = self.segments;
	if (!circlegeometries[s]) circlegeometries[s] = new CircleBufferGeometry(0.5, s);
	return circlegeometries[s];
}
const ellipselinegeometry = self => arcvertices(0, 0, self.width / 2, self.height / 2, self.segments, 0, Math.PI * 2);
export class Ellipse extends GeometricElement {
	constructor(options) {
		options = Object.assign({width: 10, height: 10, segments: 32}, options);

		if (options.radius) options.width = options.height = options.radius * 2;

		super(options, ellipselinegeometry, circlegeometry);

		this.segments = options.segments;

		this.hitTest = hitTestEllipse;
	}

	get radius() {
		if (this.width !== this.height)
			throw new Error("Attempted to access radius property of a ellipse whose width and height is different");
		return this.width / 2;
	}
	set radius(v) {this.width = this.height = v * 2}

	get segments() {return this._segments}
	set segments(v) {
		this._segments = v;
		this._dirty = true;
	}
}
setScaleToResize(Ellipse);

export function verticesToGeometry(vertices) {
	const shape = new Shape();
	shape.moveTo(vertices[0], vertices[1]);
	for (let i = 2; i < vertices.length; i += 2) shape.lineTo(vertices[i], vertices[i + 1]);
	return new ShapeBufferGeometry(shape);
}

function symmetrictrianglelinegeometry(self) {
	const w = self.width / 2, h = self.height / 2;
	return [0, h, w, -h, -w, -h, 0, h];
}
const symmetrictrianglegeometry = verticesToGeometry(symmetrictrianglelinegeometry({width: 1, height: 1}));
export class SymmetricTriangle extends GeometricElement {
	constructor(options) {
		options = Object.assign({width: 10, height: 10}, options);
		super(options, symmetrictrianglelinegeometry, () => symmetrictrianglegeometry);
	}
}
setScaleToResize(SymmetricTriangle);
