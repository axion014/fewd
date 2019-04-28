/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

import assets, {addFile} from "../loading";
import "./identicalVertex";

addFile('GLSL', 'copyFragment', "/node_modules/w3g/three-effect/copyFragment.min.glsl");

export default class CopyShader {
	constructor() {
		this.uniforms = {
			"tDiffuse": {value: null},
			"opacity":  {value: 1.0}
		};
		this.vertexShader = assets.GLSL.identicalVertex;
		this.fragmentShader = assets.GLSL.copyFragment;
	}
}

CopyShader.requiredResources = {GLSL: ['identicalVertex', 'copyFragment']};
