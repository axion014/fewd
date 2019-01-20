
uniform float opacity;
uniform float mixRatio;
uniform sampler2D tDiffuse1;
uniform sampler2D tDiffuse2;

varying vec2 vUv;

void main() {
	gl_FragColor = opacity * mix(texture2D(tDiffuse1, vUv), texture2D(tDiffuse2, vUv), mixRatio);
}
