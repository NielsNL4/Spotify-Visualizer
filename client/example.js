import Visualizer from './classes/visualizer'
import ColorThief from '../node_modules/colorthief/dist/color-thief.mjs'
import { interpolateRgb, interpolateBasis } from 'd3-interpolate'
import { getRandomElement } from './util/array'
import { sin, circle } from './util/canvas'

export default class Example extends Visualizer {
  constructor () {
    super({ volumeSmoothing: 10 })
    this.theme = ['#FFF']
    this.currentCover = null
    this.lastCover = null
    this.rgb = null
    this.googleProxyURL = 'https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=';

    this.colorThief = new ColorThief();

    this.coverDiv = document.getElementById('albumCover')

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

    this.coverDiv.style.marginTop = height / 2 - 290+'px'
    this.coverDiv.style.marginLeft = width / 2 - 290+'px'

    this.progressBar.max = this.sync.trackLength
    this.progressBar.value = this.sync.progress

    this.marginTop = window.innerHeight / 2 + 320
    this.marginLR = window.innerWidth / 2 - 320 + 160

    this.buttonBar.style.marginTop = this.marginTop+'px'

    this.skipButtons.style.marginRight = this.marginLR+'px'
    this.skipButtons.style.marginLeft = this.marginLR+'px'

    this.shuffleButton.style.marginLeft = this.marginLR-100+'px'

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

    var img = new Image()
    img.src = this.sync.albumCover
    this.lastCover = this.currentCover

    this.coverDiv.src = this.googleProxyURL + img.src
    this.coverDiv.crossOrigin = 'Anonymous';

    if(this.lastCover != this.sync.albumCover || this.rgb == null){
        this.rgb = this.colorThief.getPalette(this.coverDiv, 10)
    }

    this.currentCover = this.sync.albumCover

    if(this.rgb != null){
      var my_gradient = ctx.createLinearGradient(0, 0, 0, height / 2 + 200);
      my_gradient.addColorStop(0, 'rgba('+this.rgb[0][0]+','+this.rgb[0][1]+','+this.rgb[0][2]+',1)');
      my_gradient.addColorStop(1, 'rgba('+this.rgb[1][0]+','+this.rgb[1][1]+','+this.rgb[1][2]+',1)');
      ctx.fillStyle = my_gradient
    }

    ctx.fillRect(0, 0, width, height);

    ctx.save()

    ctx.lineWidth = beat / 30 + 3
    ctx.strokeStyle = interpolateRgb('rgba('+this.rgb[6][0]+','+this.rgb[6][1]+','+this.rgb[6][2]+',1)','rgba('+this.rgb[6][0]+','+this.rgb[6][1]+','+this.rgb[6][2]+',1')(this.sync.beat.progress)
    sin(ctx, now / 40000, height / 2,beat * 0.8 * -1, 40)
    ctx.stroke()

    ctx.filter = 'none'

    ctx.restore()

    ctx.font = "40px Montserrat, sans-serif";
    var txt = addDots(this.sync.songName, 20)

    document.title = this.sync.songName + ' by ' + this.sync.artistName

    var rectWidth = ctx.measureText(txt).width + 20

    if(rectWidth > 500){
      rectWidth = 500
    }

    ctx.fillStyle = '#000'
    ctx.fillRect(width / 2 - 290 + 590, height / 2 - 290, rectWidth, 55)

    ctx.fillStyle = '#FFF'
    ctx.fillText(txt, width / 2 - 290 + 600, height / 2 - 280 + 30);

    ctx.font = "30px Montserrat, sans-serif";
    var txt = this.sync.artistName

    ctx.fillStyle = '#000'
    ctx.fillRect(width / 2 - 290 + 590, height / 2 - 290 + 60, ctx.measureText(txt).width + 20, 45)

    ctx.fillStyle = '#FFF'
    ctx.fillText(txt, width / 2 - 290 + 600, height / 2 - 280 + 82);

    ctx.beginPath()
    ctx.fill()
  }
}

function addDots(string, limit)
{
  var dots = "...";
  if(string.length > limit)
  {
    string = string.substring(0,limit) + dots;
  }

    return string;
}
