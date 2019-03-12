# geometries.js
## Classes
### `Rectangle` extends `Element`
### `Ellipse` extends `Element`
#### Constructor
#### `Ellipse(options)`
`options` - options object.
- options from `Element`
- `radius` - `Ellipse.radius`
- `segments` - `Ellipse.segments`. Defaults to 32.
- `fillColor`

#### Properties
##### `radius` : Number
If `this.width`=`this.height` half of these.
If not throws when attempt to retrieve is made.
Setting this property will change both width and height.

---
##### `segments` : Number
Number of segments used to approximate circular shape.

### `SymmetricTriangle` extends `Element`
