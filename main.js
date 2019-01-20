import {WebGLRenderer, Color} from "three";

import EffectComposer from "./three-effect/EffectComposer";

import {initPointerEvents, keyDown} from "./input";

const loopRate = 60;

let threeRenderer;
export let threeComposer;

export let currentScene;

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

export function fitScreen() {
	window.addEventListener('resize', () => {
		resize(window.innerWidth, window.innerHeight);
	});
}

export function init(options) {
	if (options) {
		vw = options.width;
		vh = options.height;
	}
	const canvas = document.getElementById("screen");
	threeRenderer = new WebGLRenderer({canvas: canvas, antialias: true});
	threeRenderer.setSize(vw, vh);
	threeRenderer.setClearColor(new Color(0xffffff), 1.0);
	threeComposer = new EffectComposer(threeRenderer);

	initPointerEvents(canvas);

	['pointstart', 'pointmove', 'pointend'].forEach(name => {
		canvas.addEventListener(name, e => {
			currentScene.dispatchEvent(Object.assign({}, e.detail, {type: name, target: null, currentTarget: e.detail.target}));
		});
	});

	['touchend', 'click'].forEach(name => {
		canvas.addEventListener(name, e => {
			currentScene.dispatchEvent(Object.assign({}, e, {type: 'click', target: null, currentTarget: e.target}));
		});
	});

	window.addEventListener('unload', () => {
		threeRenderer.forceContextLoss();
	});
}

export function run() {
	let previous = performance.now();
	(function loop() {
		window.setTimeout(loop, 1000 / loopRate);
		const current = performance.now();
		if (currentScene.update) currentScene.update(current - previous);
		Object.keys(keyDown).forEach(key => keyDown[key] = false);
		previous = current;
	})();

	threeRenderer.setAnimationLoop(() => {
		renderScreen();
	});
}
