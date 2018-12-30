import {currentScene} from "./main";

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

export const keys = {};
export const keyDown = {};

export function initPointerEvents(element) {
	function updateMousePosition(e) {
		const rect = e.currentTarget.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
	}
	element.addEventListener('touchstart', e => {
		e.preventDefault();
		element.dispatchEvent(createCustomEvent('pointstart', e));
	});
	element.addEventListener('touchmove', e => {
		e.preventDefault();
		element.dispatchEvent(createCustomEvent('pointmove', e));
	});
	element.addEventListener('touchend', e => {
		e.preventDefault();
		element.dispatchEvent(createCustomEvent('pointend', e));
	});
	element.addEventListener('mousedown', e => {
		element.dispatchEvent(createCustomEvent('pointstart', e));
		updateMousePosition(e);
	});
	element.addEventListener('mousemove', e => {
		element.dispatchEvent(createCustomEvent('pointmove', e));
		updateMousePosition(e);
	});
	element.addEventListener('mouseup', e => {
		element.dispatchEvent(createCustomEvent('pointend', e));
	});
}

export function initKeyEvents() {
	document.addEventListener('keydown', e => {
		currentScene.dispatchEvent(Object.assign(e, {type: name, target: null, currentTarget: e.target}, {descriptor: true}));
		keys[e.code] = keyDown[e.code] = true;
	});
	document.addEventListener('keyup', e => {
		currentScene.dispatchEvent(Object.assign(e, {type: name, target: null, currentTarget: e.target}, {descriptor: true}));
		keys[e.code] = keyDown[e.code] = false;
	});
}
