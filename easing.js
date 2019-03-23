
/*
 *
 *	Easing changes properties of the object passed as target smoothly.
 *
 */
export default class Easing {
	constructor(target) {
		this.target = target;
		this.queue = [];
	}

	/*
	 *
	 *	add easing order.
	 *
	 */
	add(changes, time, func) {
		this.queue.push({changes, time, func, currentTime: 0});
		return this;
	}

	/*
	 *
	 *	add waiting order.
	 *
	 */
	wait(time) {
		this.queue.push({time, currentTime: 0});
		return this;
	}

	/*
	 *
	 *	the function passed will be invoked when the latest easing ends.
	 *
	 */
	trigger(func) {
		this.queue.push(func);
		return this;
	}

	/*
	 *
	 *	update the properties accordingly.
	 *
	 */
	update(delta) {
		const order = this.queue[0];
		if (order === undefined) return;
		if (typeof order === "function") {
			order.call(this.target);
			this.queue.shift();
			this.update(delta);
		} else {
			const timeleft = order.time - order.currentTime;
			order.currentTime += Math.min(delta, timeleft);
			if (order.changes) {
				if (order.initialValue === undefined) {
					order.initialValue = {};
					Object.keys(order.changes).forEach(key => {
						order.initialValue[key] = this.target[key];
					});
				}
				const place = order.func(order.currentTime / order.time);
				Object.keys(order.changes).forEach(key => {
					this.target[key] = order.initialValue[key] * (1 - place) + order.changes[key] * place;
				});
			}
			if (timeleft <= delta) {
				this.queue.shift();
				this.update(delta - timeleft);
			}
		}
	}

	/*
	 *
	 *	let a scene prepare to manage multiple easings.
	 *
	 */
	static initIn(scene) {
		scene._easings = new Set();
		scene.addEasing = function(easing) {
			easing.trigger(() => this._easings.delete(easing));
			this._easings.add(easing);
		}
		scene.updateEasings = function(delta) {
			this._easings.forEach(easing => easing.update(delta));
		}
	}

	// Easing functions

	static LINEAR(t) {
		return t;
	}

	static in(d) {
		if (d === SINE) return t => 1 - Math.cos(t * Math.PI / 2);
		if (d === CIRC) return t => 1 - Math.sqrt(1 - t * t);
		if (d === EXPO) return t => t === 0 ? t : Math.pow(2, 10 * (t - 10));
		if (d === ELASTIC) return t => Math.sin(13 * t * Math.PI / 2) * Math.pow(2, 10 * (t - 10));
		if (d === BOUNCE) return Easing.out(BOUNCE);
		return t => Math.pow(t, d);
	}

	static out(d) {
		if (d === SINE) return t => Math.sin(t * Math.PI / 2);
		if (d === CIRC) return t => Math.sqrt(1 - (--t * t));
		if (d === EXPO) return t => t === 1 ? t : 1 - Math.pow(2, -10 * t);
		if (d === ELASTIC) return t => Math.sin(-13 * (t + 1) * Math.PI / 2) * Math.pow(2, -10 * t) + 1;
		if (d === BOUNCE) return t => {
			const t2 = t * t;
			if (t < 0.363636363636364) return 7.5625 * t2;
			if (t < 0.727272727272727) return 9.075 * t2 - 9.9 * t + 3.4;
			if (t < 0.9) return 12.066481994459834 * t2 - 19.635457063711911 * t + 8.898060941828255;
			return 10.8 * t * t - 20.52 * t + 10.72;
		};
		return t => 1 - Math.pow(1 - t, d);
	}

	static inOut(d) {
		const in = in(d);
		const out = out(d);
		return t => t < 0.5 ? in(t * 2) / 2 : 1 - out(2 - t * 2) / 2;
	}

	static SINE = {};
	static CIRC = {};
	static EXPO = {};
	static ELASTIC = {};
	static BOUNCE = {};
}
