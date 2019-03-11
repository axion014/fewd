/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Blend two textures
 */

import assets, {addFile} from "../loading";
import "./identicalVertex";

addFile('GLSL', 'blendFragment', "node_modules/w3g/three-effect/blendFragment.min.glsl");

export default class BlendShader {
	constructor() {
		this.uniforms = {
			"tDiffuse1": {value: null},
			"tDiffuse2": {value: null},
			"mixRatio":  {value: 0.5},
			"opacity":   {value: 1.0}
		};
		this.vertexShader = assets.GLSL.identicalVertex;
		this.fragmentShader = assets.GLSL.blendFragment;
	}
}

BlendShader.requiredResources = {GLSL: ['identicalVertex', 'blendFragment']};
