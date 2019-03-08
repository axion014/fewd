import {WebGLRenderer, Color} from "three";

import EffectComposer from "./three-effect/EffectComposer";

import {initPointerEvents, initKeyEvents, keyDown, processEvent} from "./input";
import {loadResources} from "./loading";

import regeneratorRuntime from "regenerator-runtime"; // async requires this

export let loopRate = 60;
let frameRate = 60;

let threeRenderer;
export let threeComposer;

export let currentScene;

export let currentFPS = 0;

export let vw = 640;
export let vh = 960;
export let resized = false;
let updated = false;
let running = false;

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
	updated = false;
}

const frameTimes = [];
frameTimes.fill(0, 0, 60);
const renderLoop = () => {
	const currentTime = performance.now();
	frameTimes.push(currentTime);
	currentFPS = 60000 / (currentTime - frameTimes.shift());
	if (updated) renderScreen();
};

export function resize(width, height) {
	vw = width;
	vh = height;
	resized = true;
}

export function getFrameRate() {
	return frameRate;
}

let breakRenderLoop = false;
export function setFrameRate(v) {
	frameRate = v;
	if (!running) return;
	if (frameRate === 60) {
		threeRenderer.setAnimationLoop(renderLoop);
		breakRenderLoop = true;
	} else {
		threeRenderer.setAnimationLoop(null);
		(() => {
			if (breakRenderLoop) {
				breakRenderLoop = false;
				return;
			}
			window.setTimeout(loop, 1000 / frameRate);
			renderLoop();
		})();
	}
}

initKeyEvents();

let canvas;

export async function init(options) {
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
	threeRenderer.setPixelRatio(window.devicePixelRatio);
	threeRenderer.setClearColor(new Color(0xffffff), 1.0);
	await loadResources(EffectComposer);
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
		updated = true;
	})();

	running = true;
	setFrameRate(frameRate); // Run the Render Loop
}
