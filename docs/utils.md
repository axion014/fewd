# utils.js
## Functions
##### `get(type)` - type
Retrieve an object of class `type` from the internal object pool.
Returns new one if the pool is empty.
Returned object may be in dirty state. You must reset them yourself.

---
##### `free(objects...)` - undefined
Add free objects to the internal object pool.
The object passed must not be used at any point later.

---
##### `normalizeAngle(t)` - Number
takes angle by radian and fit them in range of -π 〜 π.
