import "./App.scss";

import React from "react";
import LoadingBar from 'react-top-loading-bar'
import { IoPlaySharp, IoPauseSharp } from 'react-icons/io5'
import { AiOutlineLoading } from 'react-icons/ai'

import type { Player, Video } from 'common/@types'
import { Attentions, GameID, Gaze, KeyPlayer, Lv2Player, PlayerID, VideoID } from '@types'

import { DEBUG } from 'common/@const'
import { standardDeviation, globalFIdxToLocal, localFIdxToGlobalFIdx } from "common/@utils";

import {
  BarChart, LineChart,
  // Court, 
  // Timeline, 
  Visualizer,
  // Overlay 
} from './components'
import { Timeline } from 'common/@components'

import { params } from "param";
import { IBallVideoEnv } from "VideoEnv";

export const videoEnv = new IBallVideoEnv()

interface State {
  videoWidth: number
  videoHeight: number

  videos: Video<GameID, VideoID>[]
  pauseLoading: VideoID | undefined
  currentVideoIdx: number
  currentFrameIdx: number
  currentGaze: Gaze | undefined
  currentFrame?: HTMLVideoElement
  // player status
  gazePlayers?: Player<PlayerID>[]
  attentions?: Attentions
  attentionsOverTime?: Attentions[]
  pickedPlayers: Record<number, { lv1Players: Record<PlayerID, KeyPlayer>, lv2Players: Record<PlayerID, Lv2Player> }>

  playing: boolean
}

export class App extends React.Component<{}, State> {

  state: State = {
    // video meta
    videoWidth: 1280,
    videoHeight: 720,
    // playing
    pauseLoading: undefined,
    videos: [],
    currentVideoIdx: 0,
    currentFrameIdx: 0,
    currentFrame: undefined,
    currentGaze: undefined,
    gazePlayers: undefined,
    attentions: undefined,
    attentionsOverTime: undefined,
    pickedPlayers: {},
    //
    playing: false,
  }


  #visualizer: React.RefObject<Visualizer> = React.createRef()

  get currentVideo() { return this.state.videos[this.state.currentVideoIdx] }

  async componentDidMount() {
    // should load parameters here

    // get the data from the server and construct a data tower for this video
    const videos = await Promise.all(params.VIDEO_IDS.map(async (videoId: string) => {

      try {
        const { max_frame: maxFrame, start_frame = 0 } = await fetch(`assets/${params.GAME_ID}/${videoId}/frames/max_frame.json`).then(r => r.json())
        const isTransit = videoId.endsWith('t')

        return {
          id: videoId as VideoID,
          gameId: params.GAME_ID, 
          maxFrame, 
          isTransit,
          frameRate: params.GAME_ID === 'game1' ? 29.97 : 29.81,
          loaded: false,
          width: 1280,
          height: 720,
          version: 1,
          startFame: start_frame
        }
      } catch (e) {
        console.log('Something wrong with maxjson', videoId)
        throw e
      }
    }))
    this.setState({ videos })

    // set up videoEnv
    videoEnv.videos = videos

    // dataTower.onGaze = (currentGaze, gazePlayers) => this.setState({ currentGaze, gazePlayers })
    // dataTower.onUpdateLvInt = attentions => this.setState({ attentions })
    videoEnv.onLoad = (videoId: VideoID) => {
      const { videos } = this.state
      const videoIdx = videos.findIndex(v => v.id === videoId)
      if (videoIdx !== -1) {
        videos[videoIdx] = {
          ...videos[videoIdx],
          loaded: videoEnv.isLoaded(videos[videoIdx])
        }
        this.setState({ videos: [...videos] })
      }
    }
    videoEnv.onUnload = (videoId: VideoID, type: 'Data' | 'Video') => {
      const { videos } = this.state
      const videoIdx = videos.findIndex(v => v.id === videoId)
      if (videoIdx !== -1) {
        videos[videoIdx] = {
          ...videos[videoIdx],
          loaded: videoEnv.isLoaded(videos[videoIdx])
        }
        this.setState({ videos: [...videos] })
      }
    }

    videoEnv.onPause = (videoId) => this.setState({ playing: false })
    videoEnv.onPlay = (videoId) => this.setState({ playing: true, pauseLoading: undefined })

    // setup videoEngine
    // invoke the handler for each frame
    // this.videoEngine.addOnFrameListener(this.pushFrameHistory)
    videoEnv.addOnFrameListener(async (videoId, frameIdx, ts, videoFrame) => {
      const { videos } = this.state
      const newCurVideoIdx = videos.findIndex(v => v.id === videoId)
      this.setState({
        currentFrameIdx: frameIdx,
        currentVideoIdx: newCurVideoIdx,
        currentFrame: videoFrame
      })
    })

    // load the frames
    const { currentVideoIdx } = this.state
    // await videoEnv.loadBins()
    await videoEnv.fetchVideos()
    // preload videos
    await videoEnv.loadVideo(videos[currentVideoIdx])
  }

  componentWillUnmount() {
    // dataTower.onGaze = undefined
    // dataTower.onUpdateLvInt = undefined
    // dataTower.onUpdateLvSync = undefined
    // dataTower.onLoadToMem = undefined
    // dataTower.onUnloadToMem = undefined
    // videoEngine.clean()
    // videoEngine.onLoadToMem = undefined
    // videoEngine.onPause = undefined
    // videoEngine.onPlay = undefined
  }

