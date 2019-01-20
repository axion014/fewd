
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
			order();
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
		return function(t) {
    	return Math.pow(t, d);
		}
	}

	static out(d) {
		return function(t) {
    	return 1 - Math.pow(1 - t, d);
		}
	}

	static inOut(d) {
		return function(t) {
    	if (t < 0.5) return Math.pow(t * 2, d) / 2;
    	return 1 - Math.pow(2 - t * 2, d) / 2;
		}
	}
}
