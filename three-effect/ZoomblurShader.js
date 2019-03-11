
import assets, {addFile} from "../loading";
import "./identicalVertex";

addFile('GLSL', 'zoomblurFragment', "node_modules/w3g/three-effect/zoomblurFragment.min.glsl");

export default class ZoomblurShader {
	constructor() {
		this.uniforms = {
			tDiffuse: {value: null},
			strength: {value: 0}
		};
		this.vertexShader = assets.GLSL.identicalVertex;
		this.fragmentShader = assets.GLSL.zoomblurFragment;
	}
}

ZoomblurShader.requiredResources = {GLSL: ['identicalVertex', 'zoomblurFragment']};
