import Visualizer from './classes/visualizer'
import { interpolateRgb, interpolateBasis } from 'd3-interpolate'
import { getRandomElement } from './util/array'
import { sin, circle } from './util/canvas'

export default class Example extends Visualizer {
  constructor () {
    super({ volumeSmoothing: 10 })
    this.theme = ['#FFF']
  }

  hooks () {
    this.sync.on('bar', beat => {
      this.lastColor = this.nextColor || getRandomElement(this.theme)
      this.nextColor = getRandomElement(this.theme.filter(color => color !== this.nextColor))
    })
  }

  paint ({ ctx, height, width, now }) {
    const bar = interpolateBasis([0, this.sync.volume * 100, 0])(this.sync.bar.progress)
    const beat = interpolateBasis([0, this.sync.volume * 250, 0])(this.sync.beat.progress)
    const tatum = interpolateBasis([0, this.sync.volume * 50, 0])(this.sync.tatum.progress)
    const segment = interpolateBasis([0, this.sync.volume * 100, 0])(this.sync.segment.progress)
    const section = interpolateBasis([0, this.sync.volume * 100, 0])(this.sync.section.progress)
    var img = new Image
    img.src = this.sync.albumCover

    ctx.filter = 'blur(50px)';
    var offset = width / 4
    ctx.drawImage(img, 0, 0 - offset, width, width)
    ctx.filter = 'none';

    ctx.shadowBlur = 10;
    ctx.shadowColor = "white";

    ctx.lineWidth = beat / 10 + 3

    // ctx.strokeStyle = interpolateRgb(swatches[0].getHex(), swatches[0].getHex())(this.sync.section.progress)
    // sin(ctx, now / 50000, height / 2, section * 2, 40)
    // ctx.stroke()

    // ctx.strokeStyle = interpolateRgb(swatches[1].getHex(), swatches[1].getHex())(this.sync.bar.progress)
    // sin(ctx, now / 500000, height / 2, bar * 2, 38)
    // ctx.stroke()
    //
    // ctx.strokeStyle = interpolateRgb(swatches[2].getHex(), swatches[2].getHex())(this.sync.segment.progress)
    // sin(ctx, now / 5000000, height / 2, segment * 2, 35)
    // ctx.stroke()
    //
    // ctx.strokeStyle = interpolateRgb(swatches[3].getHex(), swatches[3].getHex())(this.sync.tatum.progress)
    // sin(ctx, now / 5000000, height / 2, tatum * 2, 40)
    // ctx.stroke()
    ctx.strokeStyle = interpolateRgb(['#FFF'], ["#FFF"])(this.sync.beat.progress)
    sin(ctx, now / 3000, height / 2, beat * 0.8, 40)
    ctx.stroke()

    ctx.shadowBlur = 0;

    ctx.filter = 'drop-shadow(0,0,0,black)'
    ctx.drawImage(img, width / 2 - 290, height / 2 - 290, 580, 580)
    ctx.filter = 'none'

    ctx.font = "40px Roboto";
    var txt = this.sync.songName

    ctx.fillStyle = '#000'
    ctx.fillRect(width / 2 - 290, height / 2 - 280 + 580, ctx.measureText(txt).width + 20, 55)
    ctx.fillStyle = '#FFF'
    ctx.fillText(txt, width / 2 - 280, height / 2 - 280 + 620);

    ctx.font = "30px Roboto";
    var txt = this.sync.artistName

    ctx.fillStyle = '#000'
    ctx.fillRect(width / 2 - 290, height / 2 - 280 + 645, ctx.measureText(txt).width + 20, 45)
    ctx.fillStyle = '#FFF'
    ctx.fillText(txt, width / 2 - 280, height / 2 - 280 + 678);

    ctx.beginPath()
    ctx.fill()
  }
}
