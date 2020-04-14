import {WebGLRenderer, WebGLRenderTarget, Color, LinearFilter, RGBAFormat} from "three";

import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";

import {initPointerEvents, initKeyEvents, keyDown, processEvent} from "./input";
import {loadResources} from "./loading";

import regeneratorRuntime from "regenerator-runtime"; // async requires this

export let loopRate = 60;
export let frameRate = 60;

let threeRenderer;
export let threeComposer;

export let currentScene;

export let currentFPS = 0;

export let vw = 640;
export let vh = 960;
let updated = false;
let running = false;

const enterEvent = {type: 'enter'};

export function setCurrentScene(scene) {
	currentScene = scene;
	scene.updateCameras();
	scene.dispatchEvent(enterEvent);
}

export function renderFrameBuffer(scene, buffer) {
	let swap = false;
	for (const pass of scene.threePasses) if (pass.enabled && pass.swapBuffers) swap = !swap;
	const bufferName = swap ? "readBuffer" : "writeBuffer";
	const originalBuffer = threeComposer[bufferName];
	if (!buffer) {
		buffer = new WebGLRenderTarget(scene.width, scene.height, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBAFormat,
			stencilBuffer: false
		});
	}
	threeComposer[bufferName] = buffer;
	renderScene(scene, false);
	threeComposer[bufferName] = originalBuffer;
	return buffer;
}

export function renderScene(scene, renderToScreen) {
	threeComposer.renderToScreen = renderToScreen === undefined ? true : renderToScreen;
	threeComposer.passes = scene.threePasses;
	scene.prepareForRendering();
	if (scene.width !== threeComposer.renderTarget1.width || scene.height !== threeComposer.renderTarget1.height) {
		threeComposer.setSize(scene.width, scene.height);
		if (!scene.frame) threeRenderer.setSize(vw, vh);
	}
	threeComposer.render();
}

export function renderScreen() {
	renderScene(currentScene);
	updated = false;
}

export function setUpdatefrequency(r) {
	loopRate = r;
}
const frameTimes = Array(60).fill(0);
const renderLoop = () => {
	const currentTime = performance.now();
	frameTimes.push(currentTime);
	currentFPS = 60000 / (currentTime - frameTimes.shift());
	if (updated) renderScreen();
};

export function resize(width, height) {
	vw = width;
	vh = height;
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

let canvas;

export async function init(options) {
	if (!options) options = {};
	if (!options.maxPixelRatio) options.maxPixelRatio = Infinity;
	if (options.fitScreen) {
		resize(window.innerWidth, window.innerHeight);
		window.addEventListener('resize', () => {
			resize(window.innerWidth, window.innerHeight);
		});
	} else if (options.width && options.height) resize(options.width, options.height);
	const canvaspresented = options.canvas;
	canvas = canvaspresented ? options.canvas : document.createElement("canvas");
	threeRenderer = new WebGLRenderer({canvas: canvas, antialias: true});
	threeRenderer.setSize(vw, vh);
	threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, options.maxPixelRatio));
	threeRenderer.setClearColor(new Color(0xffffff), 1.0);
	threeComposer = new EffectComposer(threeRenderer);
	if (currentScene) threeComposer.passes = currentScene.threePasses;

	window.addEventListener('unload', () => threeRenderer.forceContextLoss());

	initPointerEvents(canvas);
	initKeyEvents();

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
