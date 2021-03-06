import Observe from '../util/observe'
import * as cookies from '../util/cookie'
import { get, post, put } from '../util/network'
import interpolate from '../util/interpolate'
import { scaleLog } from 'd3-scale'
import { min } from 'd3-array'
import ease from '../util/easing'

/**
 * @class Sync
 *
 * Creates an interface for analyzing a playing Spotify track in real time.
 * Exposes event hooks for reacting to changes in intervals.
 */
export default class Sync {
  constructor ({
    volumeSmoothing = 100,
    pingDelay = 500
  } = {}) {
    const accessToken = cookies.get('SPOTIFY_ACCESS_TOKEN')
    const refreshToken = cookies.get('SPOTIFY_REFRESH_TOKEN')
    const refreshCode = cookies.get('SPOTIFY_REFRESH_CODE')
    this.state = Observe({
      api: {
        currentlyPlaying: 'https://api.spotify.com/v1/me/player',
        trackAnalysis: 'https://api.spotify.com/v1/audio-analysis/',
        trackFeatures: 'https://api.spotify.com/v1/audio-features/',
        skipTrack: 'https://api.spotify.com/v1/me/player/next/',
        previousTrack: 'https://api.spotify.com/v1/me/player/previous/',
        pauseTrack: 'https://api.spotify.com/v1/me/player/pause/',
        playTrack: 'https://api.spotify.com/v1/me/player/play/',
        shuffleOn: "https://api.spotify.com/v1/me/player/shuffle?state=true",
        shuffleOff: "https://api.spotify.com/v1/me/player/shuffle?state=false",
        repeatContext: 'https://api.spotify.com/v1/me/player/repeat?state=context',
        repeatOff: 'https://api.spotify.com/v1/me/player/repeat?state=off',
        repeatTrack: 'https://api.spotify.com/v1/me/player/repeat?state=track',
        next: 'https://api.spotify.com/v1/me/tracks',
        tokens: {
          accessToken,
          refreshToken,
          refreshCode
        },
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Accept': 'application/json'
        },
        pingDelay
      },
      intervalTypes: ['tatums', 'segments', 'beats', 'bars', 'sections'],
      activeIntervals: Observe({
        tatums: {},
        segments: {},
        beats: {},
        bars: {},
        sections: {}
      }),
      currentPlaylist: {},
      currentPlaylistName: {},
      albumArt: {},
      lastSong: {},
      currentlyPlaying: {},
      trackAnalysis: {},
      trackFeatures: {},
      skipTrack: {},
      previousTrack: {},
      pauseTrack: {},
      playTrack: {},
      shuffleOn: {},
      shuffleOff: {},
      repeatContext: {},
      repeatOff: {},
      repeatTrack: {},
      next: {},
      initialTrackProgress: 0,
      initialStart: 0,
      trackProgress: 0,
      currentTrackProgress: 0,
      active: false,
      initialized: false,
      shuffleStatus: false,
      repeatStatus: {},
      userSongs: {},
      volumeSmoothing,
      volume: 0,
      artistObject: {},
      queues: {
        volume: [],
        beat: []
      }
    })
    this.initHooks()
    this.ping()
    this.getSavedSongs()
  }

  /**
   * @method initHooks - Initialize interval event hooks.
   */
  initHooks () {
    this.hooks = {
      tatum: () => {},
      segment: () => {},
      beat: () => {},
      bar: () => {},
      section: () => {}
    }

    this.state.activeIntervals.watch('tatums', t => this.hooks.tatum(t))
    this.state.activeIntervals.watch('segments', s => this.hooks.segment(s))
    this.state.activeIntervals.watch('beats', b => this.hooks.beat(b))
    this.state.activeIntervals.watch('bars', b => this.hooks.bar(b))
    this.state.activeIntervals.watch('sections', s => this.hooks.section(s))
  }

  /**
   * @method ping - Ask Spotify for currently playing track, after a specified delay.
   */
  ping () {
    setTimeout(() => this.getCurrentlyPlaying(), this.state.api.pingDelay)
  }

  /**
   * @method getNewToken - Retrieve new access token from server.
   */
  async getNewToken () {
    const { data } = await get(`${PROJECT_ROOT}/refresh?token=${this.state.api.tokens.refreshToken}`)
    cookies.set('SPOTIFY_ACCESS_TOKEN', data.access_token)
    this.state.api.tokens.accessToken = data.access_token
    this.state.api.headers = {
      'Authorization': 'Bearer ' + this.state.api.tokens.accessToken,
      'Accept': 'application/json'
    }
    this.ping()
  }

  async getArtist (id){
    try{
      const { data } = await get('https://api.spotify.com/v1/artists/' + id, { headers: this.state.api.headers })
      console.log(data);
    }catch(status){
      if (status === 401) {
        return this.getNewToken()
      }
    }
  }


  async getSavedSongs (){
    try{
        var bool = true;
        var songs = []
        var table = document.getElementById('userSongs')
        while (table.firstChild) {
          table.removeChild(table.firstChild);
        }

        function toMinutes(millis) {
          var minutes = Math.floor(millis / 60000);
          var seconds = ((millis % 60000) / 1000).toFixed(0);
          return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
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

        while (bool) {
            const { data } = await get(this.state.api.next, { headers: this.state.api.headers })
            songs.push(data.items)
            this.state.api.next = data.next
            for (var i = 0; i < data.items.length; i++) {
              var row = table.insertRow(-1);

              var heart = row.insertCell(0)
              var songName = row.insertCell(1);
              var artistName = row.insertCell(2);
              var albumName = row.insertCell(3)
              var date = row.insertCell(4)
              var lenght = row.insertCell(5)

              var artist = document.createElement('A')
              artist.className = data.items[i].track.name.replace(/ /g,"_")
              var album = document.createElement('A')
              album.className = data.items[i].track.name.replace(/ /g,"_")
              var label = document.createElement("LABEL");

              label.className = 'fas fa-heart'
              heart.style.paddingRight = '20px'
              heart.style.paddingLeft = '20px'
              heart.style.width = '50px'
              heart.appendChild(label)

              songName.innerHTML = addDots(data.items[i].track.name, 41)
              songName.style.paddingRight = '10px'
              songName.style.width = '500px';
              songName.style.color = 'white'
              songName.className = data.items[i].track.name.replace(/ /g,"_")

              artist.innerHTML = addDots(data.items[i].track.artists[0].name, 16)
              // artist.setAttribute("href", data.items[i].track.artists[0].external_urls.spotify)
              artist.addEventListener('click', this.getArtist(data.items[i].track.artists[0].id))
              artist.setAttribute('target', '_blank')
              artistName.appendChild(artist)
              artistName.className = data.items[i].track.name.replace(/ /g,"_")

              album.innerHTML = addDots(data.items[i].track.album.name, 16)
              album.setAttribute("href", data.items[i].track.album.external_urls.spotify)
              album.setAttribute('target', '_blank')
              albumName.appendChild(album)
              albumName.className = data.items[i].track.name.replace(/ /g,"_")

              date.innerHTML = data.items[i].added_at.slice(0,10)
              date.className = data.items[i].track.name.replace(/ /g,"_")

              lenght.innerHTML = toMinutes(data.items[i].track.duration_ms)
              lenght.style.width = '50px'
              lenght.style.paddingRight = '20px'
              lenght.className = data.items[i].track.name.replace(/ /g,"_")

            }
            if(this.state.api.next == null){
              bool = false
            }
        }
        this.state.userSongs = songs



    }catch ({ status }){
      if(status === 401){
        return this.getNewToken()
      }
    }
  }

  /**
   * @method getCurrentlyPlaying - Ask Spotify for currently playing track.
   */
  async getCurrentlyPlaying () {
    try {
      const { data } = await get(this.state.api.currentlyPlaying, { headers: this.state.api.headers })
      if (!data || !data.is_playing) {
        if (this.state.active === true) {
          this.state.active = false
        }
        return this.ping()
      }
      // tick = window.performance.now()
      // tock = window.performance.now() - tick
      this.state.currentTrackProgress = data.progress_ms
      this.processResponse(data)
    } catch ({ status }) {
      if (status === 401) {
        return this.getNewToken()
      }
    }
  }

  /**
   * @method processResponse - Process `currently playing` API response according to state.
   * @param {object} data - Response from Spotify API.
   */
  processResponse (data) {
    const songsInSync = (JSON.stringify(data.item) === JSON.stringify(this.state.currentlyPlaying))

    if (this.state.initialized === false || !songsInSync || this.state.active === false) {
      return this.getTrackInfo(data)
    }

    this.ping()
  }

  /**
   * @method getTrackInfo - Fetch track analysis and track features of currently playing track.
   * @param {object} data - Response from Spotify API.
   */
  async getTrackInfo (data) {
    const tick = window.performance.now()
    const [ analysis, features ] = await Promise.all([
      get(this.state.api.trackAnalysis + data.item.id, { headers: this.state.api.headers }).then(res => res.data),
      get(this.state.api.trackFeatures + data.item.id, { headers: this.state.api.headers }).then(res => res.data),
    ])

    this.state.intervalTypes.forEach((t) => {
      const type = analysis[t]
      type[0].duration = type[0].start + type[0].duration
      type[0].start = 0
      type[type.length - 1].duration = (data.item.duration_ms / 1000) - type[type.length - 1].start
      type.forEach((interval) => {
        if (interval.loudness_max_time) {
          interval.loudness_max_time = interval.loudness_max_time * 1000
        }
        interval.start = interval.start * 1000
        interval.duration = interval.duration * 1000
      })
    })

    const tock = window.performance.now() - tick
    var lastSong = this.state.currentlyPlaying
    if (lastSong != data.item) {
      lastSong = data.item
      this.state.lastSong = this.state.currentlyPlaying
    }
    this.state.shuffleStatus = data.shuffle_state

    if(data.context != null){
      this.state.api.currentPlaylist = data.context.href
      this.getPlaylistName()
    }

    this.state.repeatStatus = data.repeat_state

    this.state.currentlyPlaying = data.item
    this.state.trackAnalysis = analysis
    this.state.trackFeatures = features
    this.state.initialTrackProgress = data.progress_ms + tock

    var name = data.item.name.replace(/ /g,"_")
    var lastName = this.state.lastSong.name

    if(lastName != null){ lastName = lastName.replace(/ /g,"_") }

    var currentSongColor = document.getElementsByClassName(name);
    var lastSongColor = document.getElementsByClassName(lastName)
    if (currentSongColor != null) {
      for (var i = 0; i < currentSongColor.length; i++) {
        currentSongColor[i].style.color = '#1dd15d'
        if(currentSongColor[i].children.lenght > 0){
          currentSongColor[i].children[0].style.color = '#1dd15d'
        }
      }
    }
    if(lastSongColor != null){
      for (var i = 0; i < lastSongColor.length; i++) {
        lastSongColor[i].style.color = 'white'
        if(lastSongColor[i].children.lenght > 0){
          lastSongColor[i].children[0].style.color = '#1dd15d'
        }
      }
    }

    this.state.trackProgress = data.progress_ms + tock

    this.state.initialStart = window.performance.now()

    if (this.state.initialized === false) {
      requestAnimationFrame(this.tick.bind(this))
      this.state.initialized = true
    }

    if (this.state.active === false) {
      this.state.active = true
    }

    this.ping()
  }

  async skipCurrentPlayback (){
    try{
      const { data } = await post(this.state.api.skipTrack, this.state.api.tokens.accessToken)
    } catch ({ status }) {
      if (status === 401) {
        return this.getNewToken()
      }
    }
  }

  async previousCurrentPlayback (){
    try{
      const { data } = await post(this.state.api.previousTrack, this.state.api.tokens.accessToken)
    } catch ({ status }) {
      if (status === 401) {
        return this.getNewToken()
      }
    }
  }

  async pauseCurrentPlayback (){
    try{
      const { data } = await put(this.state.api.pauseTrack, this.state.api.tokens.accessToken)
    } catch ({ status }) {
      if (status === 401) {
        return this.getNewToken()
      }
    }
  }

  async resumeCurrentPlayback (){
    try{
      const { data } = await put(this.state.api.playTrack, this.state.api.tokens.accessToken)
    } catch ({ status }) {
      if (status === 401) {
        return this.getNewToken()
      }
    }
  }

  async getPlaylistName (){
    try{
      const { data } = await get(this.state.api.currentPlaylist, { headers: this.state.api.headers })
      this.state.api.currentPlaylistName = data.name
    } catch ({ status }) {
      if (status === 401) {
        return this.getNewToken()
      }else if (status === 502 || status === 503){
      }
    }
  }

  async toggleShuffle (bool){
    if (bool == true){
      try{
        const { data } = await put(this.state.api.shuffleOn, this.state.api.tokens.accessToken)
      }catch ({ status }) {
        if (status === 401) {
          return this.getNewToken()
        }
      }
    }else{
      try{
        const { data } = await put(this.state.api.shuffleOff, this.state.api.tokens.accessToken)
      }catch ({ status }) {
        if (status === 401) {
          return this.getNewToken()
        }
      }
    }
  }

  async toggleRepeat(){
    if (this.state.repeatStatus == 'off') {
      this.state.repeatStatus = 'context'
      try {
        const { data } = await put(this.state.api.repeatContext, this.state.api.tokens.accessToken)
      } catch ({ status }) {
        if (status === 401) {
          return this.getNewToken()
        }
      }
    }else if (this.state.repeatStatus == 'context') {
      this.state.repeatStatus = 'track'
      try {
        const { data } = await put(this.state.api.repeatTrack, this.state.api.tokens.accessToken)
      } catch ({ status }) {
        if (status === 401) {
          return this.getNewToken()
        }
      }
    }else if (this.state.repeatStatus == 'track') {
      this.state.repeatStatus = 'off'
      try {
        const { data } = await put(this.state.api.repeatOff, this.state.api.tokens.accessToken)
      } catch ({ status }) {
        if (status === 401) {
          return this.getNewToken()
        }
      }
    }
  }

  /**
   * @method setActiveIntervals - Use current track progress to determine active intervals of each type.
   */
  setActiveIntervals () {
    const determineInterval = (type) => {
      const analysis = this.state.trackAnalysis[type]
      const progress = this.state.trackProgress
      for (let i = 0; i < analysis.length; i++) {
        if (i === (analysis.length - 1)) return i
        if (analysis[i].start < progress && progress < analysis[i + 1].start) return i
      }
    }

    this.state.intervalTypes.forEach(type => {
      const index = determineInterval(type)
      if (!this.state.activeIntervals[type].start || index !== this.state.activeIntervals[type].index) {
        this.state.activeIntervals[type] = { ...this.state.trackAnalysis[type][index], index }
      }

      const { start, duration } = this.state.activeIntervals[type]
      const elapsed = this.state.trackProgress - start
      this.state.activeIntervals[type].elapsed = elapsed
      this.state.activeIntervals[type].progress = ease(elapsed / duration)
    })
  }

  /**
   * @method getVolume - Extract volume data from active segment.
   */
  getVolume () {
    const {
      loudness_max,
      loudness_start,
      loudness_max_time,
      duration,
      elapsed,
      start,
      index
    } = this.state.activeIntervals.segments

    if (!this.state.trackAnalysis.segments[index + 1]) return 0

    const next = this.state.trackAnalysis.segments[index + 1].loudness_start
    const current = start + elapsed

    if (elapsed < loudness_max_time) {
      const progress = Math.min(1, elapsed / loudness_max_time)
      return interpolate(loudness_start, loudness_max)(progress)
    } else {
      const _start = start + loudness_max_time
      const _elapsed = current - _start
      const _duration = duration - loudness_max_time
      const progress = Math.min(1, _elapsed / _duration)
      return interpolate(loudness_max, next)(progress)
    }
  }

  /**
   * @method watch - Convenience method for watching data store.
   * @param {string} key
   * @param {function} method
   */
  watch (key, method) {
    this.state.watch(key, method)
  }

  /**
   * @method on - Convenience method for applying interval hooks.
   * @param {string} - Interval type.
   * @param {function} - Event handler.
   */
  on (interval, method) {
    this.hooks[interval] = method
  }

  /**
   * @getter isActive - Returns if class is actively syncing with a playing track.
   */
  get isActive () {
    return this.state.active === true
  }

  get progress(){
    return this.state.currentTrackProgress
  }

  get trackLength(){
    return this.state.trackFeatures.duration_ms
  }

  get activeState () {
    return this.state.active
  }

  get previousTrack () {
    return this.state.lastSong
  }

  get previousAlbumCover (){
    return this.state.lastSong.album.images[0].url
  }

  get albumCover () {
    return this.state.currentlyPlaying.album.images[0].url
  }

  get songName () {
    return this.state.currentlyPlaying.name
  }

  get artistName () {
    return this.state.currentlyPlaying.artists[0].name
  }

  get tatum () {
    return this.state.activeIntervals.tatums
  }

  get segment () {
    return this.state.activeIntervals.segments
  }

  get beat () {
    return this.state.activeIntervals.beats
  }

  get bar () {
    return this.state.activeIntervals.bars
  }

  get section () {
    return this.state.activeIntervals.sections
  }

  get currentUserSongs (){
    return this.state.userSongs
  }

  get skipSong (){
    this.skipCurrentPlayback()
  }

  get previousSong (){
    this.previousCurrentPlayback()
  }

  get pauseSong (){
    this.pauseCurrentPlayback()
  }

  get playSong (){
    this.resumeCurrentPlayback()
  }

  set shuffle(bool){
    this.toggleShuffle(bool)
  }

  get repeat(){
    this.toggleRepeat()
  }

  get currentRepeatStatus(){
    return this.state.repeatStatus
  }

  get currentShuffleStatus (){
    return this.state.shuffleStatus
  }

  get playlistName (){
    return this.state.api.currentPlaylistName
  }

  /**
   * @method getInterval - Convenience method for retreiving active interval of type.
   * @param {string} type - Interval type, e.g. `beat` or `tatum`
   */
  getInterval (type) {
    return this.state.activeIntervals[type + 's']
  }

  /**
   * @method tick - A single update tick from the Sync loop.
   * @param {DOMHighResTimeStamp} now
   */
  tick (now) {
    requestAnimationFrame(this.tick.bind(this))
    if (!this.state.active) return

    /** Set track progress and active intervals. */
    this.state.trackProgress = (now - this.state.initialStart) + this.state.initialTrackProgress
    this.setActiveIntervals()

    /** Get current volume. */
    const volume = this.getVolume()
    const queues = this.state.queues

    /** Add volume value to the beginning of the volume queue. */
    queues.volume.unshift(volume)

    /** If the queue is larger than 400 values, remove the last value. */
    if (queues.volume.length > 400) {
      queues.volume.pop()
    }

    /** Add volume value to the beginning of the beat queue. */
    queues.beat.unshift(volume)

    /** If the queue is larger than our defined smoothing value, remove the last value. */
    if (queues.beat.length > this.state.volumeSmoothing) {
      queues.beat.pop()
    }

    function average (arr) {
      return arr.reduce((a, b) => (a + b)) / arr.length
    }

    /** Scale volume (dB) to a linear range using the minimum and average values of the volume queue. */
    const sizeScale = scaleLog()
      .domain([min(queues.volume), average(queues.volume)])
      .range([0, 1])
    /** Average the beat queue, then pass it to our size scale. */
    const beat = average(queues.beat)
    this.volume = sizeScale(beat)
  }
}

export async function auth () {
  console.log(`${PROJECT_ROOT}`);
  const { data } = await get(`${PROJECT_ROOT}/auth`)
  window.location.href = `${PROJECT_ROOT}/login?auth_id=${data.auth_id}`
}
