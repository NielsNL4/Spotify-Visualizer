# spotify-viz
> Create realtime audio-reactive visuals, powered by Spotify.

The Echo Nest prides itself on the comprehensive algorithmic analysis of music. Having been acquired by Spotify their data resources are publicly available via the Spotify API. Each song within Spotify's library have been fully analyzed: broken up into individual beats, segments, tatums, bars, and sections. There are variables assigned to describe mood, pitch, timbre, and more – even how "danceable" a track is. With these tools creating realtime audio-reactive visuals is now possible without having to analyze the audio stream directly.

### **My goal for this project was to create a sketchpad for developers who are interested in using Spotify to explore audio-reactive visuals without having to worry about mapping the music to their main animation loop by hand.**

## Basic Anatomy
It all starts with the `Visualizer` class, which you'll extend when creating your own sketches.

```javascript
import Visualizer from './classes/visualizer'

export default class HelloWorld extends Visualizer {
  constructor () {
    super()
  }
}  
```
The `Visualizer` class contains two class instances – `Sync` and `Sketch`.

`Sync` keeps track of your currently playing Spotify track and provides an interface to determine the current active interval of each type (`tatums`, `segments`, `beats`, `bars`, and `sections`) in addition to the active `volume`. Upon instantiating an instance of an extended `Visualizer`, its `Sync` instance will automatically begin pinging Spotify for your currently playing track.

> #### Note: the `Sketch` class assumes you're animating with a 2D `<canvas>` context; if you want full control over your animation loop (or want to use a different context), use the `Sync` class on its own.

`Sketch` is a small canvas utility that creates a `<canvas>` element, appends it to the DOM, sizes it to the window, and initializes a 2D context. It will automatically scale according to the device's `devicePixelRatio`, unless you specify otherwise. `Sketch` will automatically handle resizing & scaling of the `<canvas>` on window resize. `Sketch` also provides an animation loop; when extending the `Visualizer` class, be sure to include the method `paint()`, as this defaults to the loop. A single object of freebies is passed to the loop on every frame.

```javascript
import Visualizer from './classes/visualizer'

export default class HelloWorld extends Visualizer {
  constructor () {
    super()
  }

  paint ({ now, ctx, width, height }) {
    // now - High-Resolution Timestamp
    // ctx - Active 2D Context
    // width - <canvas> CSS Width
    // height - <canvas> CSS Height 
  }
}  
```

Within the animation loop we can reference keys on `this.sync` to access the current active volume and current active intervals.

```javascript
import Visualizer from './classes/visualizer'

export default class HelloWorld extends Visualizer {
  constructor () {
    super()
  }

  paint ({ now, ctx, width, height }) {
    console.log(this.sync.volume)
    console.log(this.sync.beat)
  }
}  
```

An active interval object (e.g. `this.sync.beat`) includes a `progress` key, mapped from `0` to `1` (e.g. `.425` === `42.5%` complete). You're also given `start` time, `elapsed` time, `duration`, and `index`. 

In addition to always having the active intervals at your fingertips within your main loop, you can use `Sync` to subscribe to interval updates by including a `hooks()` method on your class.

```javascript
import Visualizer from './classes/visualizer'

export default class HelloWorld extends Visualizer {
  constructor () {
    super()
  }

  hooks () {
    this.sync.on('tatum', tatum => {
      // do something on every tatum
    })

    this.sync.on('segment', ({ index }) => {
      if (index % 2 === 0) {
        // do something on every second segment
      }
    })

    this.sync.on('beat', ({ duration }) => {
      // do something on every beat, using the beat's duration in milliseconds
    })

    this.sync.on('bar', bar => {
      // you get...
    })

    this.sync.on('section', section => {
      // ...the idea, friends
    })
  }

  paint ({ now, ctx, width, height }) {
    console.log(this.sync.volume)
    console.log(this.sync.beat)
  }
}  
```

## Configuration

A configuration object can be passed to the `super()` call of your extended `Visualizer` class. There are two configurable options:
```javascript
{
  /**
   * If true, render according to devicePixelRatio.
   * DEFAULT: true
   */
  hidpi: true,

  /**
   * Decrease this value for higher sensitivity to volume change. 
   * DEFAULT: 100
   */
  volumeSmoothing: 100
}
```

## Running Locally
1. Create a new Spotify app in your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).
2. Add `http://localhost:8001/callback` to your app's Redirect URIs. Note your app's `Client ID` and `Client Secret`. 
3. Create a file named `.env` in the project's root directory with the following values:

```bash
CLIENT_ID=YOUR_CLIENT_ID_HERE
CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
REDIRECT_URI=http://localhost:8001/callback
PROJECT_ROOT=http://localhost:8001
NODE_ENV=development
```
4. Install and serve using NPM.
```bash
npm i
npm run serve
```
5. Visit `http://localhost:8080` and log in with your Spotify account. 
6. Play a song in your Spotify client of choice. The visualizer will take a moment to sync before initializing.

You'll find the front-end entry in `/client/index.js`. Included in the project is `example.js`, which you'll see when you first run the project and authenticate with Spotify. `template.js` is what I intended to be your starting point. 

## Notes On Volume

* The `Sync` class normalizes volume across the entire track by keeping tabs on a fixed range of (several hundred) volume samples. `Sync` uses `d3.scale` to continuously map volume to a value between the range of `0` and `1` (unclamped), where `0` represents the **lowest** volume within our cached samples and `1` represents the **average** volume within our cached samples. This allows the `volume` value to inherit the dynamic range of any portion of the song – be it quiet or loud – and maintain visual balance throughout the track without compromising a sense of visual reactivity. 

* Under the hood, `volumeSmoothing` is the number of most recent volume samples that are averaged and compared against our cached samples to derive the current `volume` value.

* When animating elements according to active volume, explore using `Math.pow()` to increase volume reactivity separately from configuring `volumeSmoothing`:

  ```javascript
  const volume = Math.pow(this.sync.volume, 3)
  ```

## Wrapping Up

I highly recommend reading about interpolation functions if you're not yet familiar with them. I've included `d3-interpolate` as a dependency of this project; you can read its documentation here: https://github.com/d3/d3-interpolate

Ping me if you have any comments or questions! I'd love to bring more heads in on this project if you have any interest in contributing. 