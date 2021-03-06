
uniform float strength;
uniform sampler2D tDiffuse;

varying vec2 vUv;

const float nRep = 30.0;
const float nFrag = 1.0 / nRep;

float rnd(vec3 scale, float seed) {
	return fract(sin(dot(gl_FragCoord.stp + seed, scale)) * 43758.5453 + seed);
}

void main(void) {
	vec4 destColor = vec4(0.0);
	float random = rnd(vec3(12.9898, 78.233, 151.7182), 0.0);
	float totalWeight = 0.0;
	for(float i = 0.0; i <= nRep; i++) {
		float percent = (i + random) * nFrag;
		float weight = percent - percent * percent;
		destColor += texture2D(tDiffuse, vUv - (vUv - vec2(0.5)) * percent * strength * nFrag) * weight;
		totalWeight += weight;
	}
	gl_FragColor = destColor / totalWeight;
}
