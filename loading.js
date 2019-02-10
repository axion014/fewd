import {Texture, LoaderUtils} from "three";

import GLTFLoader from "./GLTFLoader";

import regeneratorRuntime from "regenerator-runtime"; // async requires this

const glTFLoader = new GLTFLoader();
export const fileParsers = {
	/*THREE_Model_JSON(json, url) {
		const data = new JSONLoader().parse(json, LoaderUtils.extractUrlBase(url));
		return new Mesh(data.geometry, data.materials);
	},*/
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
	function callbackSimpleList(list) {
		Object.keys(list).forEach(name => callback(type, name, list[name]));
	}
	function callbackInside(innerList) {
		if (innerList.constructor === Object) {
			Object.keys(innerList).forEach(type => {
				if (Array.isArray(innerList[type])) innerList[type].forEach(elm => {
					if (typeof elm === "string") callback(type, elm, urlList[type][elm]);
					else callbackSimpleList(elm);
				});
				else callbackSimpleList(innerList[type]);
			});
		} else forEachResourse(list.requiredResources, callback);
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
	if ((!assets[type] || !assets[type][name]) && !loadingResources.has(key)) {
		loadingResources.set(key, (async () => {
			if (!fileParsers[type]) throw new Error(`fileParsers[${type}] does not exist`);
			if (!url) url = urlList[type][name];
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
	forEachResourse(list, () => count++);
	return count;
}

export default assets;
