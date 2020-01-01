import {EventDispatcher, Scene as THREEScene, PerspectiveCamera, OrthographicCamera, Vector3} from "three";

import RenderPass from "./three-effect/RenderPass";

import {setCurrentScene, vw, vh, resized} from "./main";
import Easing from "./easing";
import {modifySafeTraverse} from "./threeutil";

const pos = new Vector3();

const updateEvent = {type: "update"};
const renderEvent = {type: "render"};

export default class Scene extends EventDispatcher {
	constructor() {
		super();
		this.threeScene = new THREEScene();
		this.threeScene._meta = this;
		this.camera = new PerspectiveCamera(45, vw / vh, 1, 10000);
		this.UIScene = new THREEScene();
		this.UIScene._meta = this;
		this.UICamera = new OrthographicCamera(-vw / 2, vw / 2, vh / 2, -vh / 2, 1, 10000);
		this.threeScene.add(this.camera);
		this.UICamera.position.z = 5;
		this.UIScene.add(this.UICamera);
		this.threePasses = [
			new RenderPass(this.threeScene, this.camera, {}),
			new RenderPass(this.UIScene, this.UICamera, {})
		];

		Easing.initIn(this);

		const updateInteractivity = target => target._interactive = target.interactive;

		function hitTest(scene, camera) {
			return e => {
				scene.traverse(children => {
					if (children.visible === false || children._interactive === false || !children.hitTest) return;
					pos.setFromMatrixPosition(children.matrixWorld).project(camera);
					if (children.hitTest(e.x - (pos.x + 1) * vw / 2, e.y - (1 - pos.y) * vh / 2)) {
						children.dispatchEvent(e);
					}
				});
			};
		}

		const hitTestThreeScene = hitTest(this.threeScene, this.camera);
		const hitTestUIScene = hitTest(this.UIScene, this.UICamera);

		['pointstart', 'pointmove', 'pointend', 'click'].forEach(name => {
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
		function updateChild(children) {
			children.dispatchEvent(updateEvent);
			if (children.update) children.update(deltaTime);
		}
		this.updateEasings(deltaTime);
		this.dispatchEvent(updateEvent);
		modifySafeTraverse(this.threeScene, updateChild);
		modifySafeTraverse(this.UIScene, updateChild);
	}

	enterThisScene() {
		setCurrentScene(this);
	}

	updateCameras() {
		this.camera.aspect = vw / vh;
		this.camera.zoom = Math.sqrt(this.camera.aspect);
		this.camera.updateProjectionMatrix();
		this.UICamera.left = -vw / 2;
		this.UICamera.right = vw / 2;
		this.UICamera.top = vh / 2;
		this.UICamera.bottom = -vh / 2;
		this.UICamera.updateProjectionMatrix();
	}

	updatePasses() {
		this.threePasses[0].clear = true;
		this.threePasses[this.threePasses.length - 1].clear = false;
		this.threePasses[this.threePasses.length - 1].renderToScreen = true;
		for (let i = this.threePasses.length - 2; i >= 1; i--) {
			this.threePasses[i].renderToScreen =
				!(this.threePasses[i] instanceof RenderPass) && this.threePasses[i + 1].clear ||
				this.threePasses[i + 1] instanceof RenderPass && this.threePasses[i + 1].renderToScreen;
			this.threePasses[i].clear =
				this.threePasses[i - 1].renderToScreen && !this.threePasses[i].renderToScreen;
			this.threePasses[i].needsSwap =
				!(this.threePasses[i] instanceof RenderPass && this.threePasses[i + 1] instanceof RenderPass);
		}
		this.threePasses[0].renderToScreen =
			this.threePasses[1] instanceof RenderPass && this.threePasses[1].renderToScreen;
		this.threePasses[0].needsSwap = !(this.threePasses[1] instanceof RenderPass);
	}

	prepareForRendering() {
		if (resized) this.updateCameras();
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
		this.updatePasses();
	}

	static createAndEnter() {
		const scene = new this(...arguments);
		scene.enterThisScene();
		return scene;
	}
}
