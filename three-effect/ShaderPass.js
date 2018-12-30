import {ShaderMaterial, OrthographicCamera, Scene, Mesh, PlaneBufferGeometry, UniformsUtils} from "three";
import Pass from "./Pass";

/**
 * @author alteredq / http://alteredqualia.com/
 */

export default function ShaderPass(shader, textureID) {
	Pass.call(this);

	this.textureID = (textureID !== undefined) ? textureID : "tDiffuse";

	if (shader instanceof ShaderMaterial) {
		this.uniforms = shader.uniforms;
		this.material = shader;
	} else if (shader) {
		this.uniforms = UniformsUtils.clone(shader.uniforms);
		this.material = new ShaderMaterial( {
			defines: shader.defines || {},
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader
		});
	}

	this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
	this.scene = new Scene();

	this.quad = new Mesh(new PlaneBufferGeometry(2, 2), null);
	this.quad.frustumCulled = false; // Avoid getting clipped
	this.scene.add(this.quad);
};

ShaderPass.prototype = Object.assign(Object.create(Pass.prototype), {
	constructor: ShaderPass,

	render(renderer, writeBuffer, readBuffer, delta, maskActive) {
		if (this.uniforms[this.textureID]) this.uniforms[this.textureID].value = readBuffer.texture;

		this.quad.material = this.material;

		if (this.renderToScreen) renderer.render(this.scene, this.camera);
		else renderer.render(this.scene, this.camera, writeBuffer, this.clear);
	}
});