  // pushFrameHistory = (videoId: string, localFrameIdx: number, ts: number) => {
  //   const { videos } = this.state
  //   const videoIdx = videos.findIndex(v => v.id === videoId)

  //   if (videoIdx === -1) {
  //     this.videoEngine.pause()
  //     return
  //   }

  //   const video = videos[videoIdx]
  //   dataTower.pushFrameHistory({ videoId: video.id, fIdx: localFrameIdx, ts })
  // }

  onClickInterval = async (clipId: number, globalFrameIdx: number) => {
    // 直接给videoFrame设帧
    const { videos } = this.state
    const { videoIdx, frameIdx } = globalFIdxToLocal(globalFrameIdx, videos)
    videoEnv!.pause();
    await videoEnv!.seekTo(videos[videoIdx], frameIdx)
  }

  onPlayVideo = async () => {
    const { playing } = this.state
    if (playing) {
      videoEnv!.pause()
    } else {
      videoEnv!.play()
    }
  }

  render() {
    const {
      currentVideoIdx,
      currentFrameIdx,

      currentGaze,
      currentFrame,
      gazePlayers,

      pauseLoading,
      attentions,
      attentionsOverTime,
      pickedPlayers,
      // sync,
      playing,
      videos,
      videoWidth, videoHeight,
    } = this.state;

    return (
      <>
        <LoadingBar
          color='#f11946'
          height={3}
          progress={100 * videos.filter(v => v.loaded).length / videos.length}
        />

        <div className="up">
          <div className="full">
            <Visualizer ref={this.#visualizer}
              width={videoWidth ?? 0}
              height={videoHeight ?? 0}
              // video
              currentVideo={this.currentVideo}
              currentFrameIdx={currentFrameIdx}
              currentFrame={currentFrame}
              // gaze
              gaze={currentGaze}
              gazePlayers={gazePlayers}
              onPickPlayers={(fIdx, lv1Players, lv2Players) => {
                const vIdx = videos.findIndex(v => v.id === this.currentVideo.id)
                if (vIdx === -1) return

                const globalFIdx = localFIdxToGlobalFIdx(vIdx, fIdx, videos)
                this.setState({
                  pickedPlayers: { ...pickedPlayers, [globalFIdx]: { lv1Players, lv2Players } }
                })
              }}
            >
              {/* {DEBUG.OVERLAY &&
                <Overlay
                  width={videoWidth}
                  height={videoHeight}
                  frameIdx={currentFrameIdx}
                  gazePlayers={gazePlayers}
                  gaze={DEBUG.GAZE ? currentGaze : undefined}
                  bbox={DEBUG.BBOX}
                  isTransit={this.currentVideo?.isTransit}
                />
              } */}
            </Visualizer>
            {DEBUG && <div className="debug">
              {/* {DEBUG.COURT && <Court
                currentFrameIdx={currentFrameIdx}
              />} */}
              {DEBUG.ATTENTIONS &&
                <div className="chart">
                  <BarChart
                    fixY={true}
                    data={attentions?.players
                      ? Object.entries(attentions?.players).map(([playerId, { att, on }]) => {
                        return { id: playerId, value: att, fill: on ? "teal" : "lightpink" }
                      }, {} as Record<string, { value: number, fill: string }>) : []}
                  />
                </div>
              }
              {DEBUG.LINE &&
                <div className="chart">
                  <LineChart
                    width={600}
                    data={attentionsOverTime
                      ?.filter(({ videoId }) => videoId !== undefined)
                      .map(({ fIdx, players: playerAttentions, videoId }) => {

                        const { players } = videoEnv!.frames?.[currentFrameIdx] ?? {}
                        const std = standardDeviation(players?.map(p => playerAttentions[p.id]?.att ?? 0))
                        const videoIdx = videos.findIndex(v => v.id === videoId)!
                        const globalFIdx = localFIdxToGlobalFIdx(videoIdx, fIdx, videos)
                        return { fIdx: globalFIdx, videoIdx, value: std }
                      }) ?? []}
                  />
                </div>
              }
            </div>
            }
            <div className="controls">
              <button
                id="playpause"
                className="play button is-outlined"
                type="button"
                disabled={pauseLoading !== undefined || videos.filter(v => v.loaded).length !== videos.length}
                onClick={() => this.onPlayVideo()}
              >
                {playing
                  ? <IoPauseSharp style={{ transform: 'scale(1.5)' }} />
                  : pauseLoading !== undefined
                    ? <AiOutlineLoading style={{ transform: 'scale(1.5)' }} />
                    : <IoPlaySharp style={{ transform: 'scale(1.5)' }} />}
              </button>
            </div>
          </div>
          <div className="divide"> </div>
        </div>

        {DEBUG.TIMELINE &&
          <Timeline
            mode="S"
            videos={videos}
            currentVideoIdx={currentVideoIdx}
            currentFrameIdx={currentFrameIdx}
            enableClips={false}
            // pickedPlayers={pickedPlayers}
            onClickInterval={this.onClickInterval}
          />
        }
      </>)
  }
}