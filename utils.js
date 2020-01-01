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

export function connectMulti(base, key, targetbase, targetkey) {
	if (targetkey === undefined) targetkey = [key];
	defineAccessor(base, key, {
		get: () => targetbase[0][targetkey[0] || key],
		set: v => {
			for (let i = 0; i < targetbase.length; i++) targetbase[i][targetkey[i] || ley] = v;
		}
	});
}

const pools = {};

export function get(type) {
	if (pools[type] !== undefined) {
		if (pools[type].length !== 0) return pools[type].pop();
	} else pools[type] = [];
	return new type();
}

export function free() {
	for (let i = 0; i < arguments.length; i++) pools[arguments[i].constructor].push(arguments[i]);
}

export function normalizeAngle(t) {
	t %= Math.PI * 2;
	if (t > Math.PI) t -= Math.PI * 2;
	if (t < -Math.PI) t += Math.PI * 2;
	return t;
}

export function debugHitbox(o, interval) {
	interval = interval || 500;
	const original = o.hitTest;
	let prevtime = performance.now();
	o.hitTest = (dx, dy) => {
		const currtime = performance.now();
		if (currtime - prevtime > interval) {
			prevtime = currtime;
			console.log(dx, dy);
		}
		original.call(o, dx, dy);
	};
}
