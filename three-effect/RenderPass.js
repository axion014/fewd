import Pass from "./Pass"

/**
 * @author alteredq / http://alteredqualia.com/
 */

export default function RenderPass(scene, camera, options) {
	Pass.call(this);
	options = options || {};

	this.scene = scene;
	this.camera = camera;

	this.overrideMaterial = options.overrideMaterial;

	this.clearColor = options.clearColor;
	this.clearAlpha = (options.clearAlpha !== undefined) ? options.clearAlpha : 1;

	this.clear = options.clear !== undefined ? options.clear : true;
	this.clearDepth = false;
	//this.needsSwap = false;

	this.renderToScreen = options.renderToScreen !== undefined ? options.renderToScreen : false;
};

RenderPass.prototype = Object.assign(Object.create(Pass.prototype), {
	constructor: RenderPass,

	render: function (renderer, writeBuffer, readBuffer, delta, maskActive) {

		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.scene.overrideMaterial = this.overrideMaterial;

		let oldClearColor, oldClearAlpha;

		if (this.clearColor) {
			oldClearColor = renderer.getClearColor().getHex();
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor(this.clearColor, this.clearAlpha);
		}

		if (this.clearDepth) {
			renderer.clearDepth();
		}

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer, this.clear);

		if (this.clearColor) {
			renderer.setClearColor(oldClearColor, oldClearAlpha);
		}

		this.scene.overrideMaterial = null;
		renderer.autoClear = oldAutoClear;
	}
});
