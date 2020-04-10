import {Texture, LoaderUtils} from "three";

import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

import regeneratorRuntime from "regenerator-runtime"; // async requires this

const glTFLoader = new GLTFLoader();
export const fileParsers = {
	async THREE_Model_GLTF(response, url) {
		const arrayBuffer = await response.arrayBuffer();
		const gltf = await new Promise((resolve, reject) => {
			glTFLoader.parse(arrayBuffer, LoaderUtils.extractUrlBase(url), resolve, reject);
		});
		return gltf.scene.children[0];
	},
	async THREE_Texture(response) {
		const blob = await response.blob();
		const image = document.createElement('img');
		image.src = URL.createObjectURL(blob);
		const texture = new Texture(image);
		texture.needsUpdate = true;
		return texture;
	},
	async TEXT(response) {
		return response.text();
	},
	async JSON(response) {
		return response.json();
	}
}

fileParsers.GLSL = fileParsers.TEXT;

const urlList = {};

export function addFile(type, name, url) {
	if (!urlList[type]) urlList[type] = {};
	urlList[type][name] = url;
}

const assets = {};
const loadingResources = new Map();

function forEachResourse(list, callback) {
	function callbackInside(innerList) {
		if (innerList.constructor === Object) {
			Object.keys(innerList).forEach(type => {
				function callbackSimpleList(list) {
					if (typeof list === "string") callback(type, list, urlList[type][list]);
					else Object.keys(list).forEach(name => callback(type, name, list[name]));
				}
				if (Array.isArray(innerList[type])) innerList[type].forEach(callbackSimpleList);
				else callbackSimpleList(innerList[type]);
			});
		} else forEachResourse(innerList.requiredResources, callback);
	}
	if (Array.isArray(list)) list.forEach(callbackInside);
	else callbackInside(list);
}

export async function loadResources(list, onProgress) {
	const promises = [];
	forEachResourse(list, (type, name, url) => {
		const promise = loadResource(type, name, url);
		promises.push(onProgress ? promise.then(onProgress) : promise);
	});
	return Promise.all(promises);
}

export function loadResource(type, name, url) {
	const key = `${type}.${name}`;
	// Don't load already loaded resource
	if (assets[type] && assets[type][name]) return Promise.resolve();
	if (!loadingResources.has(key)) {
		loadingResources.set(key, (async () => {
			if (!fileParsers[type]) throw new Error(`fileParsers[${type}] does not exist`);
			if (!url) url = urlList[type][name];
			if (!url) throw new Error(`URL for resource ${key} is not registered`);
			const response = await fetch(new Request(url, {}));
			if (!response.ok) throw new Error(`HTTP error, status = ${response.status}`);
			if (!assets[type]) assets[type] = [];
	  	assets[type][name] = await fileParsers[type](response, url);
			//console.log(`done ${key} (${url})`);

			loadingResources.delete(key);
		})());
	}
	return loadingResources.get(key);
}

export function countResources(list) {
	let count = 0;
	forEachResourse(list, (type, name) => {
		if (!(assets[type] && assets[type][name])) count++;
	});
	return count;
}

export default assets;
