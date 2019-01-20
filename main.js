import {WebGLRenderer, Color} from "three";

import EffectComposer from "./three-effect/EffectComposer";

import {initPointerEvents, initKeyEvents, keyDown, processEvent} from "./input";

const loopRate = 60;

let threeRenderer;
export let threeComposer;

export let currentScene;

export let currentFPS = 0;

export let vw = 640;
export let vh = 960;
export let resized = false;

export function setCurrentScene(scene) {
	currentScene = scene;
	threeComposer.passes = scene.threePasses;
	scene.updateCameras();
}

export function renderScreen() {
	if (resized) threeRenderer.setSize(vw, vh);
	currentScene.prepareForRendering();
	threeComposer.render();
	resized = false;
}

export function setGameLoopfrequency(r) {
	loopRate = r;
}

export function resize(width, height) {
	vw = width;
	vh = height;
	resized = true;
}

initKeyEvents();

let canvas;

export function init(options) {
	if (!options) options = {};
	if (options.fitScreen) {
		resize(window.innerWidth, window.innerHeight);
		window.addEventListener('resize', () => {
			resize(window.innerWidth, window.innerHeight);
		});
	} else if (options.width && options.height) resize(options.width, options.height);
	const canvaspresented = options && options.canvasId;
	canvas = canvaspresented ? document.getElementById(options.canvasId) : document.createElement("canvas");
	threeRenderer = new WebGLRenderer({canvas: canvas, antialias: true});
	threeRenderer.setSize(vw, vh);
	threeRenderer.setClearColor(new Color(0xffffff), 1.0);
	threeComposer = new EffectComposer(threeRenderer);

	window.addEventListener('unload', () => threeRenderer.forceContextLoss());

	initPointerEvents(canvas);

	if (!canvaspresented) return canvas;
}

export function run() {
	['pointstart', 'pointmove', 'pointend'].forEach(name => {
		canvas.addEventListener(name, e => currentScene.dispatchEvent(Object.assign({type: e.type}, e)));
	});

	['touchend', 'click'].forEach(name => {
		canvas.addEventListener(name, e => {
			currentScene.dispatchEvent(Object.assign({type: e.type}, processEvent('click', e)));
		});
	});

	let previous = performance.now();
	(function loop() {
		window.setTimeout(loop, 1000 / loopRate);
		const current = performance.now();
		if (currentScene.update) currentScene.update(current - previous);
		Object.keys(keyDown).forEach(key => keyDown[key] = false);
		previous = current;
	})();

	const frameTimes = [];
	frameTimes.length = 60;
	frameTimes.fill(0, 0, 60);
	threeRenderer.setAnimationLoop(() => {
		const currentTime = performance.now();
		frameTimes.push(currentTime);
		currentFPS = 60000 / (currentTime - frameTimes.shift());
		renderScreen();
	});
}
