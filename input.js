import {createCustomEvent, toSoftEvent} from "./utils";

export let mouseX = null;
export let mouseY = null;
export let pointing = false;
let currentClick = 0;
const trackingObjects = new Map();

export const keys = {};
export const keyDown = {};

export function processEvent(newname, olde) {
	const rect = olde.currentTarget.getBoundingClientRect();
	const newe = createCustomEvent(newname, olde);
	newe.x = olde.clientX - rect.left;
	newe.y = olde.clientY - rect.top;
	return newe;
}

function startTracking() {
	trackingObjects.get(this.identifier).push(this.target);
}

function isTracking(target) {
	return trackingObjects.get(this.identifier).includes(target);
}

export function initPointerEvents(element) {
	function updateMousePosition(e) {
		mouseX = e.x;
		mouseY = e.y;
	}
	element.addEventListener('touchstart', e => {
		e.preventDefault();
		e = processEvent('pointstart', e);
		trackingObjects.set(this.identifier, []);
		e.startTracking = startTracking;
		updateMousePosition(e);
		pointing = true;
		element.dispatchEvent(e);
	});
	element.addEventListener('touchmove', e => {
		e.preventDefault();
		e = processEvent('pointmove', e);
		e.startTracking = startTracking;
		e.isTracking = isTracking;
		updateMousePosition(e);
		element.dispatchEvent(e);
	});
	element.addEventListener('touchend', e => {
		e.preventDefault();
		e = processEvent('pointend', e);
		e.isTracking = isTracking;
		if (!e.targetTouches.length) pointing = false;
		element.dispatchEvent(e);
	});
	element.addEventListener('mousedown', e => {
		e = processEvent('pointstart', e);
		trackingObjects.set(currentClick, []);
		e.startTracking = startTracking;
		e.identifier = currentClick; // note: click id currently doesn't account for possible collision
		updateMousePosition(e);
		pointing = true;
		element.dispatchEvent(e);
	});
	element.addEventListener('mousemove', e => {
		e = processEvent('pointmove', e);
		e.identifier = currentClick;
		updateMousePosition(e);
		if (pointing) {
			e.startTracking = startTracking;
			e.isTracking = isTracking;
		}
		element.dispatchEvent(e);
	});
	element.addEventListener('mouseup', e => {
		e = processEvent('pointend', e);
		e.isTracking = isTracking;
		e.identifier = currentClick;
		pointing = false;
		trackingObjects.delete(currentClick);
		element.dispatchEvent(e);
		currentClick++;
	});
}

export function initKeyEvents() {
	document.addEventListener('keydown', e => keys[e.code] = keyDown[e.code] = true);
	document.addEventListener('keyup', e => keys[e.code] = keyDown[e.code] = false);
}
