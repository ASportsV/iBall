import "./style.scss";
import React from "react";

import type { PlayerId, Video } from 'common/@types'
import { localFIdxToGlobalFIdx } from "common/@utils";

import { KeyPlayer, KeyPlayerType, Lv2Player } from "@types";
import { params } from "param";

const pad = (num: number) => ("0" + num).slice(-2);
function hhmmss(secs: number) {
  const t = Math.floor(secs * 1000);
  secs = Math.floor(t / 1000);
  let minutes = Math.floor(secs / 60);
  secs = secs % 60;
  minutes = minutes % 60;
  return `${pad(minutes)}:${pad(secs)}`;
}

interface Props {
  videos: Video[];
  currentVideoIdx: number;

  currentFrameIdx: number
  pickedPlayers: Record<number, { lv1Players: Record<PlayerId, KeyPlayer>, lv2Players: Record<PlayerId, Lv2Player> }>

  onClickInterval?: (globalFrameIdx: number) => void;  // pass the frameIdx to the parent
}

interface State {
  isDrawing: { intervalId: number, ox: number, omx: number } | null;  // omx: 全局用于dx ox: 本地坐标系
}

export class Timeline extends React.Component<Props, State> {
  intervalSelectorHeight = 30
  get globalMaxFrames() { return this.props.videos.reduce((o, v) => o + v.maxFrame, 0) }
  get totalTrackWidth() { return this.globalMaxFrames * 1 }
  get globalCurFrameIdx() {
    const { currentFrameIdx, currentVideoIdx, videos } = this.props
    return localFIdxToGlobalFIdx(currentVideoIdx, currentFrameIdx, videos)
  }
  canvas?: HTMLCanvasElement
  ctx?: CanvasRenderingContext2D

  state: State = {
    isDrawing: null,
  }
  parentOffsetx: number = 0
  get maxTime() { return this.globalMaxFrames / params.VIDEO_FRAME_RATE }
  #pointer = React.createRef<HTMLDivElement>()

  componentDidUpdate(preProps: Props) {
    if (preProps.currentFrameIdx !== this.props.currentFrameIdx) {
      if (this.#pointer.current) {
        const bbox = this.#pointer.current.getBoundingClientRect()
        if (bbox.left > (window.innerWidth || document.documentElement.clientWidth) || bbox.right < 0) {
          this.#pointer.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
        }
        // ;(this.#pointer.current as any).scrollIntoViewIfNeeded(true)
      }

      // draw debug line
      //     <svg 
      //     {Object.entries(pickedPlayers)
      //       .map(([fIdx, { lv1Players, lv2Players }]) => {
      //         return <line
      //           className="lv2PlayerNum" 
      //           x1={`${fIdx}`} y1={`${40 - Object.keys(lv1Players).length * 10}`} x2={`${fIdx}`} y2="40" stroke="black" />
      //       })}
      // </svg>

    }
    if (Object.keys(preProps.pickedPlayers).length < Object.keys(this.props.pickedPlayers).length) {
      const { pickedPlayers } = this.props
      const { ctx, globalCurFrameIdx } = this
      const maxFIdx = Math.max(...Object.keys(this.props.pickedPlayers).map(f => +f))
      const { lv1Players, lv2Players } = pickedPlayers[maxFIdx]
      const maxY = 40

      const playersOn = Object.values(lv2Players).filter(p => p.on)
      let y1 = maxY - playersOn.length * 5
      ctx!.lineWidth = 1
      ctx!.strokeStyle = 'red'
      ctx!.beginPath()
      ctx?.moveTo(globalCurFrameIdx, y1)
      ctx?.lineTo(globalCurFrameIdx, maxY)
      ctx!.stroke()

      const lv1NotOnNotEmpty = Object.keys(lv1Players)
        .filter(pId => !playersOn.find(p => p.id === +pId) && lv1Players[+pId as PlayerId].type !== KeyPlayerType.EMPTY_PLAYER)
      ctx!.strokeStyle = '#f5f5f5'
      let y2 = y1 - lv1NotOnNotEmpty.length * 5
      ctx?.beginPath()
      ctx?.moveTo(globalCurFrameIdx, y2)
      ctx?.lineTo(globalCurFrameIdx, y1)
      ctx!.stroke()


      const lv1NotOnEmpty = Object.keys(lv1Players)
        .filter(pId => !playersOn.find(p => p.id === +pId) && lv1Players[+pId as PlayerId].type === KeyPlayerType.EMPTY_PLAYER)
      ctx!.strokeStyle = '#f5f5f5'
      let y3 = y2 - lv1NotOnEmpty.length * 5
      ctx?.beginPath()
      ctx?.moveTo(globalCurFrameIdx, y3)
      ctx?.lineTo(globalCurFrameIdx, y2)
      ctx!.stroke()
    }

    if (preProps.videos.length !== this.props.videos.length) {
      const { ctx } = this
      ctx!.lineWidth = 1
      ctx!.strokeStyle = 'green'
      ctx!.beginPath()
      ctx?.moveTo(0, 40 - 5 * 3)
      ctx?.lineTo(this.totalTrackWidth, 40 - 5 * 3)
      ctx!.stroke()

      ctx!.beginPath()
      ctx?.moveTo(0, 40 - 5 * 4)
      ctx?.lineTo(this.totalTrackWidth, 40 - 5 * 4)
      ctx!.stroke()
    }

  }

