import assert from "assert";
import {Ellipse} from "../geometries";
import {Scene, Group, Mesh, BoxBufferGeometry, MeshBasicMaterial} from "three";

describe('geometries.js', function() {
	describe('Ellipse', function() {
		describe('#radius', function() {
			it('is half the its width=height', function() {
				const ellipse = new Ellipse({fillColor: '#000'});
				ellipse.width = ellipse.height = 10;
				assert.equal(ellipse.radius, 5);
			});
			it('can be set', function() {
				assert.equal(new Ellipse({fillColor: '#000', radius: 10}).radius, 10);
			});
			it('throws if accessed in case of width≠height', function() {
				const ellipse = new Ellipse({fillColor: '#000'});
				ellipse.width = 7;
				ellipse.height = 15;
				assert.throws(() => ellipse.radius);
			});
		});
	});
});
