import assert from "assert";
import assets, {fileParsers, loadResource, countResources} from "../loading"; // I noticed names are similar, is this ok?
import fetch, {Request, Response} from "node-fetch";

global.fetch = fetch;
global.Request = Request;

describe('loading.js', function() {
	describe('fileParsers', function() {
		describe('.TEXT', function() {
			it('return the input as plain text', async function() {
				assert.equal(await fileParsers.TEXT(new Response("Example")), "Example");
			});
		});
	});
	describe('loadResource', function() {
		// skip cases that send http requests as they are slow
		it.skip('load a file from url, pipe it through fileParsers[type] and store it in assets[type][name]', async function() {
			await loadResource('TEXT', 'foo', 'http://example.com');
			assert.equal(assets.TEXT.foo.substring(0, 63),
				'<!doctype html>\n<html>\n<head>\n    <title>Example Domain</title>');
		});
		it.skip('throw if the request fail', function() {
			assert.rejects(loadResource('TEXT', 'bar', 'http://example.com/404'));
		});
		it('throw if the URL isn\'t specified and it isn\'t registered by addFile either', function() {
			assert.rejects(loadResource('TEXT', 'baz'));
		});
	});
	describe('loadResources', function() {
		it('load multiple files specified by the list and store them in assets');
		it('callback each time a resource is loaded');
	});
	describe('countResources', function() {
		it('return number of resources to be loaded in the list', function() {
			assert.equal(countResources([]), 0);
		});
		it('return number of resources to be loaded in the list', function() {
			class Foo {
				constructor() {
				}
			}
			Foo.requiredResources = {TEXT: {baz: 'qux'}};
			class Bar {
				constructor() {
				}
			}
			Bar.requiredResources = {TEXT: {
				quux: 'corge',
				glault: 'garply'
			}};
			assert.equal(countResources([
				Foo, Bar,
				{
					TEXT: {
						waldo: 'fred',
						plugh: 'xyzzy'
					}
				}
			]), 5);
		});
		it('return number of resources to be loaded in the list', function() {
			assert.equal(countResources({
				TEXT: {
					foo: 'bar',
					baz: 'qux'
				}
			}), 2);
		});
	});
});
