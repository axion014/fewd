import {Vector3} from "three";

export function opt(base, key) {
	if (base[key] === undefined) return function() {};
	if (base[key] instanceof Function) return base[key].bind(base);
	return base[key];
}

export function define(base, key, value) {
	Object.defineProperty(base, key, {
		value: value,
		enumerable: true,
		configurable: true,
		writable: true
	});
}

export function defineAccessor(base, key, descriptor) {
	Object.defineProperty(base, key, Object.assign(descriptor, {
		enumerable: true,
		configurable: true
	}));
}

export function connect(base, key, targetbase, targetkey) {
	if (targetkey === undefined) targetkey = key;
	defineAccessor(base, key, {
		get: () => targetbase[targetkey],
		set: v => targetbase[targetkey] = v
	});
}

const pools = {};

export function get(type) {
	if (pools[type] !== undefined) {
		if (pools[type].length !== 0) return objects.pop();
	} else pools[type] = [];
	const newobj = new type();
	pools[type].push(newobj);
	return newobj;
}

export function free() {
	for (let i = 0; i < arguments.length; i++) pools[v[i].prototype.constructor].push(v);
}

export function normalizeAngle(t) {
	t %= Math.PI * 2;
	if (t > Math.PI) t -= Math.PI * 2;
	if (t < -Math.PI) t += Math.PI * 2;
	return t;
}
