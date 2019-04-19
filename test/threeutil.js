import assert from "assert";
import {deepclone, modifySafeTraverse, rotateX, rotateY, rotateZ} from "../threeutil";
import {Scene, Group, Mesh, Quaternion} from "three";

describe('threeutil.js', function() {
	describe('rotate()', function() {
		it('rotates given quaternion based on local axis and angle', function() {
			const quaternion = new Quaternion();
			const object = new Group();
			rotateZ(rotateY(rotateX(quaternion, 1), 2), 3);
			object.rotateX(1).rotateY(2).rotateZ(3);
			assert(quaternion.equals(object.quaternion));
		});
	});
	describe('deepclone()', function() {
		it('returns mesh with different geometry and material than one passed', function() {
			const original = new Mesh();
			const cloned = deepclone(original, true, true);
			assert.notEqual(original.geometry, cloned.geometry);
			assert.notEqual(original.material, cloned.material);
		});
		it('can clone only geometry if specified', function() {
			const original = new Mesh();
			let cloned = deepclone(original, true, false);
			assert.notEqual(original.geometry, cloned.geometry);
			assert.equal(original.material, cloned.material);
		});
		it('can clone only material if specified', function() {
			const original = new Mesh();
			let cloned = deepclone(original, false, true);
			assert.equal(original.geometry, cloned.geometry);
			assert.notEqual(original.material, cloned.material);
		});
  });
	describe('modifySafeTraverse()', function() {
		let root, count;
		beforeEach('build some scene graph', function() {
			count = 0;
			root = new Scene();count++;
			const parent1 = new Group();
			root.add(parent1);count++;
			parent1.add(new Group());count++;
			parent1.add(new Group());count++;
			parent1.add(new Group());count++;
			root.add(new Group());count++;
			const parent2 = new Group();
			root.add(parent2);count++;
			parent2.add(new Group());count++;
			parent2.add(new Group());count++;
			root.add(new Group());count++;
			root.add(new Group());count++;
		});
		it('behaves same as THREE.Object3D#traverse', function() {
			const objectsCalledOn = [];
			root.traverse(function(child) {
				objectsCalledOn.push(child);
			});
			modifySafeTraverse(root, function(child) {
				assert(objectsCalledOn.includes(child));
				objectsCalledOn.splice(objectsCalledOn.indexOf(child), 1);
			});
			assert.equal(objectsCalledOn.length, 0);
		});
		it('doesn\'t skip elements of later index in case the callback removes elements currently traversing', function() {
			let traversedElements = 0;
			modifySafeTraverse(root, function(child) {
				if (child.parent) child.parent.remove(child);
				traversedElements++;
			});
			assert.equal(traversedElements, count);
		});
	});
});
