# fewd

**2D UI for [three.js](https://threejs.org/)**

As is, any serious 3D application also needs some 2D UI overlayed on it.\
fewd aim to do what three.js do not, to form feature complete 3D application framework.

### Features
- Basic geometries
- Input handling
- Collision detection
- Animation with property easing
- Powerful Asset management with lazy loading
- Fully modular with ES6 modules
- Very little boilerplate
***
- **All elements can be rendered within WebGL**

Why?\
To display 2D stuffs on top of three.js canvas we could:
- use CSS to put DOM stuffs on top of canvas, including another 2D canvas
- have three.js render to a off screen canvas, then copy image from it to 2D canvas on screen
- make a full screen quad three.js mesh whose texture is updated each frame

However, fewd takes less common approach of:
- drawing everything in WebGL.

This approach has a number of benefits.\
Sharing the same data structure over 2D and 3D objects allows modifications that can be applied to either.\
Less glue code is needed to integrate the worlds.
Also, you get to use all the fancy shaders on 2D.

## Credit
large part of fewd is inspired from [phina.js](https://github.com/phinajs/phina.js).