import "./App.scss";
import 'react-circular-progressbar/dist/styles.css';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import React from "react";
import { IoPlaySharp, IoPauseSharp } from 'react-icons/io5'
import { AiOutlineLoading } from 'react-icons/ai'

import type {
  Attentions, Gaze, KeyPlayer, Lv2Player,
  PlayerID, Player,
  VideoID, Video
} from '@types'

import { DEBUG } from 'common/@const'
import { standardDeviation, globalFIdxToLocal, localFIdxToGlobalFIdx } from "common/@utils";

import {
  BarChart,
  LineChart,
  Visualizer,
  Overlay
} from './components'
import { Timeline } from 'common/@components'

import { params } from "param";
import { IBallVideoEnv } from "VideoEnv";

export const videoEnv = new IBallVideoEnv()

interface State {
  videos: Video[]
  pauseLoading: VideoID | undefined
  currentVideoIdx: number
  currentFrameIdx: number
  currentGaze: Gaze | undefined
  currentFrame?: HTMLVideoElement
  // player status
  gazePlayers?: Player[]
  attentions?: Attentions
  attentionsOverTime?: Attentions[]
  pickedPlayers: Record<number, { lv1Players: Record<PlayerID, KeyPlayer>, lv2Players: Record<PlayerID, Lv2Player> }>

  playing: boolean
}

export class App extends React.Component<{}, State> {

  state: State = {
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
        const { max_frame: maxFrame, start_frame = 0, fps, h, w, version } = (await fetch(`${process.env.PUBLIC_URL}/assets/${params.GAME_ID}/${videoId}/${videoId}-meta.json`).then(r => r.json()))
        const isTransit = videoId.endsWith(',t')

        return {
          gameId: params.GAME_ID,
          id: videoId as VideoID,
          maxFrame,
          startFame: start_frame,
          isTransit,
          frameRate: fps, //params.GAME_ID === 'game1' ? 29.97 : 29.81,
          loadedData: 0,
          loadedVideo: 0,
          width: w,
          height: h,
          version,
        }
      } catch (e) {
        console.log('Something wrong with maxjson', videoId)
        throw e
      }
    }))
    this.setState({ videos })

    // set up videoEnv
    videoEnv.videos = videos

    videoEnv.onGaze = (currentGaze, gazePlayers) => this.setState({ currentGaze, gazePlayers })
    videoEnv.onUpdateLvInt = attentions => this.setState({ attentions })
    videoEnv.onLoad = (videoId: VideoID, type: 'Data' | 'Video', progress) => {
      const { videos } = this.state
      const videoIdx = videos.findIndex(v => v.id === videoId)
      if (videoIdx !== -1) {
        videos[videoIdx] = {
          ...videos[videoIdx],
          [`loaded${type}`]: progress === undefined ? 1 : progress
          // loaded: videoEnv.isLoaded(videos[videoIdx])
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
          [`loaded${type}`]: 0
          // loaded: videoEnv.isLoaded(videos[videoIdx])
        }
        this.setState({ videos: [...videos] })
      }
    }

    videoEnv.onPause = (videoId) => this.setState({ playing: false })
    videoEnv.onPlay = (videoId) => this.setState({ playing: true, pauseLoading: undefined })

    // setup videoEngine
    // invoke the handler for each frame
    videoEnv.addOnFrameListener(this.pushFrameHistory)
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

  pushFrameHistory = (videoId: string, localFrameIdx: number, ts: number) => {
    const { videos } = this.state
    const videoIdx = videos.findIndex(v => v.id === videoId)

    if (videoIdx === -1) {
      videoEnv.pause()
      return
    }

    const video = videos[videoIdx]
    videoEnv.pushFrameHistory({ videoId: video.id, fIdx: localFrameIdx, ts })
  }

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

  loadedPrecentage() {
    const { videos } = this.state
    // assuming loading data takes 2x times than loading videos
    const value = videos.reduce((o, d) => o += d.loadedData * 2 + d.loadedVideo, 0) / videos.reduce((o, v) => o + (v.isTransit ? 1 : 3), 0)
    return value
  }

  renderProgressbar() {
    const value = this.loadedPrecentage() * 100
    return value === 100 ? null : <div style={{
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)'
    }}>
      <CircularProgressbar
        value={value}
        text={`${value | 0}%`}
        styles={buildStyles({
          pathColor: `rgb(62, 152, 199)`,
          textColor: '#f88',
          trailColor: '#d6d6d6',
          backgroundColor: '#3e98c7',
        })}
      />
    </div>
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
    } = this.state;
    const currentFrameData = videoEnv.frames?.[currentFrameIdx]

    return (
      <>
        {this.renderProgressbar()}

        <div className="up">
          <div className="full">
            <Visualizer ref={this.#visualizer}
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

              <Overlay
                currentVideo={this.currentVideo}
                currentFrameData={currentFrameData}
                gaze={DEBUG.GAZE ? currentGaze : undefined}
                gazePlayers={gazePlayers}
                bbox={false}
              />

              {/* {DEBUG.OVERLAY &&
                <Overlay
                  width={videoWidth}
                  height={videoHeight}
                  frameIdx={currentFrameIdx}
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
                disabled={pauseLoading !== undefined || this.loadedPrecentage() !== 1}
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