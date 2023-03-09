import { Hexbin, HexbinBin, hexbin as d3Hexbin } from 'd3-hexbin';

import type { Point } from "common/@types"
import { distPoints } from "common/@utils"

import { PLAYER_META } from "@const"
import type { GameID } from '@types'
import type { PlayerID, CachePlayerBin, ShotRecord } from '@types';

if (process.env.NODE_ENV !== 'production') {
  (global as any).$RefreshReg$ = () => { };
  (global as any).$RefreshSig$ = () => () => { };
}

const getArea = (area: string) => area.match(/\((\w+)\)/)?.[1]
const getRegionKey = (r: { AREA: string, BASIC: string, RANGE: string }) =>
  getArea(r.AREA) + "_" +
  r.RANGE

const mapRegionToPoint = (region: string) => {
  return region && (region.endsWith("24+ ft.") || region.endsWith("Back Court Shot")) ? 3 : 2
}

export const hRadius = 7
export const hexbin = d3Hexbin<ShotRecord>()
  .x(d => d.LOC_X)
  .y(d => d.LOC_Y)
  .radius(hRadius)

export const leagueAvgByRegion = [
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "Above the Break 3",
    "SHOT_ZONE_AREA": "Back Court(BC)",
    "SHOT_ZONE_RANGE": "Back Court Shot",
    "FGA": 59,
    "FGM": 4,
    "FG_PCT": 0.068
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "Above the Break 3",
    "SHOT_ZONE_AREA": "Center(C)",
    "SHOT_ZONE_RANGE": "24+ ft.",
    "FGA": 10885,
    "FGM": 3746,
    "FG_PCT": 0.344
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "Above the Break 3",
    "SHOT_ZONE_AREA": "Left Side Center(LC)",
    "SHOT_ZONE_RANGE": "24+ ft.",
    "FGA": 16648,
    "FGM": 5802,
    "FG_PCT": 0.349
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "Above the Break 3",
    "SHOT_ZONE_AREA": "Right Side Center(RC)",
    "SHOT_ZONE_RANGE": "24+ ft.",
    "FGA": 15837,
    "FGM": 5597,
    "FG_PCT": 0.353
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "Backcourt",
    "SHOT_ZONE_AREA": "Back Court(BC)",
    "SHOT_ZONE_RANGE": "Back Court Shot",
    "FGA": 440,
    "FGM": 17,
    "FG_PCT": 0.039
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "In The Paint (Non-RA)",
    "SHOT_ZONE_AREA": "Center(C)",
    "SHOT_ZONE_RANGE": "Less Than 8 ft.",
    "FGA": 19352,
    "FGM": 7561,
    "FG_PCT": 0.391
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "In The Paint (Non-RA)",
    "SHOT_ZONE_AREA": "Center(C)",
    "SHOT_ZONE_RANGE": "8-16 ft.",
    "FGA": 6851,
    "FGM": 2889,
    "FG_PCT": 0.422
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "In The Paint (Non-RA)",
    "SHOT_ZONE_AREA": "Left Side(L)",
    "SHOT_ZONE_RANGE": "8-16 ft.",
    "FGA": 2089,
    "FGM": 842,
    "FG_PCT": 0.403
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "In The Paint (Non-RA)",
    "SHOT_ZONE_AREA": "Right Side(R)",
    "SHOT_ZONE_RANGE": "8-16 ft.",
    "FGA": 1932,
    "FGM": 799,
    "FG_PCT": 0.414
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "Left Corner 3",
    "SHOT_ZONE_AREA": "Left Side(L)",
    "SHOT_ZONE_RANGE": "24+ ft.",
    "FGA": 7864,
    "FGM": 2939,
    "FG_PCT": 0.374
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "Mid-Range",
    "SHOT_ZONE_AREA": "Center(C)",
    "SHOT_ZONE_RANGE": "16-24 ft.",
    "FGA": 7324,
    "FGM": 2897,
    "FG_PCT": 0.396
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "Mid-Range",
    "SHOT_ZONE_AREA": "Center(C)",
    "SHOT_ZONE_RANGE": "8-16 ft.",
    "FGA": 2265,
    "FGM": 987,
    "FG_PCT": 0.436
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "Mid-Range",
    "SHOT_ZONE_AREA": "Left Side Center(LC)",
    "SHOT_ZONE_RANGE": "16-24 ft.",
    "FGA": 7754,
    "FGM": 3066,
    "FG_PCT": 0.395
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "Mid-Range",
    "SHOT_ZONE_AREA": "Left Side(L)",
    "SHOT_ZONE_RANGE": "8-16 ft.",
    "FGA": 7639,
    "FGM": 3005,
    "FG_PCT": 0.393
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "Mid-Range",
    "SHOT_ZONE_AREA": "Left Side(L)",
    "SHOT_ZONE_RANGE": "16-24 ft.",
    "FGA": 5452,
    "FGM": 2173,
    "FG_PCT": 0.399
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "Mid-Range",
    "SHOT_ZONE_AREA": "Right Side Center(RC)",
    "SHOT_ZONE_RANGE": "16-24 ft.",
    "FGA": 8145,
    "FGM": 3249,
    "FG_PCT": 0.399
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "Mid-Range",
    "SHOT_ZONE_AREA": "Right Side(R)",
    "SHOT_ZONE_RANGE": "8-16 ft.",
    "FGA": 7630,
    "FGM": 3011,
    "FG_PCT": 0.395
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "Mid-Range",
    "SHOT_ZONE_AREA": "Right Side(R)",
    "SHOT_ZONE_RANGE": "16-24 ft.",
    "FGA": 4924,
    "FGM": 1996,
    "FG_PCT": 0.405
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "Restricted Area",
    "SHOT_ZONE_AREA": "Center(C)",
    "SHOT_ZONE_RANGE": "Less Than 8 ft.",
    "FGA": 67443,
    "FGM": 40634,
    "FG_PCT": 0.602
  },
  {
    "GRID_TYPE": "League Averages",
    "SHOT_ZONE_BASIC": "Right Corner 3",
    "SHOT_ZONE_AREA": "Right Side(R)",
    "SHOT_ZONE_RANGE": "24+ ft.",
    "FGA": 7360,
    "FGM": 2803,
    "FG_PCT": 0.381
  }
].reduce((o, d) => {
  const key = getRegionKey({ AREA: d.SHOT_ZONE_AREA, BASIC: d.SHOT_ZONE_BASIC, RANGE: d.SHOT_ZONE_RANGE })
  o[key] = {
    FGA: d.FGA,
    FGM: d.FGM,
    rate: d.FG_PCT,
    exp: mapRegionToPoint(key) * d.FG_PCT
  }
  return o
}, {} as Record<string, { FGA: number, FGM: number, rate: number, exp: number }>)

