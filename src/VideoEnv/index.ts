import { scaleSequential, scaleSqrt, scaleOrdinal } from 'd3-scale'
import { interpolateReds, interpolateYlGnBu, schemeSet3 } from 'd3-scale-chromatic'

import type { Ball, Point } from 'common/@types'
import {
  PlayerID, TeamID,
  Attentions, AttentionWeights,
  FrameStamp, Gaze, Highlights,
  KeyPlayer,
  KeyPlayerType,
  Lv2Player,
  Lv2PlayerType,
  OffensivePkg,
  VideoID,
  GameID, Player
} from "@types"

import { distPoints, union } from 'common/@utils';
import { getCanvasAbsTopLeft, GOAL_BASKET_POS, hRadius } from '@utils';

import { DEBUG } from 'common/@const'
import {
  PLAYER_META,
  EMPTY_SPACE_THRESHOLD, GAZE_R, LV_INTEREST_THRESHOLD, MAX_HIGHLIGHTED, NEXT_BALL_HOLDER_TIME_RANGE,
} from '@const';
import { params } from 'param';

import { VideoEnv } from 'common/VideoEnv';
import { DataLoader } from 'common/DataLoader';
import IBallWorker from './loadData.worker'

export class IBallVideoEnv extends VideoEnv<GameID, VideoID, PlayerID> {

  // shotRecords: ShotRecord[] = []

  // gaze events
  onGaze?: (p: Gaze, player?: Player[]) => void
  onUpdateLvInt?: (att: Attentions) => void
  onUpdateLvSync?: (sync: boolean, hilights: Highlights) => void

  #gazeQueue: Gaze[] = []
  #frameQueue: FrameStamp[] = []
  #mousePos: Point = { x: 0, y: 0 }
  constructor(dataLoader = new DataLoader<GameID, VideoID, PlayerID>(IBallWorker)) {
    super(dataLoader)

    console.log('Gaze init----')
    const socket = new WebSocket('ws://localhost:5000/echo');

    let ox: number | undefined = undefined
    let oy: number | undefined = undefined
    if (DEBUG.MOUSE_GAZE) {
      document.body.addEventListener('mousemove', e => {
        if (ox === undefined && oy === undefined) {
          const bbox = document.getElementById('canvasWrapper')?.getBoundingClientRect()
          if (bbox === undefined) return
          ox = bbox.x
          oy = bbox.y
        }
        //console.log('mousepos', e.clientX, e.clientY)
        const { wScale = 1, hScale = 1 } = getCanvasAbsTopLeft()
        this.#mousePos = { x: (e.clientX - ox!) * wScale, y: (e.clientY - oy!) * hScale }
      })
    }

    socket.addEventListener('message', this.onSocket);
  }

  /**
   * -------------- Gaze data ----------------
   */
  onSocket = (ev: any) => {
    const rawGaze = JSON.parse(ev.data) as [[number, number], number]
    const ts = Math.round(rawGaze[1] * 1000)
    // get the closetFrame
    const closetFrame = this.getClosetFrame(ts)
    // console.warn('Cannot find closetframe of gaze', rawGaze)
    if (!closetFrame) {
      // maybe should find frame in lazy mode?
      return
    }

    const { x: ox, y: oy, wScale = 1, hScale = 1 } = getCanvasAbsTopLeft()
    const wOutToIn = window.innerWidth / window.outerWidth
    const hOutToIn = window.innerHeight / window.outerHeight
    const x = DEBUG.MOUSE_GAZE
      ? this.#mousePos.x
      : (rawGaze[0][0] * wOutToIn - ox) * wScale
    const y = DEBUG.MOUSE_GAZE
      ? this.#mousePos.y
      : ((rawGaze[0][1] + 20) * hOutToIn - oy) * hScale

    const gaze: Gaze = {
      x, y,
      ts,
      fIdx: closetFrame?.fIdx,
      videoId: closetFrame?.videoId
    }
    this.#gazeQueue.push(gaze)

    // get lookat
    const attendPlayers = this.getLookAt(gaze)
    this.onGaze?.(gaze, attendPlayers)

    // calculate inteLv
    // save inteLv
    this.updateInteLv(gaze, attendPlayers)
  }

