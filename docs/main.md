# main.js
## Variables
##### `currentFPS` : Number
Avarage FPS within last 60 frames.

---
##### `currentScene` : Scene
The current scene.

---
##### `frameRate` : Number
The target FPS. Default is 60.

---
##### `loopRate` : Number
The target updates per second. Default is 60.

---
##### `resized` : Boolean
Whether is there screen resizes to be flushed by a render.

---
##### `vw` / `vh` : Number
Screen width and height.
## Functions
##### async `init(options)` : options.canvas ? `<canvas>` : undefined
Initializes the screen and the renderer.  
`options` - Object. Optional. Properties:
- width - Screen width.
- height - Screen height.
- canvas - The canvas to be used.
---
##### `renderScreen()` : undefined
Force rendering immediately.

---
##### `resize(width, height)` : undefined
Resize the screen.

---
##### `run()` : undefined
Begin running the application.

---
##### `setCurrentScene(scene)` : undefined
Replace the current scene with the specified scene.

---
##### `setFrameRate(v)` : undefined
Set how often the screen will be rendered.
- v - Frame per second.

---
##### `setGameLoopFreqency(r)` : undefined
Set how often the update routines will be called.
- r - Updates per second.
