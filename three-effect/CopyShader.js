/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

import assets, {addFile} from "../loading";
import "./identicalVertex";

addFile('GLSL', 'copyFragment', "node_modules/w3g/three-effect/copyFragment.min.glsl");

export default class CopyShader {
	uniforms = {
		"tDiffuse": {value: null},
		"opacity":  {value: 1.0}
	};

	constructor() {
		this.vertexShader = assets.GLSL.identicalVertex;
		this.fragmentShader = assets.GLSL.copyFragment;
	}

	static requiredResources = {GLSL: ['identicalVertex', 'copyFragment']};
}