  pushFrameHistory(data: FrameStamp) {
    this.#frameQueue.push(data)
  }
  getClosetFrame(gTs: number) {
    let minDist = Infinity
    let minFrame = undefined
    for (const frame of [...this.#frameQueue].reverse()) {
      const dist = Math.abs(frame.ts - gTs)
      if (dist < minDist) {
        minDist = dist
        minFrame = frame
      }
      // if not decrease anymore, stop
      else break
    }
    return minFrame
  }

  get latestGaze() { return this.#gazeQueue[this.#gazeQueue.length - 1] }
  getClosetGaze(fTs: number) {
    let minDist = Infinity
    let minGaze = undefined
    for (const gaze of [...this.#gazeQueue].reverse()) {
      const dist = Math.abs(gaze.ts - fTs)
      if (dist < minDist) {
        minDist = dist
        minGaze = gaze
      }
      // if not decrease anymore, stop
      else break
    }
    return minGaze
  }

  getLookAt(gaze: Gaze) {
    const { x: gx, y: gy, videoId } = gaze
    // frame data
    // @TODO, can be error since the frame maybe not loaded in cur memory
    if (videoId !== this.currentVideo?.id) return
    const cf = this.frames?.[gaze.fIdx]
    if (!cf?.players) return

    const radius = GAZE_R
    const attendedPlayers = cf.players.filter(({ bbox }) => {
      return gx > (bbox.x - radius) &&
        gy > (bbox.y - radius) &&
        gx < (bbox.x + bbox.w + radius) &&
        gy < (bbox.y + bbox.h + radius)
    })
    return attendedPlayers
  }

  #playerAttentions: Attentions = { lastTs: -1, fIdx: -1, videoId: undefined, players: {} }
  updateInteLv(gaze: Gaze, attendPlayers?: Player[]) {
    const { ts, fIdx } = gaze
    const { lastTs, players } = this.#playerAttentions
    const T = 1000 // ms
    const decayRate = 1 / 5
    // const maxAttention = incrRate * 19.144 * 0.96

    /**
     * Generalized weight increase algorithm.
     * @param initialValue The starting weight of the player.
     * @param dt The amount of time elapsed since the last update.
     * @returns The new weight of the player.
     */
    function increaseFunction(initialValue: number, dt: number) {
      return 1 - decayRate ** ((dt - (T * Math.log(1 - initialValue) / Math.log(5))) / T)
    }

    const newAttentions = lastTs === -1 ? players : Object.keys(players)
      .reduce((o, pId) => {
        const playerId = +pId as PlayerID
        const base = players[playerId]?.att ?? 0
        const att = base * Math.pow(decayRate, (ts - lastTs) / T)
        const on = players[playerId]?.on ?? false
        o[playerId] = {
          on: att < LV_INTEREST_THRESHOLD.off ? false : on, // turn to false if less than threshold
          att, looked: false
        }
        return o
      }, {} as Record<PlayerID, AttentionWeights>)

    if (attendPlayers) {
      attendPlayers.forEach(({ id }) => {
        if (!(id in newAttentions)) newAttentions[id] = { on: false, att: 0, looked: true }
        const oldAttention = players[id]?.att ?? 0
        const att = increaseFunction(oldAttention, ts - lastTs)
        const on = att > LV_INTEREST_THRESHOLD.on
          ? true
          : newAttentions[id]!.on
        newAttentions[id] = {
          att, on, looked: true
        }
      })
    }

    this.#playerAttentions = {
      lastTs: ts,
      fIdx,
      videoId: gaze.videoId,
      players: newAttentions
    }
    this.onUpdateLvInt?.(this.#playerAttentions)
  }

  /**
   * ----------------- Visualization Management
   */
  #keyPlayers: Array<{
    fIdx: number,
    videoId: string,
    players: KeyPlayer[],
  }> = []
  #keyPlayer_buffer_size = 100

  /**
   * 
   * @param currentFIdx 
   * @param timeRange in sec
   * @param ball 
   * @returns 
   */
  getNextBallHolder(currentFIdx: number, timeRange: number, ball?: Ball, teamWithBall?: TeamID) {
    timeRange *=  this.currentVideo?.frameRate! //params.VIDEO_FRAME_RATE
    for (let i = currentFIdx; i < currentFIdx + timeRange; ++i) {
      const nextFrame = this.frames?.[i]
      if (!nextFrame) continue

      const { ball: nextBall } = nextFrame
      if (!nextBall?.playerId) continue

      if (!ball?.playerId) {// now is empty
        return PLAYER_META[nextBall.playerId].team === teamWithBall ? nextBall.playerId : undefined
      } else { // now is not empty
        if (nextBall.playerId !== ball.playerId && PLAYER_META[nextBall.playerId].team === PLAYER_META[ball.playerId].team) { // should be the same team
          return nextBall.playerId
        }
      }
    }
  }

  getEmptyPlayer(players?: Player[], ballHolderId?: PlayerID | null, teamWithBall?: TeamID) {
    if (players === undefined || teamWithBall === undefined) return
    const trackedPlayers = players.filter(({ tracking }) => tracking.x !== undefined && tracking.y !== undefined)
    const defenders = trackedPlayers.filter(p => PLAYER_META[p.id].team !== teamWithBall)
    const offensors = trackedPlayers.filter(p => PLAYER_META[p.id].team === teamWithBall)

    const emptyOffensors: Array<[Player, number]> = []
    for (const p of offensors) {
      const { dataPkg, id } = p
      if (id === ballHolderId) continue
      if (!(dataPkg as OffensivePkg).inOffsensiveCourt) continue

      const dists = defenders.map(d => distPoints(d.tracking, p.tracking))
      if (dists.every(d => d > EMPTY_SPACE_THRESHOLD)) {
        // TODO, dist to the basket
        // dist to the ballholder
        const { x: bx, y: by } = GOAL_BASKET_POS(p.id)
        const distToBasket = distPoints(p.tracking, { x: bx, y: by })
        emptyOffensors.push([p, distToBasket])
      }
    }
    return emptyOffensors.sort((a, b) => a[1] - b[1]).map(d => d[0])
  }

  private lastFocus: { pos: Point } = { pos: { x: 0, y: 0 } }
  fetchFocus() {
    const gaze = this.latestGaze
    if (!gaze) return this.lastFocus

    let { pos } = this.lastFocus
    const dx = Math.min(600, gaze.x - pos.x)
    const dy = Math.min(600, gaze.y - pos.y)
    pos = {
      x: pos.x + dx,
      y: pos.y + dy
    }

    this.lastFocus = { pos }
    return this.lastFocus
  }

  // helper function  
  #getPlayerTeam = (playerId?: PlayerID) => playerId ? PLAYER_META[playerId].team : undefined
  pickPlayers(currentFIdx: number, focus?: { pos: Point; }) {
    if (Object.keys(this.#keyPlayers).length > this.#keyPlayer_buffer_size) {
      this.#keyPlayers.pop()
    }

    const currentFrame = this.frames?.[currentFIdx]
    if (!currentFrame) return {}
    const {
      ball,
      players,
      teamWithBall = this.#getPlayerTeam(players?.find(p => p.id === ball?.playerId)?.id)
    } = currentFrame

    // attend players
    const { players: playerAttentions } = this.#playerAttentions

    // collect current
    let currentlv1Players: Omit<KeyPlayer, 'last'>[] = []
    let lv2Players: Lv2Player[] = []
    // ball holder first
    if (ball?.playerId) {
      currentlv1Players.push({ id: ball.playerId, type: KeyPlayerType.BALL_HOLDER })
      // should add to lv2 if sync
      lv2Players.push({ id: ball.playerId, type: new Set([Lv2PlayerType.Normal]) })

      // add the defender of the ball holder
      // @Note, the defending field stores the defender of the ball holder, and the defending of defenders
      const ballHolder = players?.find(p => p.id === ball.playerId)
      ballHolder?.tracking.defending && lv2Players.push({
        id: ballHolder?.tracking.defending as PlayerID,
        type: new Set([Lv2PlayerType.Normal])
      })
      players?.filter(p => p.tracking.defending === ball.playerId).forEach(p => lv2Players.push({
        id: p.id,
        type: new Set([Lv2PlayerType.Normal])
      }))
    }

    // who will get the ball in the next Xsec
    const nextBallHolder = this.getNextBallHolder(currentFIdx, NEXT_BALL_HOLDER_TIME_RANGE, ball)
    if (nextBallHolder && currentlv1Players.length < MAX_HIGHLIGHTED) {
      currentlv1Players.push({ id: nextBallHolder, type: KeyPlayerType.NEXT_BALL_HOLDER })
      lv2Players.push({ id: nextBallHolder, type: new Set([Lv2PlayerType.Normal]) })
    }

    const emptyPlayers = this.getEmptyPlayer(players?.filter(p => !currentlv1Players.some(d => d.id === p.id)), ball?.playerId, teamWithBall)
    emptyPlayers
      ?.filter(({ bbox }) => {
        if (!focus) return true
        const radius = 60
        const { x: gx, y: gy } = focus.pos
        return gx > (bbox.x - radius) &&
          gy > (bbox.y - radius) &&
          gx < (bbox.x + bbox.w + radius) &&
          gy < (bbox.y + bbox.h + radius)
      })
      .forEach(p => {
        if ((currentlv1Players.length + 1) < MAX_HIGHLIGHTED) {
          currentlv1Players.push({ id: p.id, type: KeyPlayerType.EMPTY_PLAYER })
          lv2Players.push({ id: p.id, type: new Set([Lv2PlayerType.Normal]) })
        }
      })

    // management
    let { players: lastLv1Players = [], fIdx: lastFIdx = 0, videoId: lastVideoId } = this.#keyPlayers?.[0] ?? {}
    lastLv1Players = lastLv1Players
      .filter(p => lastVideoId === this.currentVideo?.id) // && PLAYER_META[p.id].team === teamWithBall)
    // exit
    const exitPlayers = lastLv1Players
      .filter(p =>  //p.last.status === 'exit' || 
        !currentlv1Players.find(cp => p.id === cp.id))
      // update exist player's values
      .map(p => {
        p.last.status = 'exit'
        p.last.progress -= currentFIdx - lastFIdx
        return p
      })

    const updatePlayers = lastLv1Players
      // U - E
      .filter(p => !exitPlayers.find(ep => ep.id === p.id))
      // .filter(p => currentlv1Players.find(cp => cp.id === p.id))
      .map(p => {
        // 6 / 30 s === 200ms
        p.last.progress = Math.min(6, p.last.progress + currentFIdx - lastFIdx)
        p.last.status = p.last.progress === 6 ? 'update' : 'enter'
        return p
      })

    // enter
    const enterPlayers = currentlv1Players
      .filter(cp => !lastLv1Players.find(p => p.id === cp.id))
      .map(p => {
        ; (p as KeyPlayer).last = { status: 'enter', progress: 0 }
        return p as KeyPlayer
      })

    // control here
    const lv1Players: KeyPlayer[] = [
      ...enterPlayers,
      ...updatePlayers,
      ...exitPlayers.filter(p => p.last.progress > 0)
    ]

    if (lv1Players.length >= MAX_HIGHLIGHTED) {
      console.warn('More than the upper limit')
    }

    lv2Players = [
      ...lv2Players,
      ...lv1Players.map(p => ({
        id: p.id,
        type: new Set([Lv2PlayerType.Normal])
      }))
    ]

    // Step2 find the interested players
    if (params.LV_INTRE) {
      Object.entries(playerAttentions)
        .forEach(([pId, { att, on, looked }]) => {
          lv2Players.push({ id: +pId as PlayerID, att, on, looked, type: new Set([Lv2PlayerType.Interest]) })
        })
    }

    // cache the keyplayers
    this.#keyPlayers.unshift({
      fIdx: currentFIdx,
      videoId: this.currentVideo!.id,
      players: lv1Players
    })

    return {
      lv1Players: lv1Players.reduce((o, p) => {
        if (!(p.id in o)) {
          o[p.id] = p
        }
        // use the higher rank
        if (p.type < o[p.id].type) {
          o[p.id].type = p.type
        }

        return o
      }, {} as Record<PlayerID, KeyPlayer>),
      //
      lv2Players: lv2Players.reduce((o, p) => {
        if (!(p.id in o)) o[p.id] = p
        else {
          o[p.id] = { ...o[p.id], ...p, type: union(p.type, o[p.id].type) }
        }
        return o
      }, {} as Record<PlayerID, Lv2Player>),
      teamWithBall,
      ballHolder: players?.find(p => p.id === ball?.playerId)
    }
  }

  /**
   * -------------- Game data ----------------
   */
  scales = {
    regionScale: scaleOrdinal<string>(schemeSet3),
    twoPTColor: scaleSequential<string>(interpolateYlGnBu)
      // .domain([-0.4, 0.4]),
      .domain([0.2, 0.8]),
    twoPT: scaleSequential<number>()
      .domain([0, 0.4])
      .range([0, 1]),
    threePTColor: scaleSequential<string>(interpolateYlGnBu)
      // .domain([-0.27, 0.27]),
      .domain([0.2, 0.8]),
    threePT: scaleSequential<number>()
      .domain([0, 0.27])
      .range([0, 1]),
    radiusScale: scaleSqrt()
      .domain([0, 1])
      .range([1, hRadius]),
    regionExp: scaleSequential<string>(interpolateReds)
      .domain([0.1, params.GAME_ID === 'game1' ? 2 : 2.5])
  } as const
}