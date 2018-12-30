export default class ZoomblurShader {
	uniforms = {
		tDiffuse: {value: null},
		strength: {value: 0}
	};

	vertexShader = "varying vec2 vUv;void main() {vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}";

	fragmentShader = "uniform float strength;uniform sampler2D tDiffuse;varying vec2 vUv;const float nFrag=1.0/30.0;float rnd(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.stp+seed,scale))*43758.5453+seed);}void main(void){vec4 destColor=vec4(0.0);float random=rnd(vec3(12.9898,78.233,151.7182),0.0);float totalWeight=0.0;for(float i=0.0;i<=30.0;i++){float percent=(i+random)*nFrag;float weight=percent-percent*percent;destColor+=texture2D(tDiffuse,vUv-(vUv-vec2(0.5,0.5))*percent*strength*nFrag)*weight;totalWeight+=weight;}gl_FragColor=destColor/totalWeight;}";
}
