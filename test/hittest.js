import assert from "assert";
import {hitTestCircle, hitTestEllipse, hitTestRectangle} from "../hittest";

describe('hittest.js', function() {
	describe('hitTestCircle()', function() {
		it('cases not hitting', function() {
			assert(!hitTestCircle.call({radius: 10}, 54, -22));
			assert(!hitTestCircle.call({radius: 25}, 19, 17));
		});
		it('cases hitting', function() {
			assert(hitTestCircle.call({radius: 12}, -4, 3));
			assert(hitTestCircle.call({radius: 15}, -10, -10));
		});
  });
	describe('hitTestEllipse()', function() {
		it('cases not hitting', function() {
			assert(!hitTestEllipse.call({width: 9, height: 13}, -34, -37));
			assert(!hitTestEllipse.call({width: 40, height: 16}, 4, 10));
		});
		it('cases hitting', function() {
			assert(hitTestEllipse.call({width: 32, height: 58}, 8, -24));
			assert(hitTestEllipse.call({width: 72, height: 62}, -30, 16));
		});
  });
	describe('hitTestRectangle()', function() {
		it('cases not hitting', function() {
			assert(!hitTestRectangle.call({width: 15, height: 7}, -30, 20));
			assert(!hitTestRectangle.call({width: 33, height: 50}, 1, 26));
		});
		it('cases hitting', function() {
			assert(hitTestRectangle.call({width: 8, height: 8}, 3, -3));
			assert(hitTestRectangle.call({width: 64, height: 89}, 30, -44));
		});
  });
});
