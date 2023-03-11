import React from 'react'

import { SVGLayer, SVGLayerProps } from 'common/@components'
import { GameID, Gaze, Player, PlayerID, PLAYER_STATUS, VideoID } from '@types'
import { GAZE_R, PLAYER_META } from '@const'
import { Frame } from 'common/@types'

interface Props extends SVGLayerProps<GameID, VideoID, PlayerID> {
  currentFrameData?: Frame<PlayerID>

  gazePlayers?: Player[]
  gaze?: Gaze
  // sync?: boolean
  bbox?: boolean
}

export class Overlay extends React.Component<Props> {

  render() {
    const {
      gaze,
      gazePlayers,
      bbox = true,
      currentFrameData,
      ...svgLayerProps
    } = this.props
    const { teamWithBall, ball, players } = currentFrameData ?? {}
    const { isTransit } = svgLayerProps.currentVideo ?? {}

    return <SVGLayer
      {...svgLayerProps}
    >

      {/* {gaze && <g transform={`translate(${gaze.x}, ${gaze.y})`}>
        <circle r={GAZE_R}
          stroke={'red'}
          fill={'rgba(255, 0, 0, 0.1)'}></circle>
        <text
          textAnchor="middle"
          // stroke="#fff"
          fill='#fff'
          // stroke-width="1px"
          alignmentBaseline="middle"
        >
          {(gaze.x).toFixed(0)}, {(gaze.y).toFixed(0)}
          fIdx: {gaze.fIdx}
        </text>
      </g>
      } */}

      {!isTransit && <text x={10} y={20} fill={'#fff'}>Team w/ ball: {teamWithBall}</text>}
      {!isTransit && <text x={150} y={20} fill={'#fff'}>Ballholder: {ball?.playerId ? PLAYER_META[ball!.playerId].ln : null}</text>}
      {/* {!isTransit && <text x={350} y={20} fill={'#fff'}>FrameIdx: {frameIdx}</text>} */}

      {!isTransit && bbox && players
        ?.filter(({ dataPkg }) => dataPkg)
        .map(({ bbox, id, dataPkg }) => {
          return <g
            key={id}
            className={`bbox ${gazePlayers?.some(p => p.id === id) ? 'active' : ''}`}
            transform={`translate(${bbox.x}, ${bbox.y})`}>
            <rect
              width={bbox.w}
              height={bbox.h}
            />
            {dataPkg && <text
              fill='#fff'
              alignmentBaseline="middle"
            >
              {`${dataPkg.mode}, v: ${(dataPkg?.mode === PLAYER_STATUS.defensive
                ? dataPkg.diff
                : dataPkg.regionExp).toFixed(1)}`}
            </text>
            }
          </g>
        }
        )}
    </SVGLayer>
  }
}
