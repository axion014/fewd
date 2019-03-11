
import assets, {addFile} from "../loading";
import "./identicalVertex";
import {Vector4} from "three";

addFile('GLSL', 'fadeFragment', "node_modules/w3g/three-effect/fadeFragment.min.glsl");

export default class FadeShader {
	constructor() {
		this.uniforms = {
	    tDiffuse: {value: null},
	    color: {value: new Vector4(0, 0, 0, 0)}
	  };
		this.vertexShader = assets.GLSL.identicalVertex;
		this.fragmentShader = assets.GLSL.fadeFragment;
	}
}

FadeShader.requiredResources = {GLSL: ['identicalVertex', 'fadeFragment']};
