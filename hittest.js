export function hitTestCircle(dx, dy) {
	return Math.hypot(dx, dy) < this.radius;
}

export function hitTestEllipse(dx, dy) {
	if (this.radius) return hitTestCircle.call(this, dx, dy);
	// TODO
}

export function hitTestRectangle(dx, dy) {
	return Math.abs(dx) < this.width / 2 && Math.abs(dy) < this.height / 2
}