  /** Draw interval */
  onDrawStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.button !== 0) return;

    const parentDim = e.currentTarget.parentElement!.getBoundingClientRect()
    this.parentOffsetx = -parentDim.x + e.currentTarget.scrollLeft
    const mx = e.clientX // 鼠标点击位置, 全局坐标系
    const ox = Math.min(this.globalMaxFrames, mx + this.parentOffsetx) // interval初始位置, 本地坐标系

    // click on progressbar
    if (e.clientY >= parentDim.bottom - 8) return
    const globalFrameIdx = this.pos2frame(ox)
    this.props.onClickInterval?.(globalFrameIdx)
  }

  pos2frame = (pos: number) => {
    const { totalTrackWidth: trackWidth, globalMaxFrames: maxFrame } = this
    return Math.round(pos / (trackWidth) * maxFrame)
  }

  frame2pos = (frame: number) => {
    const { totalTrackWidth: trackWidth, globalMaxFrames: maxFrame } = this
    return (frame / maxFrame) * (trackWidth)
  }

  render() {
    const { videos } = this.props;
    const { maxTime, globalMaxFrames: maxFrame, intervalSelectorHeight, globalCurFrameIdx } = this
    const currentTime = globalCurFrameIdx / params.VIDEO_FRAME_RATE

    return (
      <div className="timeline-container">
        <div className="timeline"
          onMouseDown={this.onDrawStart}>
          <div className="time-info">
            <span>
              {" "}
              {hhmmss(currentTime)} ({globalCurFrameIdx}) / {hhmmss(maxTime)} ({maxFrame})
            </span>
          </div>

          <div ref={this.#pointer} className="pointer"
            style={{
              left: `calc(12px + ${this.frame2pos(globalCurFrameIdx)}px)`,
            }}
          ></div>

          <div id="timeline-progress" className="track-container">
            {videos.map(v => <div
              key={v.id}
              className="track"
              style={{
                width: `${v.maxFrame}px`,
                height: intervalSelectorHeight,
                backgroundColor: v.isTransit ? '#515151' : 'rgb(116 99 57)',
                opacity: v.loaded ? 1 : 0.5
              }}><span className="video-name">{v.id}</span></div>
            )}
          </div>
          <canvas
            ref={ref => {
              if (!ref || this.canvas) return
              this.canvas = ref
              this.ctx = ref.getContext('2d')!
            }}
            className="debug-timeline"
            width={`${this.totalTrackWidth}px`}
            height={`${40}px`}>
          </canvas>

        </div>
      </div>
    );
  }
}
