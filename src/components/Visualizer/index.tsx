import "./style.scss"
import React from 'react'

import { Layer } from 'common/@types'
import {
  Attentions,
  DefensivePkg,
  Gaze, KeyPlayer,
  Lv2Player, Lv2PlayerType, OffensivePkg, PLAYER_STATUS,
  PlayerID, Player,
  Video
} from '@types'

import * as _draw from 'common/@draw'
import * as draw from './visualizeData'
import { EnabledFeatures, videoEnv } from '../../App'
import { VisRing, VisSheild } from "./visualizeData"
import { PLAYER_META } from "@const"

const layerIds = ['0_bg', '1_vis', '2_fg', '3_annot', '4_debug'] as const

// 0bg --> raw frame
// 1vis --> vis
// 2fg --> fg + dark mask
// 3annot --> highlighted players

export type LayerId = typeof layerIds[number]

interface Props {
  currentVideo: Video
  currentFrameIdx: number
  currentFrame?: HTMLVideoElement
  // currentFrameData?: Frame

  gaze?: Gaze
  attentions?: Attentions
  gazePlayers?: Player[]

  features: EnabledFeatures

  onPickPlayers?: (fIdx: number, lv1Players: Record<PlayerID, KeyPlayer>, lv2Players: Record<PlayerID, Lv2Player>) => void
}

export class Visualizer extends React.Component<Props, {}> {

  public readonly layers: Record<LayerId, Layer | null> = layerIds.reduce((o, l) => {
    o[l] = null
    return o
  }, {} as Record<LayerId, Layer | null>)

  get2DPos(id: PlayerID, players: Player[]) {
    const { bbox, keypoints } = players?.find(p => p.id === id)!
    const team = PLAYER_META[id].team
    const { y, h } = bbox
    const { left_hip, right_hip, left_ankle, right_ankle } = keypoints

    // calculate cx and cy
    const cx = (left_hip.x + right_hip.x) / 2
    const cy = (y + h + Math.max(left_ankle.y, right_ankle.y)) / 2

    return { cx, cy, team }
  }

  isOnLv2Player = (p: Player, lv2Players: Record<PlayerID, Lv2Player>) => p.id in lv2Players
    && (
      (lv2Players[p.id].type.has(Lv2PlayerType.Interest) && lv2Players[p.id].on)
      || lv2Players[p.id].type.has(Lv2PlayerType.Normal)
      // || lv2Players[p.id].type === Lv2PlayerType.Normal_Interest
    )

  async componentDidUpdate(preProps: Props) {
    if (preProps.currentFrameIdx !== this.props.currentFrameIdx) {
      const {
        currentFrameIdx,
        currentFrame,
        features
      } = this.props
      if (!currentFrame) return

      this.cleanAllExcept('0_bg')
      _draw.bg(this.layers['0_bg']!, currentFrame)
      // dark overlay
      _draw.overlay(this.layers['1_vis']!, 0.18)
      // if (currentVideo.isTransit || params.MODE === 'RAW') return

      const currentFrameData = videoEnv.frames?.[currentFrameIdx]
      if (!currentFrameData) return

      const { players, ball } = currentFrameData
      if (!players) return

      // // Step1. detect the players to show
      const filter_focus = features.gaze_filter ? videoEnv.fetchFocus() : undefined
      const { lv1Players, lv2Players } = videoEnv.pickPlayers(currentFrameIdx, features, filter_focus)
      if (!lv1Players && !lv2Players) return

      // DEBUG.TIMELINE && this.props.onPickPlayers?.(currentFrameIdx, lv1Players, lv2Players)

      // Step2 Decide the data to show for each player
      const dataToVis = players!.filter(p => this.isOnLv2Player(p, lv2Players))

      // Step3 Visualization & Render

      const offensiveRings: VisRing[] = dataToVis
        .filter(p => p.dataPkg?.mode === PLAYER_STATUS.offensive && features.vis_off_ring)
        .map(({ dataPkg, id }) => {
          // console.log('Offensive circle', id, PLAYER_META[id].ln)
          let { smoothRegionExp, inOffsensiveCourt } = dataPkg as OffensivePkg
          const { cx, cy } = this.get2DPos(id, players)
          const fill = videoEnv.scales.regionExp(smoothRegionExp)
          return { cx, cy, fill, size: Math.min(1, smoothRegionExp / 2), inOffsensiveCourt }
        })

      const defensiveSheilds: VisSheild[] = dataToVis
        .filter(p => p.dataPkg?.mode === PLAYER_STATUS.defensive && features.vis_def_sheild)
        .map(({ dataPkg, id }) => {
          let { diff, speed, tangle, tdist, defendingPlayer, smoothDFdiff } = dataPkg as DefensivePkg
          const { cx, cy } = this.get2DPos(id, players)
          const { cx: dx, cy: dy } = this.get2DPos(defendingPlayer, players)

          return {
            cx, cy,
            dx, dy,
            diff, tangle, tdist,
            smoothDFdiff,
            speed,
          }
        })
      draw.Vis(this.layers['1_vis']!.ctx, offensiveRings, defensiveSheilds, this.layers['4_debug']?.ctx)

      // draw fg
      // draw.fg(this.layers['2_fg']?.ctx!, this.layers['0_bg']!.canvas, currentFrameData.mask!)
      draw.HL(this.layers['3_annot']?.ctx!, this.layers['0_bg']!.canvas, currentFrameData.mask!,
        players,
        // 
        players?.filter(p => p.id in lv1Players)
          .map(p => ({ ...p, ...lv1Players[p.id] })),
        players.filter(p => p.id in lv2Players)
          .map(p => ({ ...p, ...lv2Players[p.id] })),
        features,
        ball?.playerId,
        filter_focus
      )

      // 3. text annotations
      draw.Name(this.layers['3_annot']?.ctx!, players.find(p => p.id === ball?.playerId))
      // only on, will show the name
      Object.values(lv2Players)
        .filter(p => p.type.has(Lv2PlayerType.Interest) && p.on)
        .forEach(ip => {
          draw.Name(this.layers['3_annot']?.ctx!, players.find(p => p.id === ip.id))
        })
    }
  }

  render() {
    const { currentVideo } = this.props
    const { width = 0, height = 0 } = currentVideo ?? {}

    return (<div className='visualizationContainer'

      style={{
        marginLeft: '30px',
        justifyContent: 'center' //DEBUG ? 'flex-start' : 'center'
      }}
    >
      <div id="canvasWrapper" className="canvasWrapper">
        <img alt="www" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
          style={{ height: `${width / height * 100}%` }}
        ></img>
        {layerIds.map((l, idx) =>
          <canvas id={l}
            key={idx}
            width={width}
            height={height}
            ref={ref => {
              if (!ref) return
              this.layers[l] = { canvas: ref, ctx: ref.getContext('2d')! }
            }}
          />)}
        {this.props.children}
      </div>
    </div>)
  }

  public cleanAllExcept(layerId: LayerId) {
    Object.keys(this.layers)
      .filter(lId => lId !== layerId)
      .forEach((lId) => {
        const l = this.layers[lId as LayerId]
        l?.ctx.clearRect(0, 0, l.canvas.width, l.canvas.height)
      })
  }
}