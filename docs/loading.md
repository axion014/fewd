# loading.js
## Variables
##### `assets` : Object
*export default*  
The resources loaded.
Retrieve resources at `assets[type][name]`.

---
##### `fileParsers` : Object
Data processing functions for each different file types.
You can add them yourself.
File types below are provided by default:
- `THREE_Model_GLTF` **:** `THREE.Mesh` - Parse raw .gltf/.glb files using `THREE.GLTFLoader`. returns the first object of the scene.
- `THREE_Texture` **:** `THREE.Texture` - Creates texture object from image files.
- `TEXT` **:** `String` - Returns the text loaded.
- `GLSL` **:** `String` - Namespace for GLSL shaders. functionally same as `TEXT`.

## Functions
##### `addFile(type, name, url)` : undefined
Register combination of resource identifier and resource URL.

---
##### `countResources(list)` : Number
Returns how many resources to be loaded is in the list.
- `list` - Same as that of `loadResources()`.

---
##### `loadResource(type, name, url)` : Promise
Load a single resource.
- `url` - Optional. Specifies the source URL in case the resource ID is not registered.

---
##### async `loadResources(list, onProgress)` : undefined
Load multiple resources based on the list.
- `list` - Array or Object.
- `onProgress` - Callback Function. Optional. will be called each time a resource in the list is loaded.
