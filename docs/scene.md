# scene.js
### class `Scene` extends `THREE.EventDispatcher`
*export default*
#### Constructor
#### `Scene()`
#### Properties
##### `camera` : `THREE.PerspectiveCamera`
The camera projecting 3D scene.

---
##### `threePasses` : Array
Array of `THREE.Pass`es to render the screen.

---
##### `threeScene` : `THREE.Scene`
The main three.js scene.

---
##### `UICamera` : `THREE.OrthographicCamera`
Camera projecting 2D interfaces.

---
##### `UIScene` : `THREE.Scene`
Scene to compose 2D interfaces on top of 3D scene.
#### Methods
##### `enterThisScene()`
Replace applications `currentScene` with this scene.

---
##### `update(deltaTime)`
Update the scene.
- `deltaTime` - Milliseconds elapsed since the previous call.

## Functions
##### `Scene.createAndEnter()`
Create a scene of the class you called this static method from, passing any arguments passed to this function.
Enter to that scene immediately.
