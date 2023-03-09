import { Video, VideoID } from "@types"
import { params } from "param"
import { debugMem } from "utils"

const Loading: Partial<Record<VideoID, boolean>> = {}

export class VideoEngine {
  onLoadToMem?: (videoId: VideoID) => void
  onUnloadToMem?: (videoId: VideoID) => void


  private onFrameHandlers: Array<(vId: string, fIdx: number, ts: number, videoFrame: HTMLVideoElement) => void> = []
  get paused() {
    return this.#video?.paused
  }

  #video?: HTMLVideoElement
  #AVideo?: HTMLVideoElement
  #BVideo?: HTMLVideoElement

  addOnFrameListener(fn: (vId: string, frameIdx: number, ts: number, videoFrame: HTMLVideoElement) => void) {
    this.onFrameHandlers.push(fn)
  }

  // startTime = 0.0
  frameOffset = 1
  memVideos: Partial<Record<VideoID, HTMLVideoElement>> = {}
  
  ACallBackHandle: number | null = null
  AVideoUpdateCanvas: VideoFrameRequestCallback = (now, metadata) => {
    const rawFrame = Math.round(metadata.mediaTime * params.VIDEO_FRAME_RATE) 
    const frame = rawFrame - this.frameOffset

    if(this.#AVideo === this.#video) {
      for (let i = 0, len = this.onFrameHandlers.length; i < len; ++i) {
        this.onFrameHandlers[i].call(this, this.#video!.id, frame, Date.now(), this.#video!)
      }
    }
    if(this.#AVideo) {
      this.ACallBackHandle = this.#AVideo?.requestVideoFrameCallback(this.AVideoUpdateCanvas) 
    }
  }

  BCallBackHandle: number | null = null
  BVideoUpdateCanvas: VideoFrameRequestCallback = (now, metadata) => {
    const rawFrame = Math.round(metadata.mediaTime * params.VIDEO_FRAME_RATE) 
    const frame = rawFrame - this.frameOffset

    if(this.#BVideo === this.#video) {
      for (let i = 0, len = this.onFrameHandlers.length; i < len; ++i) {
        this.onFrameHandlers[i].call(this, this.#video!.id, frame, Date.now(), this.#video!)
      }
    }
    if(this.#BVideo) {
      this.BCallBackHandle = this.#BVideo?.requestVideoFrameCallback(this.BVideoUpdateCanvas)  
    }
  }

  isMemLoaded(video: Video) {
    return video.id in this.memVideos
  }

  async preloadToSkip(video: Video, play: boolean, currentVideo?: Video) {
      console.log('%cpreloadToSkip', 'background: #444; color: #bada55; padding: 2px; border-radius:2px', video)
      await this.preLoadToMem(video)
      // load to the ohter track
      if(this.#BVideo?.id === currentVideo?.id) {
        console.debug('Load to track_A')
        this.#AVideo = this.memVideos[video.id]!
        this.#AVideo.requestVideoFrameCallback(this.AVideoUpdateCanvas)
        play && this.#AVideo.play()
      } else {
        console.debug('Load to track_B')
        this.#BVideo = this.memVideos[video.id]!
        this.#BVideo.requestVideoFrameCallback(this.BVideoUpdateCanvas)
        play && this.#BVideo.play()
      }
  }

  whichOnPause = (ev: Event) => {
    const v = ev.target as HTMLVideoElement
    if(v.id === this.#video?.id) {
      this.onPause?.(v.id as VideoID)
    }
  }

  whichOnPlay = (ev: Event) => {
    const v = ev.target as HTMLVideoElement
    if(v.id === this.#video?.id) {
      this.onPlay?.(v.id as VideoID)
    }
  }

  async loadVideo(video: Video, play = false) {
    // not load
    if (this.#video?.id !== video.id) {
      // reset the last one
      this.#video?.load()
      // maybe should pause?
      this.#video?.removeEventListener('pause', this.whichOnPause)
      this.#video?.removeEventListener('play', this.whichOnPlay)

      // ensure load
      if(this.#AVideo?.id !== video.id && this.#BVideo?.id !== video.id) {
        await this.preloadToSkip(video, play)
      }

      // console.log('after preload', performance.now() - t1)
      if(this.#AVideo?.id === video.id) {
        console.debug('Switch to track_A')
        this.#video = this.#AVideo
        this.BCallBackHandle !== null && this.#BVideo?.cancelVideoFrameCallback(this.BCallBackHandle)
      } else { //if(this.#BVideo?.id === video.id) {
        console.debug('Switch to track_B')
        this.#video = this.#BVideo
        this.ACallBackHandle !== null && this.#AVideo?.cancelVideoFrameCallback(this.ACallBackHandle)
      } 
      
      this.#video?.addEventListener('pause', this.whichOnPause)
      this.#video?.addEventListener('play', this.whichOnPlay)
    }
  }

  async preLoadToMem(video: Video) {

    if (Loading[video.id]) {
      // wait until anothe thread finish
      await new Promise(resolve => {
        setInterval(() => {
          if (!Loading[video.id])
            resolve(null)
        }, 70)
      })
      return
    }
    Loading[video.id] = true

    if (!(video.id in this.memVideos)) {
      console.debug('VideoEngine.preLoadToMem', video)
      const nextVideo = document.createElement('video')
      nextVideo.src = `http://localhost:5000/assets/${video.gameId}/${video.id}/${video.id}.mp4`
      nextVideo.id = video.id
      nextVideo.load()
      await new Promise(resolve => {
        // nextVideo.onloadedmetadata = () => console.log('onloadedmetadata', video.id)
        nextVideo.onloadeddata = resolve
      })
      console.debug('VideoEngine.preLoadToMem ==> Done', video)

      // load to mem
      this.memVideos[video.id] = nextVideo
      this.onLoadToMem?.(video.id)
      debugMem()
    }

    Loading[video.id] = false
  }

  onPlay?: (videoId: VideoID) => void
  onPause?: (videoId: VideoID) => void

  play() {
    if (!this.#video || !this.#video.paused) return
    this.#video.play()
  }

  pause() {
    if (this.#video?.paused) return
    this.#video?.pause()
    this.onPause?.(this.#video?.id as VideoID)
  }

  async seekTo(video: Video, frameIdx: number) {
    // this.currentFrameIdx = frameIdx
    await this.loadVideo(video)
    this.#video!.currentTime = (frameIdx / params.VIDEO_FRAME_RATE) + 0.001
    console.log('set currentTime to frameIdx', frameIdx)
  }

  clean() {
    this.#video?.pause()
    if (this.#video)
      this.#video.currentTime = 0
    this.onFrameHandlers = []
  }
}