# easing.js
### class `Easing`
*export default*
#### Constructor
#### `Easing(target)`
- `target` - Object that this Easing object mutates.

#### Methods
##### `add(changes, time, func)` : this
Add an order to mutate `this.target` over `time`ms.
- `changes` - Object with properties `this.target` will end up with.
- `func` - Easing function specifying how the properties should change over time.

---
##### `trigger(func)` : this
Add an order to invoke `func`.
The function will be called with `target` as `this`.

---
##### `update(delta)` : undefined
Update the target.
- `delta` - Milliseconds elapsed since the previous call.

---
##### `wait(time)` : this
Add an order to wait for `time`ms, doing nothing.
## Easing Functions
##### `Easing.LINEAR`
The *linear* easing function.

---
##### `Easing.in(d)`
Returns the *in* easing function of `d`th power.

---
##### `Easing.out(d)`
Returns the *out* easing function of `d`th power.

---
##### `Easing.inOut(d)`
Returns the *inOut* easing function of `d`th power.
