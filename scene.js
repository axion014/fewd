import {EventDispatcher, Scene as THREEScene, PerspectiveCamera, OrthographicCamera, Vector3} from "three";

import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";

import {setCurrentScene, vw, vh} from "./main";
import Easing from "./easing";
import {modifySafeTraverse} from "./threeutil";
import {defineAccessor} from "./utils";

const pos = new Vector3();

const updateEvent = {type: "update"};
const renderEvent = {type: "render"};

export default class Scene extends EventDispatcher {
	constructor(frame) {
		super();
		this.frame = frame;
		this.threeScene = new THREEScene();
		this.threeScene._meta = this;
		this.camera = new PerspectiveCamera(45, this.width / this.height, 1, 10000);
		this.UIScene = new THREEScene();
		this.UIScene._meta = this;
		defineAccessor(this.UIScene, 'autoUpdate', {
			get: () => false,
			set: v => this.UIScene._autoUpdate = v
		});
		this.UIScene.autoUpdate = true;
		this.UICamera = new OrthographicCamera(-this.width / 2, this.width / 2, this.height / 2, -this.height / 2, 1, 10000);
		this.threeScene.add(this.camera);
		this.UICamera.position.z = 5;
		this.UICamera.zoom = 1;
		this.UIScene.add(this.UICamera);
		const threeRenderPass = new RenderPass(this.threeScene, this.camera, {});
		this.threePasses = [
			threeRenderPass,
			new RenderPass(this.UIScene, this.UICamera)
		];

		// should render to screen if and only if no effect pass appears later, deny auto configure
		defineAccessor(threeRenderPass, 'renderToScreen', {
			get: () => this.threePasses[this.threePasses.indexOf(threeRenderPass) + 1].renderToScreen,
			set: () => {} // do nothing
		});

		this._threePasses = [];

		Easing.initIn(this);

		const updateInteractivity = target => target._interactive = target.interactive;

		const hitTest = (scene, camera) => {
			return e => {
				scene.traverse(child => {
					if (child.visible === false || child._interactive === false || !child.hitTest ||
						child._listeners === undefined || !child._listeners[e.type]) return;

					pos.setFromMatrixPosition(child.matrixWorld).project(camera);
					if (child.hitTest(e.x - (pos.x + 1) * this.width / 2, e.y - (1 - pos.y) * this.height / 2)) {
						child.dispatchEvent(e);
					}
				});
			};
		};

		const hitTestThreeScene = hitTest(this.threeScene, this.camera);
		const hitTestUIScene = hitTest(this.UIScene, this.UICamera);

		['pointstart', 'pointmove', 'pointend'].forEach(name => {
			this.addEventListener(name, e => {
				/*
				 * Don't change actual interactivity of objects anywhere else, so that changeing their
				 * interactivity inside a event listener don't affect targets the event triggers on.
			   */
				this.threeScene.traverse(updateInteractivity);
				this.UIScene.traverse(updateInteractivity);

				hitTestThreeScene(e);
				hitTestUIScene(e);
			});
		});
	}

	update(deltaTime) {
		updateEvent.deltaTime = deltaTime;
		const parentScene = updateEvent.scene;
		updateEvent.scene = this;
		function updateChild(children) {
			children.dispatchEvent(updateEvent);
			if (children.update) children.update(updateEvent);
		}
		this.updateEasings(deltaTime);
		this.dispatchEvent(updateEvent);
		modifySafeTraverse(this.threeScene, updateChild);
		modifySafeTraverse(this.UIScene, updateChild);
		updateEvent.scene = updateEvent.scene;
	}

	enterThisScene() {
		setCurrentScene(this);
	}

	updateCameras() {
		this.camera.aspect = this.width / this.height;
		const zoomOriginal = this.camera.zoom;
		this.camera.zoom *= Math.sqrt(this.camera.aspect);
		this.camera.updateProjectionMatrix();
		this.camera.zoom = zoomOriginal;
		const zoom = this.UICamera.zoom * 2;
		this.UICamera.left = -this.width / zoom;
		this.UICamera.right = this.width / zoom;
		this.UICamera.top = this.height / zoom;
		this.UICamera.bottom = -this.height / zoom;
		this.UICamera.updateProjectionMatrix();
	}

	updatePasses() {
		this.threePasses[0].clear = !(this.frame && this.threePasses[0].renderToScreen);
		for (let i = this.threePasses.length - 1; i >= 1; i--) this.threePasses[i].clear = false;
		this._threePasses = Array.from(this.threePasses); // shallow copy
	}

	prepareForRendering() {
		const resized = this.width !== this._width || this.height !== this._height;
		if (resized) {
			this.width = this._width;
			this.height = this._height;
			this.updateCameras();
		}

		const parentScene = renderEvent.scene;
		renderEvent.scene = this;
		renderEvent.resized = resized;
		if (this.UIScene._autoUpdate) this.UIScene.updateMatrixWorld();
		this.dispatchEvent(renderEvent);
		this.UIScene.traverse(children => {
			children.dispatchEvent(renderEvent);
			if (children.material && children.material.opacity !== undefined) {
				let opacity = 1;
				for (let obj = children; obj.parent; obj = obj.parent) opacity *= obj.opacity === undefined ? 1 : obj.opacity;
				children.material.opacity = (children.selfOpacity === undefined ? 1 : children.selfOpacity) * opacity;
				children.material.visible = children.material.opacity !== 0;
				if (children.material.opacity !== 1) children.material.transparent = true;
			}
		});
		renderEvent.scene = parentScene;

		// only update passes when there are changes
		for (let i = 0; i < this.threePasses.length; i++) {
			if (this.threePasses[i] !== this._threePasses[i]) {
				this.updatePasses();
				break;
			}
		}
	}

	get _width() {return this.frame ? this.frame.width * this.frame.scale.x : vw}
	get _height() {return this.frame ? this.frame.height * this.frame.scale.y : vh}

	static createAndEnter() {
		const scene = new this(...arguments);
		scene.enterThisScene();
		return scene;
	}
}
