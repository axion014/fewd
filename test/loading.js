import assert from "assert";
import assets, {fileParsers} from "../loading"; // I noticed names are similar, is this ok?
import {Response} from "node-fetch";

describe('loading.js', function() {
	describe('fileParsers', function() {
		describe('.TEXT', function() {
			it('returns the text of input', async function() {
				assert.equal(await fileParsers.TEXT(new Response("Example")), "Example");
			});
		});
	});
});