const groupShotsByRegion = (shots: ShotRecord[]) => {
  const byRegion = shots
    .reduce((o, r) => {
      const key = getRegionKey(r.SHOT_ZONE)
      if (!(key in o)) {
        o[key] = []
      }
      o[key].push(r)
      return o
    }, {} as Record<string, ShotRecord[]>)

  const byRegionAndPercentage: Record<string, {
    shots: ShotRecord[],
    rate: number,
    diff: number,
    eDiff: number,
    exp: number,
    region: { AREA: string, BASIC: string, RANGE: string }
  }> = {}

  for (const key of Object.keys(byRegion)) {
    const shots = byRegion[key]
    const rate = shots.filter(s => +s.made).length / shots.length
    const diff = rate - leagueAvgByRegion[key].rate
    const exp = rate * mapRegionToPoint(key)

    byRegionAndPercentage[key] = {
      shots,
      region: shots[0].SHOT_ZONE,
      rate,
      exp,
      diff,
      eDiff: 2 * (-0.5 + 1 / (1 + Math.exp(-5 * diff))),
    }
  }

  return byRegionAndPercentage
}

const mapLOCTOTracking = (onTheRight: boolean, r: ShotRecord) => ({ //, mapSize: [number, number]) => ({
  ...r,
  LOC_X: (onTheRight ? (940 - (r.LOC_Y + 52.5)) : (r.LOC_Y + 52.5)), // / (940 / mapSize[0]),
  LOC_Y: ((onTheRight ? r.LOC_X : -r.LOC_X) + 250), // / (500 / mapSize[1])
})

