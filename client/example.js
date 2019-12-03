import Visualizer from './classes/visualizer'
import { interpolateRgb, interpolateBasis } from 'd3-interpolate'
import { getRandomElement } from './util/array'
import { sin, circle } from './util/canvas'

export default class Example extends Visualizer {
  constructor () {
    super({ volumeSmoothing: 10 })
    this.theme = ['#FFF']

    this.progressBar = document.getElementById('progressSlider')

    this.buttonBar = document.getElementById('buttons')
    this.skipButtons = document.getElementById('skip-buttons')

    this.shuffleButton = document.getElementById('shuffle-button')
    this.shuffleSpan = document.getElementById("shuffleSpan")

    this.repeatButton = document.getElementById('repeat-button')
    this.repeatSpan = document.getElementById('repeatSpan')

    var self = this
    this.shuffle = false
    this.skipButton = document.getElementById("skip-button")
    this.skipButton.addEventListener("click", function() { self.sync.skipSong }, false);

    this.prevButton = document.getElementById("previous-button")
    this.prevButton.addEventListener("click", function() { self.sync.previousSong }, false);

    this.shuffleSpan.addEventListener('click', function () {
        self.sync.shuffle = !self.shuffle
        self.shuffle = !self.shuffle
    })

    this.repeatSpan.addEventListener('click', function () {
        self.sync.repeat
    })
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

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath()

    this.progressBar.max = this.sync.trackLength
    this.progressBar.value = this.sync.progress

    this.marginTop = window.innerHeight / 2 + 320
    this.marginLR = window.innerWidth / 2 - 320 + 160

    this.buttonBar.style.marginTop = this.marginTop+'px'

    this.skipButtons.style.marginRight = this.marginLR+'px'
    this.skipButtons.style.marginLeft = this.marginLR+'px'

    this.shuffleButton.style.marginLeft = this.marginLR-100+'px'

    this.progressBar.style.marginLeft = width / 2 - 290+'px'
    // this.progressBar.style.marginTop = -100+'px'

    var repeatMargin = this.repeatSpan.style.marginLeft = 435+'px'

    if (this.shuffle){
      this.shuffleButton.checked = true
      this.shuffleSpan.style.color = '#1dd15d'
    }
    if (!this.shuffle){
      this.shuffleButton.checked = false
      this.shuffleSpan.style.color = 'white'
    }

    if (this.sync.currentRepeatStatus == 'off') {
      this.repeatSpan.style.color = 'white'
      this.repeatSpan.style.padding = null
      this.repeatSpan.style.borderRadius = null
      this.repeatSpan.style.background = null
      this.repeatSpan.style.marginTop = null
      this.repeatSpan.style.marginLeft = repeatMargin
    }if (this.sync.currentRepeatStatus == 'context') {
      this.repeatSpan.style.color = '#1dd15d'
      this.repeatSpan.style.padding = null
      this.repeatSpan.style.borderRadius = null
      this.repeatSpan.style.background = null
    }if (this.sync.currentRepeatStatus == 'track') {
      this.repeatSpan.style.color = '#1dd15d'
      this.repeatSpan.style.padding = '5px'
      this.repeatSpan.style.borderRadius = '30px'
      this.repeatSpan.style.background = 'white'
      this.repeatSpan.style.marginTop = '-5px'
      this.repeatSpan.style.marginLeft = '430px'
    }


    var img = new Image
    img.src = this.sync.albumCover

    ctx.filter = 'blur(50px)';
    var offset = -350
    ctx.drawImage(img, -20, offset, width + 50, width + 40)
    ctx.filter = 'none';

    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(0, 0, width, height);

    ctx.save()
    // ctx.shadowBlur = 10;
    // ctx.shadowColor = "white";

    // ctx.lineWidth = beat / 30 + 3
    // ctx.strokeStyle = interpolateRgb(['#FFF'], ["#FFF"])(this.sync.beat.progress)
    // sin(ctx, now / 40000, height / 2,beat * 0.8 * -1, 40)
    // ctx.stroke()


    ctx.drawImage(img, width / 2 - 290, height / 2 - 290, 580, 580)
    ctx.filter = 'none'

    // if(this.sync.playlistName != null){
    //   var txt = this.sync.playlistName
    //   ctx.font = '40px Montserrat regular'
    //   ctx.shadowColor = "black";
    //   ctx.shadowBlur = 7;
    //   ctx.shadowOffsetX = 4;
    //   ctx.shadowOffsetY = 4;
    //   ctx.fillStyle = '#FFF'
    //   ctx.fillText(txt, 15, 45)
    // }

    ctx.restore()

    ctx.font = "40px Montserrat regular";
    var txt = this.sync.songName

    document.title = this.sync.songName + ' by ' + this.sync.artistName

    ctx.fillStyle = '#000'
    ctx.fillRect(width / 2 - 290 + 590, height / 2 - 290, ctx.measureText(txt).width + 20, 55)

    ctx.fillStyle = '#FFF'
    ctx.fillText(txt, width / 2 - 290 + 600, height / 2 - 280 + 30);

    ctx.font = "30px Montserrat regular";
    var txt = this.sync.artistName

    ctx.fillStyle = '#000'
    ctx.fillRect(width / 2 - 290 + 590, height / 2 - 290 + 60, ctx.measureText(txt).width + 20, 45)

    ctx.fillStyle = '#FFF'
    ctx.fillText(txt, width / 2 - 290 + 600, height / 2 - 280 + 82);

    ctx.beginPath()
    ctx.fill()
  }
}
