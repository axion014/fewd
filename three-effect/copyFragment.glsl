
uniform float opacity;
uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {
	gl_FragColor = opacity * texture2D(tDiffuse, vUv);
}
