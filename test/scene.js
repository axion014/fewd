import assert from "assert";
import Scene from "../scene";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass.js";
import {Group, Mesh} from "three";

function closeTo(a, b) {
	if (Math.abs(a - b) > 0.0000000001) assert.fail(`difference between ${a} and ${b} is bigger than floating point error threshold`);
}

describe('scene.js', function() {
	describe('Scene', function() {
		describe('#prepareForRendering', function() {
			it('updates opacity of elements in UIScene', function() {
				const scene = new Scene();
				const parent = new Group();
				parent.opacity = 0.5;
				scene.UIScene.add(parent);
				const child = new Group();
				parent.opacity = 0.25;
				parent.add(child);
				const mesh = new Mesh();
				parent.opacity = 0.1;
				child.add(mesh);
				scene.prepareForRendering();
				closeTo(mesh.opacity, 0.0125);
			});
		});
		describe('#updatePasses', function() {
			/*it('updates .clear and .renderToScreen property of Passes in this.threePasses', function() {
				const scene = new Scene();
				scene.updatePasses();
				assert(scene.threePasses[0].clear);
				assert(scene.threePasses[0].renderToScreen);
				assert(!scene.threePasses[1].clear);
				assert(scene.threePasses[1].renderToScreen);
			});
			it('updates .clear and .renderToScreen property of Passes in this.threePasses', function() {
				const scene = new Scene();
				scene.threePasses.push(new ShaderPass());
				scene.threePasses.push(new ShaderPass());
				scene.updatePasses();
				assert(scene.threePasses[0].clear);
				assert(!scene.threePasses[0].renderToScreen);
				assert(!scene.threePasses[1].clear);
				assert(!scene.threePasses[1].renderToScreen);
				assert(!scene.threePasses[2].clear);
				assert(!scene.threePasses[2].renderToScreen);
				assert(!scene.threePasses[3].clear);
				assert(scene.threePasses[3].renderToScreen);
			});*/
		});
	});
});
