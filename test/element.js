import assert from "assert";
import Element from "../element";
import {Euler, Mesh} from "three";
import Scene from "../scene";

describe('element.js', function() {
	describe('Element', function() {
		describe('#rotation', function() {
			it('isn\'t default three.js Euler instance', function() {
				assert(!(new Element(new Mesh(), {}).rotation instanceof Euler));
			});
			it('rotates the element around the Z axis');
		});
		describe('#selfOpacity', function() {
			let scene;
			beforeEach('reset the scene', function() {
				scene = new Scene();
			});

			it('affects opacity of #nativeContent', function() {
				const element = new Element(new Mesh(), {selfOpacity: 0.5});
				scene.UIScene.add(element);
				scene.prepareForRendering();
				assert.equal(element.nativeContent.material.opacity, 0.5);
			});
			it('doesn\'t affect opacity of other childrens', function() {
				const element = new Element(new Mesh(), {selfOpacity: 0.5});
				scene.UIScene.add(element);
				const child = new Mesh();
				element.add(child);
				scene.prepareForRendering();
				assert.equal(child.material.opacity, 1);
			});
		});
	});
});
