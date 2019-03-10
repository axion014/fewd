# loading.js
## Variables
##### `assets` : Object
*export default*  
The resources loaded.

---
##### `fileParsers` : Object
Data processing functions for each different file types.
You can add them yourself.
## Functions
##### `addFile(type, name, url)` : undefined
Register combination of resource ID and resource URL.

---
##### `countResources(list)` : Number
Returns how many resources to be loaded is in the list.

---
##### `loadResource(type, name, url)` : Promise
Load a single resource.

---
##### async `loadResources(list, onProgress)` : undefined
Load multiple resources based on the list.
