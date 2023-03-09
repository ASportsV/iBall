import { csvParse } from "d3-dsv";
import {
  getPlayerBins, getRegionKey, hexbin, normalize, POS_TO_OFF_TEAM, TwoOrThreePt
} from "@utils";
import { distPoints, extent, getAngle } from "common/@utils";

import { PLAYER_META } from "@const";

import { CacheFrameData, Point } from "common/@types";
import {
  PlayerID, TeamID, 
  Player, Video,
  CachePlayerBin, DefenseRecord,
  DefensivePkg, OffensivePkg, PLAYER_STATUS, PlayerShotBin, ShotRecord
} from "@types";

import { Database } from 'common/DataLoader'

export interface IBallTables {
  playerBins: { playerId: PlayerID, bins: CachePlayerBin[] },
  defenseRecords: DefenseRecord
}

export async function postProcessing({ gameId }: Video, frames: CacheFrameData<PlayerID>[], db: Database<IBallTables>) {
  const playerBins = await loadBins(db)
  const dfRecords = await loadDFRecord(db)
  // link frames
  // link each player with next and pre frame
  for (const frame of frames) {
    const { players, idx: frameIdx } = frame

    if (frameIdx > frames[0].idx) {
      const { players: prePlayers } = frames[frameIdx - 1]
      players?.forEach(player => {
        (player as any).preFrame = prePlayers?.find(p => p.id === player.id)
      })
    }

    if (frameIdx < frames[frames.length - 1].idx) {
      const { players: nextPlayers } = frames[frameIdx + 1]
      players?.forEach(player => {
        (player as any).nextFrame = nextPlayers?.find(p => p.id === player.id)
      })
    }
  }

  const smoothSteps = 8 // half
  // calculate namePos
  for (const frame of frames) {
    // frameIdxs.forEach(frameIdx => {
    const { players, idx: frameIdx } = frame
    if (!players) continue

    for (const player of players) {
      const smoothFrames = getSmoothFrames(player, smoothSteps)
      const smoothX = smoothFrames.reduce((o, { keypoints: { right_hip, left_hip } }) => o + (left_hip.x + right_hip.x) / 2, 0) / smoothFrames.length
      const smoothY = smoothFrames.reduce((o, { keypoints: { nose } }) => o + nose.y - 22, 0) / smoothFrames.length
        ; (player as any).namePos = { x: smoothX, y: smoothY }
    }
  }

  // calculate dataPkg
  for (const frame of frames) {
    const { players, teamWithBall, ball, idx: frameIdx } = frame
    if (!players) continue

    const ballHolder = players.find(p => p.id === ball?.playerId)
    const { x: btx, y: bty } = ballHolder?.tracking ?? {}

    for (const player of players) {
      const { x: tx, y: ty, } = player.tracking
      if (tx === undefined || ty === undefined) continue

      const isOffensive = PLAYER_META[player.id].team === teamWithBall
      const mode: PLAYER_STATUS = isOffensive ? PLAYER_STATUS.offensive : PLAYER_STATUS.defensive
      // use this to check the status of the players
      const inOffsensiveCourt = POS_TO_OFF_TEAM(gameId, tx) === teamWithBall

      let dataPkg = undefined
      if (mode === PLAYER_STATUS.offensive) {
        // 1. get the data in the current bin
        const { region, diff = 0, eDiff = 0, regionRate = 0, regionExp = 0 } = getCurrentBin(playerBins[player.id]!, { x: tx, y: ty }) ?? {}

        const smoothFrames = getSmoothFrames(player, smoothSteps)
        const smoothRegionExp = smoothFrames
          .reduce((o, { tracking, id }) => o + (getCurrentBin(playerBins[id]!, tracking)?.regionExp ?? 0), 0) / smoothFrames.length

        dataPkg = {
          mode,
          region,
          diff,
          eDiff,
          freq: 0,
          regionRate,
          regionExp,
          smoothRegionExp,
          inOffsensiveCourt
        } as OffensivePkg

      } else if (mode === PLAYER_STATUS.defensive && inOffsensiveCourt && ballHolder) {
        if (btx === undefined || bty === undefined) continue

        const smoothFrames = getSmoothFrames(player, smoothSteps)
        const smoothDFdiff = smoothFrames
          .reduce((o, { tracking, id }) => o + (dfRecords
            .find(df => df.PLAYER_ID === id && df.DEFENSE_CATEGORY === `${TwoOrThreePt(tracking)} Pointers`)?.PCT_PLUSMINUS ?? 0),
            0) / smoothFrames.length

        const dfRecord = dfRecords.find(df => df.PLAYER_ID === player.id && df.DEFENSE_CATEGORY === `${TwoOrThreePt({ x: tx, y: ty })} Pointers`)

        const tangle = getAngle(tx, ty, btx, bty)
        const tdist = distPoints({ x: tx, y: ty }, { x: btx, y: bty })
        dataPkg = {
          mode,
          tangle,
          tdist,
          defendingPlayer: ballHolder?.id,
          diff: dfRecord?.PCT_PLUSMINUS ?? 0,
          smoothDFdiff,
          speed: dfRecord?.AVG_DEF_SPEED ?? 0,
          freq: dfRecord?.FREQ ?? 0,
        } as DefensivePkg
      }

      if (dataPkg) player.dataPkg = dataPkg
    }
  }

  // remove next frames
  for (const frame of frames) {
    const { players } = frame
    if (!players) continue

    for (const player of players) {
      delete (player as any)['preFrame']
      delete (player as any)['nextFrame']
    }
  }

  return frames
}


