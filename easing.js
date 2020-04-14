
/*
 *
 *	Easing changes properties of the object passed as target smoothly.
 *
 */
export default class Easing {
	constructor(target) {
		if (!target) throw new Error("target is not specified");
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
		} else if (order.time === 0) {
			if (order.changes) for (const key of Object.keys(order.changes)) this.target[key] = order.changes[key];
			this.queue.shift();
			this.update(delta);
		} else {
			const timeleft = order.time - order.currentTime;
			order.currentTime += Math.min(delta, timeleft);
			if (order.changes) {
				if (order.initialValue === undefined) {
					order.initialValue = {};
					for (const key of Object.keys(order.changes)) {
						if (this.target[key] === null || this.target[key] === undefined) throw new Error(`initial ${key} of the target is not set`);
						order.initialValue[key] = this.target[key];
					}
				}
				const place = order.func(order.currentTime / order.time);
				for (const key of Object.keys(order.changes)) {
					this.target[key] = order.initialValue[key] * (1 - place) + order.changes[key] * place;
				}
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
			for (const easing of this._easings) easing.update(delta);
		}
	}

	// Easing functions

	static LINEAR(t) {
		return t;
	}

	static in(d) {
		return t => Math.pow(t, d);
	}

	static out(d) {
		return t => 1 - Math.pow(1 - t, d);
	}

	static inOut(d) {
		return t => t < 0.5 ? Math.pow(t * 2, d) / 2 : 1 - Math.pow(2 - t * 2, d) / 2;
	}
}
