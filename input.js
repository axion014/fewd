export function createCustomEvent(name, detail) {
	let event = null;
	try {
	  event = new CustomEvent(name, {detail: detail});
	} catch (e) {
	  event = document.createEvent('CustomEvent');
	  event.initCustomEvent(name, false, false, detail);
	}
	return event;
}

export let mouseX = null;
export let mouseY = null;
export let pointing = false;
let currentClick = 0;

export const keys = {};
export const keyDown = {};

export function processEvent(newname, olde) {
	const rect = olde.currentTarget.getBoundingClientRect();
	const newe = createCustomEvent(newname, olde);
	newe.x = olde.clientX - rect.left;
	newe.y = olde.clientY - rect.top;
	return newe;
}

export function initPointerEvents(element) {
	function updateMousePosition(e) {
		mouseX = e.x;
		mouseY = e.y;
	}
	element.addEventListener('touchstart', e => {
		e.preventDefault();
		e = processEvent('pointstart', e);
		updateMousePosition(e);
		pointing = true;
		element.dispatchEvent(e);
	});
	element.addEventListener('touchmove', e => {
		e.preventDefault();
		e = processEvent('pointmove', e);
		updateMousePosition(e);
		element.dispatchEvent(e);
	});
	element.addEventListener('touchend', e => {
		e.preventDefault();
		e = processEvent('pointend', e);
		if (!e.targetTouches.length) pointing = false;
		element.dispatchEvent(e);
	});
	element.addEventListener('mousedown', e => {
		currentClick++;
		e = processEvent('pointstart', e);
		e.identifier = currentClick; // note: click id currently doesn't account for possible collision
		updateMousePosition(e);
		pointing = true;
		element.dispatchEvent(e);
	});
	element.addEventListener('mousemove', e => {
		e = processEvent('pointmove', e);
		e.identifier = currentClick;
		updateMousePosition(e);
		element.dispatchEvent(e);
	});
	element.addEventListener('mouseup', e => {
		e.identifier = currentClick;
		pointing = false;
		element.dispatchEvent(processEvent('pointend', e));
	});
}

export function initKeyEvents() {
	document.addEventListener('keydown', e => keys[e.code] = keyDown[e.code] = true);
	document.addEventListener('keyup', e => keys[e.code] = keyDown[e.code] = false);
}