// detect whether at 2 or 3 points region
const TwoOrThreePt = ({ x, y }: Point) => {
  if (x === undefined || y === undefined) return 2
  const point1 = 14
  const point2 = 5.25 + 23.75
  if (x < 47) {
    // on the left
    if (x < point1) {
      // check y
      return (y > 3 && y < (50 - 3)) ? 2 : 3
    } else if (x < point2) {
      // check dist
      const dist = distPoints({ x, y }, { x: 5.25, y: 25 })
      return dist > 23.75 ? 3 : 2
    }
  } else {
    // on the right
    if (x > (94 - point1)) {
      return (y > 3 && y < (50 - 3)) ? 2 : 3
    } else if (x > (94 - point2)) {
      const dist = distPoints({ x, y }, { x: 94 - 5.25, y: 25 })
      return dist > 23.75 ? 3 : 2
    }
  }
}


function normalize(v?: number, min?: number, max?: number) {
  if (v === undefined || min === undefined || max === undefined) return -1
  return (v - min) / (max - min)
}

function POS_TO_OFF_TEAM(gameId: GameID, x?: number) {
  if (x === undefined) return undefined
  return gameId === 'game1'
    ? x < 47 ? 'CLE' : 'GSW'
    : x < 47 ? 'OKC' : 'LAC'
}

export function GOAL_BASKET_POS(playerId: PlayerID) {
  const team = PLAYER_META[playerId].team
  const left = new Set(['CLE', 'OKC'])
  // const right = new Set(['GSW', 'LAC'])

  return left.has(team) ? { x: 5.8, y: 25 } : { x: 88.2, y: 25 }
}

function PLAYER_ID_TO_OFF_RIGHT(playerId: PlayerID) {
  return new Set(['GSW', 'LAC']).has(PLAYER_META[playerId].team)
}

function getPlayerBins(hexbin: Hexbin<ShotRecord>, playerId: PlayerID, shotRecords: ShotRecord[]) {
  const onTheRight = PLAYER_ID_TO_OFF_RIGHT(playerId)
  const leagueShots = shotRecords
    .map(r => mapLOCTOTracking(onTheRight, r))
  const playerShots = leagueShots
    .filter(r => r.PLAYER_ID === playerId)

  const playerShotsByRegion = groupShotsByRegion(playerShots)
  const bins = hexbin(leagueShots)
  const playerShotInBinWithDiff = bins
    .map(d => {
      const [region, value] = Object.entries(groupShotsByRegion(d))
        .reduce((o, d) => (o && o[1].shots.length > d[1].shots.length) ? o : d)

      const dft = leagueAvgByRegion[region]
      const {
        rate = dft?.rate ?? 0,
        diff = 0,
        eDiff = 0,
        exp = dft?.exp ?? 0
      } = playerShotsByRegion[region] ?? {}

      const newD = d as HexbinBin<ShotRecord> & CachePlayerBin
      newD.region = value.region
      newD.diff = diff;
      newD.eDiff = eDiff;
      newD.regionRate = rate;
      newD.regionExp = exp
      return newD
    })

  // normalize
  playerShotInBinWithDiff.forEach(d => {
    ; (d as CachePlayerBin).regionFreq = d.length / Math.max(...playerShotInBinWithDiff.filter(r => r.region === d.region).map(r => r.length))
  })

  return playerShotInBinWithDiff.map(({ x, y, region, regionExp, regionRate, regionFreq, diff, eDiff }) => ({
    x, y, region, regionExp, regionRate, regionFreq, diff, eDiff
  })) as CachePlayerBin[]
}

/**
 * dirty hack
 */
export function getCanvasAbsTopLeft() {
  const elm = document.getElementById("canvasWrapper")
  if (!elm) return { x: 0, y: 0 }
  const { x, y, width, height } = elm?.getBoundingClientRect()
  return {
    // x: x + window.screenX,
    // y: y + window.screenY + window.outerHeight - window.innerHeight,
    x: x,
    y: y + window.outerHeight / 50,
    wScale: 1280 / width,
    hScale: 720 / height
  }
}

export {
  mapRegionToPoint, TwoOrThreePt, normalize, getPlayerBins,
  PLAYER_ID_TO_OFF_RIGHT, POS_TO_OFF_TEAM,
  getArea, getRegionKey, groupShotsByRegion, mapLOCTOTracking
}