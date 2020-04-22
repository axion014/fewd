import {Mesh, Object3D, Quaternion, MultiMaterial, Vector2, Vector3, Color} from "three";
import {MeshLine, MeshLineMaterial} from "threejs-meshline";

import {get, free, defineAccessor} from "./utils";

//3軸
export const Axis = {x: new Vector3(1, 0, 0), y: new Vector3(0, 1, 0), z: new Vector3(0, 0, 1)};
export const Vector3_ZERO = new Vector3();
export const Quaternion_IDENTITY = new Quaternion();

export function rotate(o, a, r) {
	const tempquaternion = get(Quaternion);
	o.multiply(tempquaternion.setFromAxisAngle(a, r));
	free(tempquaternion);
	return o;
}

export function rotateAbs(o, a, r) {
	const tempquaternion = get(Quaternion);
	o.premultiply(tempquaternion.setFromAxisAngle(a, r));
	free(tempquaternion);
	return o;
}

export function rotateX(o, r) {
	return rotate(o, Axis.x, r);
}

export function rotateY(o, r) {
	return rotate(o, Axis.y, r);
}

export function rotateZ(o, r) {
	return rotate(o, Axis.z, r);
}

export function rotateAbsX(o, r) {
	return rotateAbs(o, Axis.x, r);
}

export function rotateAbsY(o, r) {
	return rotateAbs(o, Axis.y, r);
}

export function rotateAbsZ(o, r) {
	return rotateAbs(o, Axis.z, r);
}

export function deepclone(object, clonegeometry, clonematerial) {
	return new object.constructor(clonegeometry ? object.geometry.clone() : object.geometry, clonematerial ? object.material.clone(true) : object.material).copy(object);
}

export function applyToAllMaterials(m, f) {
	if (Array.isArray(m)) m.forEach(f);
	else f(m);
}

const children = [];
export function modifySafeTraverse(t, f, d, r) {
	if (!d) {
		r = children.length;
		children.push([]);
		d = 0;
	}
	f(t);
	if (children[r][d]) children[r][d].length = 0;
	else children[r].push([]);

	// May not work for element with tens of thousands of childrens
	Array.prototype.push.apply(children[r][d], t.children);

	for (let i = 0, l = children[r][d].length; i < l; i++) modifySafeTraverse(children[r][d][i], f, d + 1, r);
	if (!d) children.pop();
}

export function connectColor(base, key, targetbase, targetkey, target) {
	if (targetkey === undefined) targetkey = key;
	defineAccessor(base, key, {
		get: () => targetbase[targetkey],
		set: v => {
			target.visible = Boolean(v);
			if (v) targetbase[targetkey].set(v);
		}
	});
}

export function connectColorMulti(base, key, targetbase, targetkey, target) {
	if (targetkey === undefined) targetkey = [key];
	defineAccessor(base, key, {
		get: () => targetbase[0][targetkey[0] || key],
		set: v => {
			target.visible = v;
			if (v) for (let i = 0; i < targetbase.length; i++) targetbase[i][targetkey[i] || key].set(v);
		}
	});
}

export function setMeshLineGeometry(mesh, geometry, flat) {
	if (geometry[0].isVector2) {
		const newarray = [];
		for (let i = 0; i < geometry.length; i++) {
			newarray.push(geometry[i].x);
			newarray.push(geometry[i].y);
			newarray.push(0);
		}
		geometry = newarray;
	} else if (geometry[0].isVector3) {
		const newarray = [];
		for (let i = 0; i < geometry.length; i++) {
			newarray.push(geometry[i].x);
			newarray.push(geometry[i].y);
			newarray.push(geometry[i].z);
		}
		geometry = newarray;
	} else if (flat) {
		const newarray = [];
		for (let i = 0; i < geometry.length; i += 2) {
			newarray.push(geometry[i]);
			newarray.push(geometry[i + 1]);
			newarray.push(0);
		}
		geometry = newarray;
	}
	mesh.geometryGenerator.setGeometry(geometry);
}

export function createMeshLine(geometry, material, flat) {
	if (!(material.color instanceof Color)) material.color = new Color(material.color);
	const geometryGenerator = new MeshLine();
	const mesh = new Mesh(
		geometryGenerator.geometry,
		new MeshLineMaterial(Object.assign({sizeAttenuation: false}, material))
	);
	mesh.geometryGenerator = geometryGenerator;
	setMeshLineGeometry(mesh, geometry, flat);
	mesh.addEventListener("render", e => {
		mesh.material.uniforms.resolution.value.set(e.scene.width, e.scene.height); // the uniform variable resolution must be kept up to date
	});
	return mesh;
}

export function toString(o) {
	if (o instanceof Vector3) return `{x: ${o.x.toFixed(2)}, y: ${o.y.toFixed(2)}, z: ${o.z.toFixed(2)}}`;
	if (o instanceof Vector2) return `{x: ${o.x.toFixed(2)}, y: ${o.y.toFixed(2)}}`;
	if (o instanceof Quaternion) return `{x: ${o.x.toFixed(2)}, y: ${o.y.toFixed(2)}, z: ${o.z.toFixed(2)}, w: ${o.w.toFixed(2)}}`;
	if (o instanceof Matrix4) {
		let str = "";
		for (let i = 0; i < 4; i++) {
			str += "| ";
			for (let j = 0; j < 4; j++) str += o.elements[i + j * 4] + " ";
			str += "|\n";
		}
		return str;
	}
}

export default function extend() {
	/*THREE.$extend = function(a, o) {
		var arg = Array.prototype.slice.call(arguments);
		arg.shift();
		Array.prototype.forEach.call(arg, function(source) {
			for (var property in source) {
				if (a[property] && o[property] && o[property].className && o[property].className.substr(0, 6) === 'THREE.') {
					a[property].copy(o[property]);
				} else {
					a[property] = o[property];
				}
			}
		}, this);
		return a;
	};
	THREE.$add = function(a, o) {
		var arg = Array.prototype.slice.call(arguments);
		arg.shift();
		Array.prototype.forEach.call(arg, function(source) {
			for (var property in source) {
				if (o[property]) {
				} else {
					if (a[property] && o[property] && o[property].className && o[property].className.substr(0, 6) === 'THREE.') {
						a[property].add(o[property]);
					} else {
						a[property] += o[property];
					}
				}
			}
		}, this);
		return a;
	};
	THREE.applyToAllMaterial = */
	Object.defineProperty(MultiMaterial.prototype, 'opacity', {
		set(p) {
			for (var i = 0; i < this.materials.length; i++) {
				this.materials[i].opacity = p;
			}
		},
		get() {return this.materials[0].opacity;}
  });
};
