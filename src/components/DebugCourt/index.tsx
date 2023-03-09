// import React, { memo } from 'react'
// import { PlayerId, PlayerShotBin } from '@types'
// import { miniMapSize, PLAYER_META } from '@const';
// // import { dataTower } from 'DataTower';
// import { hexbin } from 'DataTower/shots';

// const scaleT2Minimap = miniMapSize[0] / 94;

// const HexaBin = memo(function HexaBin(props: { isIn: boolean, d: PlayerShotBin }) {
//   const { isIn, d } = props
//   return <path
//     // fill={mapRegionToPoint(d.region) === 2
//     //   ? dataTower.scales.twoPTColor(d.regionRate)
//     //   : dataTower.scales.threePTColor(d.regionRate)}
//     // fill={dataTower.scales.regionScale(d.region)}
//     fill={dataTower.scales.regionExp(d.regionExp)}
//     strokeWidth={isIn ? 2 : 0}
//     stroke={"#000"}
//     d={`M${d.x},${d.y}${hexbin.hexagon()}`}
//   ></path>;
// //dataTower.scales.radiusScale(d.freqByRegion)
// })

// interface HexaProps {
//   playerId: PlayerId
//   tx?: number
//   ty?: number
// }
// const Hexagon = memo(function Hexagon(props: HexaProps) {
//   const { playerId, tx, ty } = props

//   const playerBins = dataTower.getPlayerBins(playerId)

//   const currentBin = (tx !== undefined && ty !== undefined)
//     ? hexbin([{
//       LOC_X: tx * 10,
//       LOC_Y: ty * 10
//     } as any])[0]
//     : null;

//   return <svg width={miniMapSize[0]} height={`${scaleT2Minimap * 50}px`}
//     style={{ position: 'absolute', overflow: 'visible' }}>
//     <g transform={`scale(${miniMapSize[0] / 940})`}>
//       {playerBins?.map(d => {
//         const isIn = d.x === currentBin?.x && d.y === currentBin?.y;
//         return <HexaBin key={`${d.x}_${d.y}`} d={d} isIn={isIn} />
//       })}
//     </g>
//   </svg>;
// })

// interface CourtProps {
//   currentFrameIdx: number
// }
// export const Court = memo(function Court(props: CourtProps) {
//   const { currentFrameIdx } = props;
//   const currentFrame = dataTower.frames?.[currentFrameIdx]
//   if (!currentFrame)
//     return <></>

//   const { players, ball } = currentFrame; // 

//   const playerMarkers = players
//     ?.filter(({ tx, ty }) => tx !== undefined && ty !== undefined)
//     .map(({ tx, ty, team, id }, mIdx) => {
//       return <div key={id}
//         className="marker"
//         style={{
//           top: ty! * scaleT2Minimap,
//           left: tx! * scaleT2Minimap,
//           backgroundColor: ['GSW', 'LAC'].includes(team) ? 'green' : 'orange',
//           color: ball?.[0] === id ? 'red' : '#000'
//         }}
//       >{PLAYER_META[id]?.ln}</div>;
//     });

//   if (ball) {
//     playerMarkers?.push(<div key={'ball'}
//       className="marker"
//       style={{
//         top: ball[2] * scaleT2Minimap,
//         left: ball[1] * scaleT2Minimap,
//         backgroundColor: 'red'
//       }}
//     ></div>);
//   }

//   // id 201939
//   const playerId = ball?.[0];
//   const playerWithBall = players?.find(p => p.id === playerId);

//   return <div className="court">
//     {playerId && <Hexagon
//       playerId={playerId}
//       tx={playerWithBall?.tx}
//       ty={playerWithBall?.ty}
//     ></Hexagon>}
//     {playerMarkers}
//     <img
//       className="court-img"
//       style={{ width: miniMapSize[0] }}
//       src={`${process.env.PUBLIC_URL}/court.png`}
//     >
//     </img>
//   </div>;

// })
// Court.displayName = 'Court'

export {}