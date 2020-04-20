import assert from "assert";
import {connect, get, free, normalizeAngle, maxNum, minNum} from "../utils";

function closeTo(a, b) {
	if (Math.abs(a - b) > 0.0000000001) assert.fail(`difference between ${a} and ${b} is bigger than floating point error threshold`);
}

describe('utils.js', function() {
	before('call get() and free() randomly', function() {
		const objects = [];
		for (let i = 0; i < 500; i++) {
			if (Math.random() > 0.5) objects.push(get(Object));
			if (Math.random() < 0.3 && objects.length > 0) free(objects.pop());
		}
	});
	describe('connect()', function() {
		it('makes an accessor to some property', function() {
			const object = {};
			const object2 = {};
			connect(object, 'foo', object2, 'bar');
			object2.bar = "bar";
			assert.equal(object.foo, "bar");
			object.foo = "foo";
			assert.equal(object2.bar, "foo");
		});
		it('connects to property with same name by default', function() {
			const object = {};
			const object2 = {};
			connect(object, 'foo', object2);
			object2.foo = "foo";
			assert.equal(object.foo, "foo");
		});
	});
	describe('get()', function() {
		it('returns object of specified class', function() {
			assert.equal(get(Object).constructor, Object);
		});
		it('returns unique object every time', function() {
			const objects = [];
			for (let i = 0; i < 100; i++) {
				const object = get(Object);
				for (let element of objects) assert.notEqual(object, element);
				objects.push(object);
			}
		});
  });
  describe('normalizeAngle()', function() {
    it('returns the value passed unchanged if it\'s between -π and π', function() {
      assert.equal(normalizeAngle(1), 1);
    });
		it('returns the value passed unchanged if it\'s between -π and π', function() {
			assert.equal(normalizeAngle(-2), -2);
    });
		it('returns the value passed unchanged if it\'s between -π and π', function() {
			assert.equal(normalizeAngle(3), 3);
    });
		it('wraps the value between -π and π if it\'s out of bounds', function() {
      closeTo(normalizeAngle(5), 5 - Math.PI * 2);
    });
		it('wraps the value between -π and π if it\'s out of bounds', function() {
			closeTo(normalizeAngle(-8), -8 + Math.PI * 2);
    });
		it('wraps the value between -π and π if it\'s out of bounds', function() {
			closeTo(normalizeAngle(-66), -66 + Math.PI * 22);
    });
  });
	describe('maxNum()', function() {
		it('returns NaN when called without arguments', function() {
			assert(isNaN(maxNum()));
		});
		it('ignores non-numbers passed', function() {
			assert.equal(maxNum(10, "foo", NaN, 12, undefined), 12);
		});
	});
	describe('minNum()', function() {
		it('returns NaN when called without arguments', function() {
			assert(isNaN(minNum()));
		});
		it('ignores non-numbers passed', function() {
			assert.equal(minNum(10, "foo", NaN, 12, undefined), 10);
		});
	});
});
