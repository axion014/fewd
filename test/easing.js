import assert from "assert";
import Easing from "../easing";

describe('easing.js', function() {
	describe('Easing', function() {
		it('chains', function() {
			const easing = new Easing({});
			assert.equal(easing.add({}, 600, Easing.LINEAR), easing);
			assert.equal(easing.trigger(function() {}), easing);
			assert.equal(easing.wait(1000), easing);
  	});
		context('property easing', function() {
			it('.LINEAR', function() {
				const target = {x: 100};
				const easing = new Easing(target).add({x: 180}, 500, Easing.LINEAR);
				easing.update(200);
				assert.equal(target.x, 132);
				easing.update(1000);
				assert.equal(target.x, 180);
			});
			it('.in', function() {
				const target = {x: 50};
				const easing = new Easing(target).add({x: 100}, 1000, Easing.in(2));
				easing.update(500);
				assert.equal(target.x, 62.5);
				easing.update(1000);
				assert.equal(target.x, 100);
			});
			it('.out', function() {
				const target = {x: 50};
				const easing = new Easing(target).add({x: 100}, 1000, Easing.out(2));
				easing.update(500);
				assert.equal(target.x, 87.5);
				easing.update(1000);
				assert.equal(target.x, 100);
			});
			it('.inOut', function() {
				const target = {x: 50};
				const easing = new Easing(target).add({x: 100}, 1000, Easing.inOut(2));
				easing.update(250);
				assert.equal(target.x, 56.25);
				easing.update(500);
				assert.equal(target.x, 93.75);
				easing.update(1000);
				assert.equal(target.x, 100);
			});
  	});
		it('waiting/callback', function() {
			let triggercalled = false;
			const easing = new Easing({}).wait(1000).trigger(function() {
				triggercalled = true;
			});
			assert.equal(triggercalled, false);
			easing.update(500);
			assert.equal(triggercalled, false);
			easing.update(1000);
			assert.equal(triggercalled, true);
  	});
		it('throws if no target is passed', function() {
			assert.throws(() => new Easing());
  	});
		it('throws if there is no initial value for easing target property', function() {
			const easing = new Easing({}).add({foo: 100}, 1000, Easing.LINEAR);
			assert.throws(() => easing.update(500));
  	});
	});
});
