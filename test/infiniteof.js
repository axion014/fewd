import assert from "assert";
import {Group, Vector2, OrthographicCamera} from "three";
import Infiniteof from "../infiniteof";

describe('infiniteof.js', function() {
	describe('Infiniteof', function() {
		const dummyScene = {
			width: 640, height: 960,
			UICamera: new OrthographicCamera(-320, 320, 480, 480, 1, 10000)
		};
		it('generates just enough elements to fill the screen', function() {
			const infiniteof = new Infiniteof(() => new Group(), new Vector2(20, 40));
			infiniteof.dispatchEvent({type: "render", scene: dummyScene}); // trigger the auto layout

			assert.equal(infiniteof.lowerBound, -12); // -480 / 40
			assert.equal(infiniteof.upperBound, 12); // 480 / 40
			assert.equal(infiniteof.nodes.length, 25);
			assert.equal(infiniteof.children.length, 25);
		});

		it('can be moved around', function() {
			const infiniteof = new Infiniteof(() => new Group(), new Vector2(20, 40));
			infiniteof.dispatchEvent({type: "render", scene: dummyScene});
			infiniteof.position.set(-100, 200, 0);
			infiniteof.updateWorldMatrix();
			infiniteof.dispatchEvent({type: "render", scene: dummyScene});

			assert.equal(infiniteof.lowerBound, -11); // -(320 - 100) / 20
			assert.equal(infiniteof.upperBound, 7); // (480 - 200) / 40
			assert.equal(infiniteof.nodes.length, 19);
		});

		it('can be scaled', function() {
			const infiniteof = new Infiniteof(() => new Group(), new Vector2(20, 40));
			infiniteof.scale.set(4, 3, 1);
			infiniteof.updateWorldMatrix();
			infiniteof.dispatchEvent({type: "render", scene: dummyScene});

			assert.equal(infiniteof.lowerBound, -4); // -320 / (20 * 4) or -480 / (40 * 3)
			assert.equal(infiniteof.upperBound, 4); // 320 / (20 * 4) or 480 / (40 * 3)
			assert.equal(infiniteof.nodes.length, 9);
		});

		it('can be rotated', function() {
			const infiniteof = new Infiniteof(() => new Group(), new Vector2(20, 40));
			infiniteof.rotation = Math.PI / 2; // 90 degrees anticlockwise
			infiniteof.updateWorldMatrix();
			infiniteof.dispatchEvent({type: "render", scene: dummyScene});

			assert.equal(infiniteof.lowerBound, -9); // -320 / 40 but float calc error causes a floor
			assert.equal(infiniteof.upperBound, 9); // same as above
			assert.equal(infiniteof.nodes.length, 19);
		});

		describe('.margin', function() {
			it('accounts for size of content', function() {
				const infiniteof = new Infiniteof(() => new Group(), new Vector2(20, 40));
				infiniteof.position.set(-100, 200, 0);
				infiniteof.scale.set(4, 3, 1);
				infiniteof.rotation = Math.PI / 2;
				infiniteof.updateWorldMatrix();
				infiniteof.margin.set(10, 20, 30, 40); // top - right - bottom - left
				infiniteof.dispatchEvent({type: "render", scene: dummyScene});

				assert.equal(infiniteof.lowerBound, -4); // -(320 + 100 + 10 * 3) / (40 * 3)
				assert.equal(infiniteof.upperBound, 3); // (320 - 100 + 30 * 3) / (40 * 3)
				assert.equal(infiniteof.nodes.length, 8);
			});
		});
	});
});
