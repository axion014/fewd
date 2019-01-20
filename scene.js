import {EventDispatcher, Scene as THREEScene, PerspectiveCamera, OrthographicCamera, Vector3} from "three";

import RenderPass from "./three-effect/RenderPass";

import {SpriteText2D} from "three-text2d";

import {setCurrentScene, vw, vh, resized} from "./main";
import Easing from "./easing";

const pos = new Vector3();

const updateEvent = {type: "update"};
const renderEvent = {type: "render"};

export default class Scene extends EventDispatcher {

	threeScene = new THREEScene();
	camera = new PerspectiveCamera(45, vw / vh, 1, 10000);
	UIScene = new THREEScene();
	UICamera = new OrthographicCamera(-vw / 2, vw / 2, vh / 2, -vh / 2, 1, 10000);

	constructor() {
		super();
		this.threeScene.add(this.camera);
		this.UICamera.position.z = 5;
		this.UIScene.add(this.UICamera);
		this.threePasses = [
			new RenderPass(this.threeScene, this.camera, {renderToScreen: true}),
			new RenderPass(this.UIScene, this.UICamera, {renderToScreen: true, clear: false})
		];

		Easing.initIn(this);

		['pointstart', 'pointmove', 'pointend', 'click'].forEach(name => {
			this.addEventListener(name, e => {
				const rect = e.currentTarget.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;
				this.threeScene.traverse(children => {
					children._interactive = children.interactive;
				});
				this.UIScene.traverse(children => {
					children._interactive = children.interactive;
				});
				this.threeScene.traverse(children => {
					if (children._interactive === false) return;
					pos.copy(children.position).project(this.camera);
					if (children.hitTest && children.hitTest(
						x - (pos.x + 1) * vw / 2, y - (1 - pos.y) * vh / 2)) {
						children.dispatchEvent(e);
					}
				});
				this.UIScene.traverse(children => {
					if (children._interactive === false) return;
					pos.copy(children.position).project(this.UICamera);
					if (children.hitTest && children.hitTest(
						x - (pos.x + 1) * vw / 2, y - (1 - pos.y) * vh / 2)) {
						children.dispatchEvent(e);
					}
				});
			});
		});
	}

	update(deltaTime) {
		function updateChild(children) {
			children.dispatchEvent(updateEvent);
			if (children.update) children.update(deltaTime);
		}
		this.updateEasings(deltaTime);
		this.dispatchEvent(updateEvent);
		this.threeScene.traverse(updateChild);
		this.UIScene.traverse(updateChild);
	}

	enterThisScene() {
		setCurrentScene(this);
	}

	prepareForRendering() {
		if (resized) {
			this.camera.aspect = vw / vh;
			this.UICamera.left = -vw / 2;
			this.UICamera.right = vw / 2;
			this.UICamera.top = vh / 2;
			this.UICamera.bottom = -vh / 2;
		}
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
	}

	static createAndEnter() {
		const scene = new this(...arguments);
		scene.enterThisScene();
		return scene;
	}
}
