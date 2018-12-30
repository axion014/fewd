import {Texture, Loader, Mesh, LoaderUtils} from "three";

import ResourceLoader from "resource-loader";

export const fileParsers = {
	/*THREE_Model_JSON(json, url) {
		const data = new JSONLoader().parse(json, LoaderUtils.extractUrlBase(url));
		return new Mesh(data.geometry, data.materials);
	},*/
	THREE_Texture(image) {
		const texture = new Texture(image);
		texture.needsUpdate = true;
		return texture;
	}
}

const assets = {};

export function setupLoader(list) {
	const loader = new ResourceLoader();
	let currentParentResource;

	const loadTexture = {load(fullPath) {
		const texture = new Texture();
		loader.add(fullPath, fullPath, {parentResource: currentParentResource}, resource => {
			texture.image = resource.data;
			texture.needsUpdate = true;
		});
		return texture;
	}};
	Loader.Handlers.add(/.*/, loadTexture);
	Object.keys(list).forEach(categoryname => Object.keys(list[categoryname]).forEach(name => {
		const url = list[categoryname][name];
		loader.add(url, url, resource => {
			//console.log(categoryname, resource.data);
			currentParentResource = resource;
			if (!assets[categoryname]) assets[categoryname] = {};
			assets[categoryname][name] = fileParsers[categoryname] ? fileParsers[categoryname](resource.data, url) : resource.data;
		});
	}));
	loader.onComplete.add(() => Loader.Handlers.handlers.splice(Loader.Handlers.handlers.indexOf(loadTexture), 1));
	return loader;
}

export default assets;
