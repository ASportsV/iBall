import { Overwrite } from "common/@types"
import type { PlayerID, VideoID } from "./index"

export enum PLAYER_STATUS {
  offensive = 'in_offensive',
  defensive = 'in_defensive',
  other = 'in_other'
}
export interface OffensivePkg {
  mode: PLAYER_STATUS.offensive
  region: string
  diff: number
  eDiff: number
  freq: number
  regionRate: number
  regionExp: number
  smoothRegionExp: number
  inOffsensiveCourt: boolean
}
export interface DefensivePkg {
  mode: PLAYER_STATUS.defensive
  defendingPlayer: PlayerID
  tangle: number
  tdist: number
  diff: number
  smoothDFdiff: number
  speed: number
  freq: number
}
export type DataPkg = OffensivePkg | DefensivePkg

export interface FrameStamp {
  videoId: VideoID
  fIdx: number
  ts: number
}

export interface Gaze extends FrameStamp {
  x: number,
  y: number
}

export type AttentionWeights = { att: number, looked: boolean, on: boolean }

// Partial<Record<PlayerId, { att: number, looked: boolean, on: boolean }>>
export interface Attentions {
  lastTs: number
  fIdx: number
  videoId?: VideoID
  players: Partial<Record<PlayerID, AttentionWeights>>
}

export type HighlightWeights = Partial<Record<PlayerID, { lostTs: number, sync: boolean }>>
export interface Highlights {
  lastTs: number
  players: HighlightWeights
}

export interface DefenseRecord {
  PLAYER_ID: PlayerID
  DEFENSE_CATEGORY: string,
  FREQ: number,
  D_FGM: number,
  D_FGA: number,
  D_FG_PCT: number,
  NORMAL_FG_PCT: number,
  PCT_PLUSMINUS: number,
  AVG_DEF_SPEED: number
}

export enum KeyPlayerType {
  BALL_HOLDER = 0,
  NEXT_BALL_HOLDER = 1,
  EMPTY_PLAYER = 2,
  STAR = 3,
}
export interface KeyPlayer {
  id: PlayerID
  last: { progress: number, status: 'enter' | 'update' | 'exit' } // in frames, exist when NEXT_BALL_HOLDER
  type: KeyPlayerType
}
export enum Lv2PlayerType {
  Interest = 1,
  Normal = 2,
  Normal_Interest = 3,
}
export interface Lv2Player extends Partial<AttentionWeights> {
  id: PlayerID
  type: Set<Lv2PlayerType>
}

export type CachePlayerBin = Overwrite<PlayerShotBin, {
  region: { AREA: string, BASIC: string, RANGE: string }
}>

export interface ShotRecord {
  // shot_id: string
  // ACTION_TYPE: string
  // EVENT_TYPE: string // "Missed Shot"
  GAME_EVENT_ID: string // "555"
  GAME_ID: string // "21500030"
  // GRID_TYPE: string //"Shot Chart Detail"
  // HTM: string //"HOU"
  LOC_X: number //"-68"
  LOC_Y: number // "242"
  // MINUTES_REMAINING: number //"3"
  // PERIOD: number //"4"
  PLAYER_ID: PlayerID //"203546"
  // PLAYER_NAME: string //"Ian Clark"
  // SECONDS_REMAINING: number // "18"
  // SHOT_ATTEMPTED_FLAG: string // "1"
  // SHOT_DISTANCE: number // "25"
  made: number // "0"
  // SHOT_TYPE: string //"3PT Field Goal"
  SHOT_ZONE: { AREA: string, BASIC: string, RANGE: string }
  // _AREA: string //"Center(C)"
  // SHOT_ZONE_BASIC: string // "Above the Break 3"
  // SHOT_ZONE_RANGE: string //"24+ ft."
  // TEAM_ID: number //"1610612744"
  // VTM: string //"GSW"
}

export type PlayerShotBin = {
  region: string
  regionRate: number
  regionFreq: number // freq in this bin by region
  regionExp: number // expect point value
  diff: number // ergion diff to league average
  eDiff: number
  x: number
  y: number
}