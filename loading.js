import {Texture, LoaderUtils} from "three";


import regeneratorRuntime from "regenerator-runtime"; // async requires this

export const fileParsers = {
	/*THREE_Model_JSON(json, url) {
		const data = new JSONLoader().parse(json, LoaderUtils.extractUrlBase(url));
		return new Mesh(data.geometry, data.materials);
	},*/
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
const loadingResources = new Set();

function forEachResourse(list, callback) {
	function callbackInside(list) {
		Object.keys(list).forEach(type => {
			function callbackSimpleList(list) {
				Object.keys(list).forEach(name => callback(type, name, list[name]));
			}
			if (Array.isArray(list[type])) list[type].forEach(elm => {
				if (typeof elm === "string") callback(type, elm);
				else callbackSimpleList(elm);
			});
			else callbackSimpleList(list[type]);
		});
	}
	if (Array.isArray(list)) {
		list.forEach(elm => {
			if (elm.constructor === Object) callbackInside(elm);
			else forEachResourse(elm.requiredResources, callback);
		});
	} else callbackInside(list);
}

export async function loadResources(list, onProgress) {
	const promises = [];
	forEachResourse(list, (type, name, url) => {
		const promise = loadResource(type, name, url);
		promises.push(onProgress ? promise.then(onProgress) : promise);
	});
	return Promise.all(promises);
}

export async function loadResource(type, name, url) {
	// Don't load already loaded resource
	if ((assets[type] && assets[type][name]) || loadingResources.has(`${type}.${name}`)) return;

	loadingResources.add(`${type}.${name}`);

	if (!fileParsers[type]) throw new Error(`fileParsers[${type}] does not exist`);
	if (!url) url = urlList[type][name];
	const response = await fetch(new Request(url, {}));
	if (!response.ok) throw new Error(`HTTP error, status = ${response.status}`);
	if (!assets[type]) assets[type] = [];
  assets[type][name] = await fileParsers[type](response, url);
	//console.log(`done ${type}.${name} (${url})`);

	loadingResources.delete(`${type}.${name}`);
}

export function countResources(list) {
	let count = 0;
	forEachResourse(list, () => count++);
	return count;
}

export default assets;
