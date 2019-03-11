# threeutil.js
## Variables
##### `Axis` : Object
Contains property `x`, `y` and `z`, `THREE.Vector3`s pointing the positive direction of corresponding axe.
## Functions
##### `applyToAllMaterials(m, f)` : undefined

---
##### `createMeshLine(geometry, material, flat)` : `THREE.Mesh`
Create a new `THREE.MeshLine`.
- `geometry` - Array of `THREE.Vector2`s, `THREE.Vector3`, 2-dimensional Array, or flat Array representing the shape of `MeshLine`.
- `material` - Additional options object which will be passed to options parameter of the `MeshLineMaterial` constuctor.
- `flat` - Indicates that the `geometry` passed is flat Array. defaults to false.

---
##### `deepclone(object, clonegeometry, clonematerial)` : `THREE.Mesh`
Deep clone the passed mesh.
- `clonegeometry` - Whether the geometry of the mesh will be cloned.
- `clonematerial` - Whether the material of the mesh will be cloned.

---
##### `modifySafeTraverse(t, f)` : undefined
Same as `THREE.Object3D.traverse` except this don't break in case you modify the tree while traversing.

---
##### `rotate(o, a, r)` : o
Rotate a quaternion `o` around *local* axis `a` by `r` radian.

---
##### `rotateAbs(o, a, r)` : o
Rotate a quaternion `o` around *world* axis `a` by `r` radian.

---
##### `rotateAbsX(o, r)` / `rotateAbsY(o, r)` / `rotateAbsZ(o, r)` : o
Rotate a quaternion `o` around *world* X / Y / Z axis by `r` radian.

---
##### `rotateX(o, r)` / `rotateY(o, r)` / `rotateZ(o, r)` : o
Rotate a quaternion `o` around *local* X / Y / Z axis by `r` radian.

---
##### `setMeshLineGeometry(mesh, geometry, flat)` : undefined
Update geometry of existing `THREE.MeshLine`.
- `mesh` **:** `THREE.Mesh` - The target MeshLine.
- `geometry` and `flat` - Same parameter as that of `createMeshLine`.
