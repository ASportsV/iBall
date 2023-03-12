import "./style.scss"

import React, { memo } from 'react'
import type { Frame } from 'common/@types';

import type { PlayerID, PlayerShotBin, ShotRecord } from '@types'
import { miniMapSize, PLAYER_META } from '@const';

import { hexbin, Scales } from "@utils";
import { HexbinBin } from 'd3-hexbin';
import { videoEnv } from 'App';


const scaleT2Minimap = miniMapSize[0] / 94;

const HexaBin = memo(function HexaBin(props: { isIn: boolean, d: PlayerShotBin }) {
  const { isIn, d } = props
  return <path
    // fill={mapRegionToPoint(d.region) === 2
    //   ? dataTower.scales.twoPTColor(d.regionRate)
    //   : dataTower.scales.threePTColor(d.regionRate)}
    // fill={dataTower.scales.regionScale(d.region)}
    className="court_bin"
    fill={Scales.regionExp(d.regionExp)}
    strokeWidth={isIn ? 2 : 0}
    d={`M${d.x},${d.y}${hexbin.hexagon()}`}
  ></path>;
  //dataTower.scales.radiusScale(d.freqByRegion)
})

interface HexaProps {
  currentBin?: HexbinBin<ShotRecord>
  playerBins?: PlayerShotBin[]
}
const Hexagon = memo(function Hexagon(props: HexaProps) {
  const { playerBins, currentBin } = props

  return <svg width={miniMapSize[0]} height={`${scaleT2Minimap * 50}px`}
    style={{ position: 'absolute', overflow: 'visible' }}>
    <g transform={`scale(${miniMapSize[0] / 940})`}>
      {playerBins?.map(d => {
        const isIn = d.x === currentBin?.x && d.y === currentBin?.y;
        return <HexaBin key={`${d.x}_${d.y}`} d={d} isIn={isIn} />
      })}
    </g>
  </svg>;
})

interface CourtProps {
  currentFrameData?: Frame<PlayerID>
}
export const Court = memo(function Court(props: CourtProps) {
  const { currentFrameData } = props;

  if (!currentFrameData)
    return <></>

  const { players, ball } = currentFrameData; // 

  const playerMarkers = players
    ?.filter(({ tracking }) => tracking.x !== undefined && tracking.y !== undefined)
    .map(({ tracking, id }, mIdx) => {
      const { x: tx, y: ty } = tracking
      const team = PLAYER_META[id].team

      return <div key={id}
        className="marker"
        style={{
          top: ty! * scaleT2Minimap,
          left: tx! * scaleT2Minimap,
          backgroundColor: ['GSW', 'LAC'].includes(team) ? 'steelblue' : '#ff6347',
          color: ball?.playerId === id ? 'red' : '#000',
          fontSize: ball?.playerId === id ? '15px' : '12px'
        }}
      >{PLAYER_META[id]?.ln}</div>;
    });

  if (ball) {
    playerMarkers?.push(<div key={'ball'}
      className="marker"
      style={{
        top: ball.tracking.y * scaleT2Minimap,
        left: ball.tracking.x * scaleT2Minimap,
        backgroundColor: 'orange'
      }}
    ></div>);
  }

  // id 201939
  const playerId = ball?.playerId;
  const playerWithBall = players?.find(p => p.id === playerId);

  const currentBin = videoEnv.getCurrentBin(playerWithBall)
  const playerBins = videoEnv.getPlayerBins(playerWithBall?.id)

  return <div className="court">
    {playerId && <Hexagon
      currentBin={currentBin}
      playerBins={playerBins}
    ></Hexagon>}
    {playerMarkers}
    <img
      className="court-img"
      style={{ width: miniMapSize[0] }}
      src={`${process.env.PUBLIC_URL}/court.png`}
    >
    </img>
  </div>;

})
Court.displayName = 'Court'