function getSmoothFrames(player: Player & { nextFrame?: Player, preFrame?: Player }, smoothSteps: number) {
  return [
    ...Array(smoothSteps).fill(0)
      // iterate to the frame
      .map((_, idx) => Array(idx).fill(0).reduce((o, _) => o ? o.preFrame : o, player))
      // remove undefined
      .filter(f => f).reverse(),
    player,
    ...Array(smoothSteps).fill(0)
      // iterate to the frame
      .map((_, idx) => Array(idx).fill(0).reduce((o, _) => o ? o.nextFrame : o, player))
      // remove undefined
      .filter(f => f),
  ] as Player[]
}

function getCurrentBin(playerBins: PlayerShotBin[], { x, y }: Point) {
  if (x === undefined || y === undefined) return
  // binMap
  // const playerBins = this.#playerBins[playerId]
  // from tx, ty ---> bin
  const currentBinCoords = hexbin([{
    LOC_X: x * 10,
    LOC_Y: y * 10
  } as any])[0]
  // from bin to binMap
  const currentBin = playerBins!.find(b => b.x === currentBinCoords.x && b.y === currentBinCoords.y)
  return currentBin
}

async function loadBins(db: Database<IBallTables>) {
  let playerBins = await db.myTables.playerBins.toArray()
  if (playerBins.length === 0) {
    // let shotRecords: ShotRecord[] = await db.shotRecrods.toArray()
    const rawCsv = await fetch(`${process.env.PUBLIC_URL}/player_stats.csv`).then(res => res.text())
    const shotRecords = csvParse(rawCsv)
      .map(({
        GAME_EVENT_ID, GAME_ID,
        LOC_X, LOC_Y, PLAYER_ID,
        SHOT_MADE_FLAG,
        SHOT_ZONE_AREA,
        SHOT_ZONE_BASIC, SHOT_ZONE_RANGE,
      }) => ({
        GAME_EVENT_ID,
        GAME_ID,
        LOC_X: +LOC_X!,
        LOC_Y: +LOC_Y!,
        PLAYER_ID: +PLAYER_ID!,
        made: +SHOT_MADE_FLAG!,
        SHOT_ZONE: {
          AREA: SHOT_ZONE_AREA,
          BASIC: SHOT_ZONE_BASIC,
          RANGE: SHOT_ZONE_RANGE,
        },
      } as ShotRecord))

    playerBins = Object.keys(PLAYER_META)
      .map((playerId) => ({
        playerId: +playerId as PlayerID,
        bins: getPlayerBins(hexbin, +playerId as PlayerID, shotRecords)
      }))
    db.myTables.playerBins.bulkPut(playerBins)
  }
  return playerBins.reduce((o, d) => {
    o[d.playerId] = d.bins.map(b => ({ ...b, region: getRegionKey(b.region) }))
    return o
  }, {} as Partial<Record<PlayerID, PlayerShotBin[]>>)
}

async function loadDFRecord(db: Database<IBallTables>) {
  // defense records
  let defenseRecords: DefenseRecord[] = await db.myTables.defenseRecords.toArray()
  if (defenseRecords.length === 0) {
    const rawCsv = await fetch(`${process.env.PUBLIC_URL}/shotdefense.csv`).then(res => res.text())
    defenseRecords = csvParse(rawCsv)
      .map(({ CLOSE_DEF_PERSON_ID, DEFENSE_CATEGORY, FREQ, D_FGM, D_FGA, D_FG_PCT, NORMAL_FG_PCT, PCT_PLUSMINUS }) => ({
        PLAYER_ID: +CLOSE_DEF_PERSON_ID!,
        DEFENSE_CATEGORY,
        FREQ: +FREQ!,
        D_FGM: +D_FGM!,
        D_FGA: +D_FGA!,
        D_FG_PCT: +D_FG_PCT!,
        NORMAL_FG_PCT: +NORMAL_FG_PCT!,
        PCT_PLUSMINUS: +PCT_PLUSMINUS!
      } as DefenseRecord))
    db.myTables.defenseRecords.bulkPut(defenseRecords)
  }

  const game1Teams: Set<TeamID> = new Set(['GSW', 'CLE'])
  const game2Teams: Set<TeamID> = new Set(['OKC', 'LAC'])

  const getExtentByGame = (teams: Set<TeamID>) => extent(defenseRecords
    .filter(r => teams.has(PLAYER_META[r.PLAYER_ID].team))
    .map(r => r.PCT_PLUSMINUS))

  const [minG1, maxG1] = getExtentByGame(game1Teams)
  const [minG2, maxG2] = getExtentByGame(game2Teams)

  // only consider the negative diff
  return defenseRecords.map(({ PCT_PLUSMINUS, ...r }) => ({
    ...r,
    PCT_PLUSMINUS: game1Teams.has(PLAYER_META[r.PLAYER_ID].team)
      ? normalize(-PCT_PLUSMINUS, 0, -minG1)
      : normalize(-PCT_PLUSMINUS, 0, -minG2)
    // AVG_DEF_SPEED: normalize(PLAYER_META[r.PLAYER_ID]?.offSpeed, minSpeed, maxSpeed)
  }))
}
