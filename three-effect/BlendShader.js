/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Blend two textures
 */

export default class BlendShader {
	uniforms = {
		"tDiffuse1": {value: null},
		"tDiffuse2": {value: null},
		"mixRatio":  {value: 0.5},
		"opacity":   {value: 1.0}
	};
	vertexShader = "varying vec2 vUv;void main() {vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}";

	fragmentShader = "uniform float opacity;uniform float mixRatio;uniform sampler2D tDiffuse1;uniform sampler2D tDiffuse2;varying vec2 vUv;void main() {vec4 t=texture2D(tDiffuse1,vUv);vec4 u=texture2D(tDiffuse2,vUv);gl_FragColor=opacity*mix(t,u,mixRatio);}";
}
