# element.js
### class `Element` extends `THREE.Group`
*export default*
#### Constructor
#### `Element(nativeContent, options)`
`nativeContent` - Initial value for the property `nativeContent`.
`options` - options object.
- `opacity`
- `selfOpacity`
- `x` / `y` / `z`

Properties above will be copied to the element.


#### Properties
##### `nativeContent` : `THREE.Object3D`
Three.js entity which this object mean to wrap.

---
##### `rotation` : Number
2D rotation by radian. overrides THREE.Object3D.rotation.

---
##### `selfOpacity` : Number
Opacity for this element but not the childrens.

---
##### `x` / `y` / `z` : Number
Alias for according properties in `this.position`.

---
##### `width` / `height` : Number
Size of the element.
