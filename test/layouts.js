import assert from "assert";
import {Rectangle, Ellipse, SymmetricTriangle} from "../geometries";
import {List} from "../layouts";

describe('layouts.js', function() {
	describe('List', function() {
		let list;
		before('build a list', function() {
			list = new List(false, 0);
			list.add(new Rectangle({width: 10}));
			list.add(new Ellipse({radius: 8}));
			list.add(new SymmetricTriangle({width: 14}));
			list.dispatchEvent({type: "render"}); // trigger the auto layout
		});
		it('lines up its children', function() {
			assert.equal(list.children[0].position.x, 5);
			assert.equal(list.children[1].position.x, 18);
			assert.equal(list.children[2].position.x, 33);
		});
		it('automatically updates its width', function() {
			assert.equal(list.width, 40);
		});
		it('adds padding between children', function() {
			const list = new List(false, 4);
			list.add(new Rectangle({width: 10}));
			list.add(new Ellipse({radius: 8}));
			list.add(new SymmetricTriangle({width: 14}));
			list.dispatchEvent({type: "render"});
			assert.equal(list.children[0].position.x, 5);
			assert.equal(list.children[1].position.x, 22);
			assert.equal(list.children[2].position.x, 41);
			assert.equal(list.width, 48);
		});
	});
});
