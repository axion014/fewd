import {Vector4} from "three";

export default class FadeShader {
  uniforms = {
    tDiffuse: {value: null},
    color: {value: new Vector4(0, 0, 0, 0)}
  };

  vertexShader = "varying vec2 vUv;void main() {vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}";

  fragmentShader = "uniform vec4 color;uniform sampler2D tDiffuse;varying vec2 vUv;void main() {vec4 t=texture2D(tDiffuse,vUv);gl_FragColor=vec4(t.rgb*(1.-color.a)+color.rgb*color.a,t.a);}";
}
