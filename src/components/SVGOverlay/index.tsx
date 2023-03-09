// import './style.scss'
// import React from 'react'
// import clsx from 'clsx'

// import { Gaze, Player, PLAYER_STATUS } from '@types'
// // import { dataTower } from 'DataTower'
// import { GAZE_R, PLAYER_META } from '@const'

// interface Props {
//   width: number
//   height: number
//   frameIdx: number
//   isTransit: boolean
//   gazePlayers?: Player[]
//   gaze?: Gaze
//   // sync?: boolean
//   bbox: boolean
// }

// // function convertRemToPixels(rem: number) {
// //   return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
// // }

// // const CAPTION_FONT_SIZE = 2
// // const LINE_HEIGHT = 1.25
// // const NUMBER_OF_LINES = 2

// export class Overlay extends React.Component<Props> {

//   render() {
//     const { height = 0, width = 0, gaze, gazePlayers, isTransit, frameIdx, bbox = true } = this.props
//     const { players, teamWithBall, ball } = dataTower.frames?.[frameIdx] ?? {}

//     return <svg className="overlay" height={height} width={width}
//       viewBox={`0 0 ${width} ${height}`}
//       preserveAspectRatio='xMinYMin meet'
//     >
//       <defs>
//         <filter x="0" y="0" width="1" height="1" id="solid">
//           <feFlood floodColor="yellow" result="bg" />
//           <feMerge>
//             <feMergeNode in="bg" />
//             <feMergeNode in="SourceGraphic" />
//           </feMerge>
//         </filter>
//       </defs>

//       {gaze && <g transform={`translate(${gaze.x}, ${gaze.y})`}>
//         <circle r={GAZE_R} 
//           stroke={'red' } 
//           fill={'rgba(255, 0, 0, 0.1)'}></circle>
//         <text
//           textAnchor="middle"
//           // stroke="#fff"
//           fill='#fff'
//           // stroke-width="1px"
//           alignmentBaseline="middle"
//         >
//           {(gaze.x).toFixed(0)}, {(gaze.y).toFixed(0)}
//           fIdx: {gaze.fIdx}
//         </text>
//       </g>
//       }

//       {!isTransit && <text x={10} y={20} fill={'#fff'}>Team w/ ball: {teamWithBall}</text>}
//       {!isTransit && <text x={150} y={20} fill={'#fff'}>Ballholder: {ball?.[0] ? PLAYER_META[ball?.[0]].ln : null}</text>}
//       {!isTransit && <text x={350} y={20} fill={'#fff'}>FrameIdx: {frameIdx}</text>}

//       {!isTransit && bbox && players
//         ?.filter(({ dataPkg }) => dataPkg)
//         .map(({ bbox, id, dataPkg }) => {
//           return <g
//             key={id}
//             className={clsx(`personBBox`, { active: gazePlayers?.some(p => p.id === id) })}
//             transform={`translate(${bbox.x}, ${bbox.y})`}>
//             <rect
//               width={bbox.w}
//               height={bbox.h}
//             // onContextMenu={e => {
//             //   e.preventDefault()
//             //   e.stopPropagation()
//             //   this.props.onClickPersonBBox(idx, b)
//             // }}
//             // onClick={e => {
//             //     e.stopPropagation()
//             //     this.props.onClickPersonBBox(idx, b)
//             // }}
//             />
//             {dataPkg && <text
//               // textAnchor="middle"
              
//               fill='#fff'
//               alignmentBaseline="middle"
//             >
//               {`${dataPkg.mode}, v: ${(dataPkg?.mode === PLAYER_STATUS.defensive 
//                 ? dataPkg.diff 
//                 : dataPkg.regionExp).toFixed(1)}`}
//             </text>
//             }
//           </g>
//         }
//         )}
//     </svg>
//   }
// }

export {}