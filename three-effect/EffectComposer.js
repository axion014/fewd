import {LinearFilter, RGBAFormat, WebGLRenderTarget} from "three";
import CopyShader from "./CopyShader";
import ShaderPass from "./ShaderPass";
import {MaskPass, ClearMaskPass} from "./MaskPass";

/**
 * @author alteredq / http://alteredqualia.com/
 */

export default function EffectComposer(renderer, renderTarget) {
	this.renderer = renderer;

	if ( renderTarget === undefined ) {
		const size = renderer.getDrawingBufferSize();
		renderTarget = new WebGLRenderTarget(size.width, size.height, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBAFormat,
			stencilBuffer: false
		});
		renderTarget.texture.name = 'EffectComposer.rt1';
	}

	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();
	this.renderTarget2.texture.name = 'EffectComposer.rt2';

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	this.passes = [];

	this.copyPass = new ShaderPass(CopyShader);
};

Object.assign(EffectComposer.prototype, {
	swapBuffers: function() {
		const tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;
	},

	render: function(delta) {
		let maskActive = false;

		const il = this.passes.length;

		for (let i = 0; i < il; i++) {
			const pass = this.passes[i];

			if (pass.enabled === false) continue;

			pass.render(this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive);

			if (pass.needsSwap) {
				if (maskActive) {
					var context = this.renderer.context;

					context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);

					this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, delta);

					context.stencilFunc(context.EQUAL, 1, 0xffffffff);
				}
				this.swapBuffers();
			}

			if (pass instanceof MaskPass) {
				maskActive = true;
			} else if (pass instanceof ClearMaskPass) {
				maskActive = false;
			}
		}
	},

	reset: function (renderTarget) {
		if (renderTarget === undefined) {
			var size = this.renderer.getDrawingBufferSize();

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize(size.width, size.height);
		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;
	},

	setSize: function (width, height) {
		this.renderTarget1.setSize(width, height);
		this.renderTarget2.setSize(width, height);

		for (var i = 0; i < this.passes.length; i++) {
			this.passes[i].setSize(width, height);
		}
	}
});
