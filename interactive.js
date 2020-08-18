const dragStartEvent = {type: "dragstart"};
const dragEvent = {type: "drag"};
const dragEndEvent = {type: "dragend"};

export function makeDraggable(target, minimumDragDistance) {
	let x, y, dragging = false;
	if (minimumDragDistance) target.minimumDragDistance = minimumDragDistance;

	target.addEventListener('pointstart', function(e) {
		x = this.x;
		y = this.y;
	});
	target.addEventListener('pointmove', function(e) {
		if (this.disableDrag) return;

		x += e.movementX;
		y += e.movementY;
		if (dragging || !this.minimumDragDistance || Math.hypot(this.x - x, this.y - y) > this.minimumDragDistance) {
			this.x = x;
			this.y = y;
			if (!dragging) this.dispatchEvent(dragStartEvent);
			dragging = true;
			this.dispatchEvent(dragEvent);
		}
	});

	target.addEventListener('pointend', function(e) {
		if (dragging) {
			this.dispatchEvent(dragEndEvent);
			dragging = false;
		}
	});
}

export function makeFlickable(target, sled) {
	let x, y, lx, ly, vx, vy, dragging = false;
	if (target.sled === undefined) target.sled = 0.9;
	else if (sled) target.sled = sled;

	target.addEventListener('pointstart', function(e) {
		vx = vy = 0;
	});
	target.addEventListener('pointmove', function(e) {
		if (this.disableFlick) return;

		this.x += e.movementX;
		this.y += e.movementY;

		lx = e.movementX;
		ly = e.movementY;
	});

	target.addEventListener('pointend', function(e) {
		vx = lx;
		vy = vy;
	});

	target.addEventListener('update', function(e) {
		if (vx < 0.01 && vy < 0.01) return;
		vx *= this.sled;
		vy *= this.sled;
		this.x += vx;
		this.y += vy;
	});
}