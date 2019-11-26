import Visualizer from './classes/visualizer'

export default class Template extends Visualizer {
  constructor () {
    super({ volumeSmoothing: 100 })
  }

  hooks () {
    this.sync.on('tatum', tatum => {

    })

    this.sync.on('segment', segment => {

    })

    this.sync.on('beat', beat => {

    })

    this.sync.on('bar', bar => {

    })

    this.sync.on('section', section => {

    })
  }

  paint ({ ctx, height, width, now }) {
    // this.sync.volume
    // this.sync.tatum
    // this.sync.segment
    // this.sync.beat
    // this.sync.bar
    // this.sync.section
  }
}