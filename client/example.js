import Visualizer from './classes/visualizer'
import { interpolateRgb, interpolateBasis } from 'd3-interpolate'
import { getRandomElement } from './util/array'
import { sin, circle } from './util/canvas'

export default class Example extends Visualizer {
  constructor () {
    super({ volumeSmoothing: 10 })
    this.theme = ['#FFF']

    this.buttonBar = document.getElementById('buttons')

    var self = this
    this.skipButton = document.getElementById("skip-button")
    this.skipButton.addEventListener("click", function() { self.sync.skipSong }, false);

    this.skipButton = document.getElementById("previous-button")
    this.skipButton.addEventListener("click", function() { self.sync.previousSong }, false);

    this.pauseButton = document.getElementById('pause-button')
    this.pauseButton.addEventListener("click", function() { self.sync.pauseSong }, false);

    this.pausedButton = document.getElementById('paused-button')
    this.pauseButton.addEventListener("click", function() { self.sync.playSong }, false);
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

    this.marginTop = window.innerHeight / 2 + 320
    this.marginLR = window.innerWidth / 2 - 320 + 160

    this.buttonBar.style.marginTop = this.marginTop+'px'
    this.buttonBar.style.marginRight = this.marginLR+'px'
    this.buttonBar.style.marginLeft = this.marginLR+'px'

    if (this.sync.activeState == true){
      this.pausedButton.style.display = 'none'
      this.pauseButton.style.display = 'inline'
    }else if(this.sync.activeState == false){
      this.pauseButton.style.display = 'none'
      this.pausedButton.style.display = 'inline'
    }

    var img = new Image
    img.src = this.sync.albumCover

    ctx.filter = 'blur(50px)';
    var offset = width / 4
    ctx.drawImage(img, 0, 0 - offset, width, width)
    ctx.filter = 'none';

    ctx.shadowBlur = 10;
    ctx.shadowColor = "white";


    // ctx.lineWidth = beat / 10 + 3
    ctx.lineWidth = 3

    var audioData = [bar, beat, tatum, segment, section]




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
    var volume = 1

    if (!this.sync.activeState) {
      if (volume > 0){
        volume -= 0.005
      }
    } else if (this.sync.activeState) {
      if (volume < 1){
        volume += 0.01
      }
    }
    ctx.strokeStyle = interpolateRgb(['#FFF'], ["#FFF"])(volume * this.sync.beat.progress)
    sin(ctx, now / 4000, height / 2, volume * beat * 0.8, 40)
    ctx.stroke()

    // var newAmount = scaleAmount.reverse()
    //
    // for (const amount of newAmount){
    //   ctx.fillRect(startX, startY, 10, (beat / 255.0) * -1 * height * amount + 10)
    //   startX += 15
    //   console.log(amount);
    // }

    // startX += 120
    // ctx.fillRect(startX, startY, 100, (beat / 255.0) * -1 * height * 0.5 + 10)
    // startX += 120
    // ctx.fillRect(startX, startY, 100, (beat / 255.0) * -1 * height * 0.7 + 10)
    // startX += 120
    // ctx.fillRect(startX, startY, 100, (beat / 255.0) * -1 * height * 1 + 10)
    // startX += 120
    // ctx.fillRect(startX, startY, 100, (beat / 255.0) * -1 * height * 1.3 + 10)
    // startX += 120
    // ctx.fillRect(startX, startY, 100, (beat / 255.0) * -1 * height * 1 + 10)
    // startX += 120
    // ctx.fillRect(startX, startY, 100, (beat / 255.0) * -1 * height * 0.7 + 10)
    // startX += 120
    // ctx.fillRect(startX, startY, 100, (beat / 255.0) * -1 * height * 0.5 + 10)

    ctx.shadowBlur = 0;

    ctx.filter = 'drop-shadow(0,0,0,black)'
    ctx.drawImage(img, width / 2 - 290, height / 2 - 290, 580, 580)
    ctx.filter = 'none'

    ctx.font = "40px Roboto";
    var txt = this.sync.songName

    document.title = this.sync.songName + ' by ' + this.sync.artistName

    ctx.fillStyle = '#000'
    ctx.fillRect(width / 2 - 290 + 590, height / 2 - 290, ctx.measureText(txt).width + 20, 55)

    ctx.fillStyle = '#FFF'
    ctx.fillText(txt, width / 2 - 290 + 600, height / 2 - 280 + 30);

    ctx.font = "30px Roboto";
    var txt = this.sync.artistName

    ctx.fillStyle = '#000'
    ctx.fillRect(width / 2 - 290 + 590, height / 2 - 290 + 60, ctx.measureText(txt).width + 20, 45)

    ctx.fillStyle = '#FFF'
    ctx.fillText(txt, width / 2 - 290 + 600, height / 2 - 280 + 82);

    ctx.beginPath()
    ctx.fill()
  }
}
