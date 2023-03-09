import { Player, Point } from 'common/@types'
import { getAngle } from "common/@utils";

import { PLAYER_META, COLORS, FOCUS, LV_INTEREST_THRESHOLD } from "@const";
import { PlayerID, KeyPlayer, KeyPlayerType, Lv2Player, Lv2PlayerType,  } from "@types";

import * as draw from './draw'

export interface VisCircle {
  cx: number,
  cy: number,
  fill: string,
  size: number,
  inOffsensiveCourt: boolean
}

function drawVisCircles(visCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, circles: VisCircle[]) {
  // 0 draw vis circle
  visCtx.save()
  const [a, b, c, d, e, f] = [1.75257350e+00, 5.98341402e-02, -8.91780472e-01, 2.49200452e-01, 0, 0]
  visCtx.setTransform(a, b, c, d, e, f);
  const circleTXY = circles.map(({ cx, cy }) => {
    const tx = (cx - (c / d) * cy + (c / d) * f - e) / (a - (c / d) * b)
    const ty = (cx - e - a * tx) / c
    return { tx, ty }
  })

  const in_r = 10
  const max_out_r = 22
  // draw outer
  circles
    .filter(c => c.inOffsensiveCourt)
    .forEach((_, cIdx) => {
      const { tx, ty } = circleTXY[cIdx]
      const out_r = in_r + max_out_r //25
      visCtx.fillStyle = COLORS.offense_outer_border
      visCtx.beginPath()
      visCtx.arc(tx, ty, out_r, 0, 2 * Math.PI);
      visCtx.fill();
    })

  // draw middle
  circles.forEach(({ size, fill }, cIdx) => {
    const { tx, ty } = circleTXY[cIdx]
    const out_r = in_r + max_out_r * size //25
    visCtx.fillStyle = fill
    visCtx.beginPath()
    visCtx.arc(tx, ty, out_r, 0, 2 * Math.PI);
    visCtx.fill();
  })

  // cut innner
  visCtx.globalCompositeOperation = 'destination-out'
  circles.forEach(({ fill }, cIdx) => {
    const { tx, ty } = circleTXY[cIdx]
    visCtx.beginPath()
    visCtx.arc(tx, ty, in_r, 0, 2 * Math.PI)
    visCtx.fill()
  })

  // draw outer borders
  visCtx.globalCompositeOperation = 'source-over'

  visCtx.lineWidth = 1;
  visCtx.strokeStyle = COLORS.offense_bg_fill
  circles
    .filter(c => c.inOffsensiveCourt)
    .forEach((_, cIdx) => {
      const { tx, ty } = circleTXY[cIdx]
      const out_r = in_r + max_out_r //25
      visCtx.beginPath()
      visCtx.arc(tx, ty, out_r, 0, 2 * Math.PI);
      visCtx.stroke()
    })

  // draw inner borders
  visCtx.strokeStyle = COLORS.offense_inner_border //"#313131"
  circles.forEach(({ inOffsensiveCourt }, cIdx) => {
    const { tx, ty } = circleTXY[cIdx]
    visCtx.lineWidth = inOffsensiveCourt ? 1 : 3;
    visCtx.beginPath()
    visCtx.arc(tx, ty, in_r, 0, 2 * Math.PI)
    visCtx.stroke()
  })

  visCtx.restore()
}

export interface VisSheild {
  // fillColor: string,
  diff: number,
  smoothDFdiff: number
  speed: number,
  cx: number,
  cy: number,
  dx: number
  dy: number
  tangle: number
  tdist: number
  // right: boolean
}

const roundTo2PI = (r: number) => (r + 2) % 2

function drawVisSheilds(visCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, sheilds: VisSheild[], debugCtx?: CanvasRenderingContext2D) {
  visCtx.save()
  // const [a, b, c, d, e, f] = [1.75257350e+00, 5.98341402e-02, -8.91780472e-01, 5.49200452e-01, 0, 0]
  const [a, b, c, d, e, f] = [1.75257350e+00, 0.0000001, 0.0000001, 5.49200452e-01, 0, 0]
  visCtx.setTransform(a, b, c, d, e, f);

  const invertTXY = (x: number, y: number) => {
    const tx = (x - (c / d) * y + (c / d) * f - e) / (a - (c / d) * b)
    const ty = (x - e - a * tx) / c
    return { x: tx, y: ty }
  }

  // const convertTXY = (x: number, y: number) => {
  //   const nx = a * x + c * y + e - 800
  //   const ny = b * x + d * y + f - 0
  //   return { x: nx, y: ny }
  // }

  const getA1A2 = (tangle: number, tdist: number) => {
    const base = 0.02
    const range = 0.13
    let a1 = roundTo2PI(tangle - base
      - range * Math.max(0, Math.min(1, 1 - (tdist - MIN_DIST) / MAX_DIST))
    )
    let a2 = roundTo2PI(tangle + base
      + range * Math.max(0, Math.min(1, 1 - (tdist - MIN_DIST) / MAX_DIST)))

    // swap
    // if (a2 < a1 && !(a1 > 1.5 && a2 < 0.5)) [a2, a1] = [a1, a2]
    if ((a2 < a1 && !(a1 > 1.5 && a2 < 0.5)) || (a1 < .5 && a2 > 1.5)) [a2, a1] = [a1, a2]
    return [a1, a2]
  }


  // draw lines
  const MAX_DIST = 12
  const MIN_DIST = 3.5
  visCtx.save()
  for (const sheild of sheilds) {
    const { cx, cy, dx, dy, tdist } = sheild

    if (tdist >= MAX_DIST || tdist <= MIN_DIST) continue

    const theta = getAngle(cx, cy, dx, dy) / 180
    // console.debug(`cx:${cx}, cy:${cy}, dx:${dx}, dy:${dy}, theta:${theta}`)

    visCtx.beginPath()
    visCtx.lineWidth = 2
    const { x: ox, y: oy } = invertTXY(cx + 40 * Math.cos(theta * Math.PI), cy + 40 * Math.sin(theta * Math.PI))
    const { x, y } = invertTXY(dx - 50 * Math.cos(theta * Math.PI), dy - 50 * Math.sin(theta * Math.PI))

    const grd = visCtx.createLinearGradient(ox, oy, x, y);
    grd.addColorStop(0, `rgba(${COLORS.off_df_link}, 0.1)`);
    grd.addColorStop(0.1, `rgba(${COLORS.off_df_link}, ${0.3 + 0.5 * ((MAX_DIST - tdist) / MAX_DIST)})`);
    grd.addColorStop(0.9, `rgba(${COLORS.off_df_link}, ${0.3 + 0.5 * ((MAX_DIST - tdist) / MAX_DIST)})`);
    grd.addColorStop(1, `rgba(${COLORS.off_df_link}, 0.1)`);

    visCtx.strokeStyle = grd
    visCtx.shadowColor = `rgb(${COLORS.off_df_link})`
    visCtx.shadowBlur = 5
    visCtx.moveTo(ox, oy)
    visCtx.lineTo(x, y)
    visCtx.stroke()
  }
  visCtx.restore()

  const in_r = 100
  for (const sheild of sheilds) {
    let { cx, cy, dx, dy, tdist, smoothDFdiff } = sheild

    // r
    const out_r = in_r + 4 + Math.max(0, smoothDFdiff) * 15
    visCtx.lineWidth = out_r - in_r;

    // 2d angle
    const theta = getAngle(cx, cy, dx, dy) / 180
    const dist = Math.max(0,
      - 30 + in_r * Math.sqrt(1 / (Math.pow(Math.cos(theta * Math.PI) / a, 2) + Math.pow(Math.sin(theta * Math.PI) / d, 2)))
    )

    cx = cx - dist * Math.cos(theta * Math.PI)
    cy = cy - dist * Math.sin(theta * Math.PI)
    const { x: tx, y: ty } = invertTXY(cx, cy)

    // cal start and end angle
    // 3d angle
    let tangle = Math.atan(a * Math.tan(theta * Math.PI) / d) / Math.PI
    // opposite
    if (theta > 0.5 && theta <= 1.5) tangle = (tangle + 1) % 2

    const [a1, a2] = getA1A2(tangle, tdist)
    const [ma1, ma2] = getA1A2(tangle, MIN_DIST)

    // visCtx.beginPath()
    // visCtx.strokeStyle = 'rgba(125, 0, 0, 1)'
    // visCtx.arc(tx, ty, in_r + (out_r - in_r) / 2,0 * Math.PI, 2 * Math.PI);
    // visCtx.stroke()

    // bg first
    visCtx.strokeStyle = COLORS.defense_bg_fill
    // visCtx.shadowColor = `#f5f5f599`
    // visCtx.shadowBlur = 5
    visCtx.beginPath()
    visCtx.arc(tx, ty, in_r + (out_r - in_r) / 2, ma1 * Math.PI, ma2 * Math.PI);
    visCtx.stroke()
    // fill
    visCtx.strokeStyle = COLORS.defense_fg_fill
    visCtx.beginPath()
    visCtx.arc(tx, ty, in_r + (out_r - in_r) / 2, a1 * Math.PI, a2 * Math.PI);
    visCtx.stroke();
  }

  visCtx.restore()
}



function drawVis(visCtx: CanvasRenderingContext2D, circles: VisCircle[], sheilds: VisSheild[], debugCtx?: CanvasRenderingContext2D) {
  drawVisCircles(visCtx, circles)
  drawVisSheilds(visCtx, sheilds, debugCtx)
}


const internalCanvas = document.createElement('canvas')
const internalCtx = internalCanvas.getContext('2d')!
/**
 * Highlight levels:
 * - full brights: all lv1 and lv2 players
 * =========== Focus layer ====== 
 * - glow effect: lv2 interested
 * - spotlight_white: lv1 key players's full bright should be above the focus mask
 * - spotlight_green: lv1 empty players
 */
function drawHL(ctx: CanvasRenderingContext2D, 
  frame: CanvasImageSource, 
  mask: CanvasImageSource,
  players: Player<PlayerID>[],
  lv1Players: Array<Player<PlayerID> & KeyPlayer> = [],
  lv2Players: Array<Player<PlayerID> & Lv2Player> = [],
  ballHolder?: PlayerID | null,
  focus?: { pos: Point }) {
  const { width, height } = ctx.canvas

  const lv2PlayerLooked = lv2Players
    .filter(p => p.id !== ballHolder &&
      p.type.has(Lv2PlayerType.Interest) && p.looked && (p.att ?? 0) > LV_INTEREST_THRESHOLD.off)
  const lv2PlayerNotLooked = lv2Players
    .filter(p => !(lv2PlayerLooked.find(lp => lp.id === p.id)))

  const unImportantPlayers = players.filter(p => !lv2Players.find(lv2 => lv2.id === p.id) && !lv1Players.find(lv1 => lv1.id === p.id))

  // mask get fg
  internalCanvas.width = width
  internalCanvas.height = height
  internalCtx.save()
  internalCtx.drawImage(mask, 0, 0)
  internalCtx.globalCompositeOperation = 'source-in'
  internalCtx.drawImage(frame, 0, 0)
  internalCtx.restore()

  // draw fg with mask
  // ctx.save()
  ctx.drawImage(internalCanvas, 0, 0)
  // ctx.globalCompositeOperation = 'source-atop'
  // ctx.fillStyle = `rgba(0, 0, 0, ${COLORS.FG_MASK_ALPHA})`
  // ctx.fillRect(0, 0, width, height);
  // ctx.restore()

  // focus mask
  if (focus) {
    const { pos } = focus
    ctx.save()
    const grd = ctx.createRadialGradient(pos.x, pos.y, FOCUS.min, pos.x, pos.y, FOCUS.max);
    grd.addColorStop(0, `rgba(0, 0, 0, ${FOCUS.mina})`);
    grd.addColorStop(1, `rgba(0, 0, 0, ${FOCUS.maxa})`);
    ctx.fillStyle = grd;
    ctx.globalCompositeOperation = 'source-atop'
    ctx.fillRect(0, 0, width, height);
    ctx.restore()

    //unimportant players
    ctx.save()
    unImportantPlayers.forEach(p => {
      const { x, y, w, h } = p.bbox
      ctx.drawImage(internalCtx.canvas,
        x, y, w, h,
        x, y, w, h)
    })
    ctx.fillStyle = `rgba(0, 0, 0, ${COLORS.FG_MASK_ALPHA})`
    ctx.globalCompositeOperation = 'source-atop'
    ctx.fillRect(0, 0, width, height);
    ctx.restore()
  }

  // need this for the focus mask
  // basic hilight, full bright
  lv2PlayerNotLooked.forEach(player => {
    const { x, y, w, h } = player.bbox
    ctx.drawImage(internalCtx.canvas,
      x, y, w, h,
      x, y, w, h)
  })

  // only looked, will show glow
  ctx.save()
  ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
  lv2PlayerLooked
    .forEach(player => {
      const { x, y, w, h } = player.bbox
      ctx.shadowBlur = player.on ? 10 : 40 * (player.att ?? 0 - LV_INTEREST_THRESHOLD.off);
      ctx.drawImage(internalCtx.canvas,
        x, y, w, h,
        x, y, w, h)
    })
  ctx.restore()

  // spot light 
  lv1Players
    ?.forEach(player => {
      const { progress: frames } = player.last
      const { x, y, w, h } = player.bbox
      let r1 = player.type === KeyPlayerType.EMPTY_PLAYER
        ? 30
        : player.type === KeyPlayerType.STAR
          ? 30
          : 20

      // full bright image
      ctx.drawImage(internalCtx.canvas,
        x, y, w, h,
        x, y, w, h)

      draw.cone(ctx,
        {
          x: x + w * 0.5,
          y: y + h,
          r: 50 * (frames / 6),
          r1: r1 * (frames / 6),
          h: player.type === KeyPlayerType.EMPTY_PLAYER
            ? 800
            : player.type === KeyPlayerType.STAR
              ? 800
              : 1000
        },
        {
          lineWidth: 1, strokeStyle: "rgba(220, 220, 220, 0.05)",
          fillStyle: player.type === KeyPlayerType.EMPTY_PLAYER
            ? 'rgba(50, 220, 128, 0.1)'
            : player.type === KeyPlayerType.STAR
              ? 'rgba(255,215,120, 0.08)'
              : 'rgba(220, 220, 220, 0.1)',
          lineCap: 'round', lineJoin: 'round'
        }
      )
    })
}

/**
 * For draw star
 */
function rotate2D(vecArr: Array<[number, number]>, byRads: number) {
  const mat = [
    [Math.cos(byRads), -Math.sin(byRads)],
    [Math.sin(byRads), Math.cos(byRads)]
  ];
  const result: Array<[number, number]> = [];
  for (let i = 0; i < vecArr.length; ++i) {
    result[i] = [
      mat[0][0] * vecArr[i][0] + mat[0][1] * vecArr[i][1],
      mat[1][0] * vecArr[i][0] + mat[1][1] * vecArr[i][1]
    ];
  }
  return result;
}

function generateStarTriangles(numPoints: number, r: number) {
  const triangleBase = r * Math.tan(Math.PI / numPoints);
  // console.log("Base: " + triangleBase);
  const triangle: Array<[number, number]> = [
    [0, r],
    [triangleBase / 2, 0],
    [-triangleBase / 2, 0], [0, r]
  ];
  const result = [];
  for (let i = 0; i < numPoints; ++i) {
    result[i] = rotate2D(triangle, i * (2 * Math.PI / numPoints));
  }
  return result;
}

function drawStar(ctx: CanvasRenderingContext2D, r: number, offset: [number, number], flipVert: boolean) {
  const sign = flipVert ? -1 : 1;
  const obj = generateStarTriangles(5, r);

  ctx.save()
  ctx.fillStyle = COLORS.star_star
  for (let objIdx = 0; objIdx < obj.length; ++objIdx) {
    const elem = obj[objIdx];
    ctx.moveTo(elem[0][0] + offset[0], sign * elem[0][1] + offset[1]);
    ctx.beginPath();
    for (let vert = 1; vert < elem.length; ++vert) {
      ctx.lineTo(elem[vert][0] + offset[0], sign * elem[vert][1] + offset[1]);
    }
    ctx.fill();
  }
  ctx.beginPath()
  ctx.arc(offset[0], offset[1], r, 0, 2 * Math.PI)
  ctx.strokeStyle = COLORS.star_star
  ctx.stroke()
  ctx.restore()
}


const shooterIcon = new Image()
shooterIcon.src = `${process.env.PUBLIC_URL}/shooter.png`
const defenderIcon = new Image()
defenderIcon.src = `${process.env.PUBLIC_URL}/defender.png`
const starIcon = new Image()
starIcon.src = `${process.env.PUBLIC_URL}/star.png`
const ICONS = {
  shooter: shooterIcon,
  defender: defenderIcon,
  star: starIcon
}


// shooterIcon.style.filter = `invert(80%) sepia(77%) saturate(366%) hue-rotate(328deg) brightness(102%) contrast(101%);`
function drawIcon(ctx: CanvasRenderingContext2D, iconHeight: number, offset: [number, number], icon: keyof typeof ICONS) {
  if (icon === 'star') {
    //   drawStar(ctx, iconHeight / 2, offset, true)
    drawIcon(ctx, iconHeight, [offset[0] - iconHeight, offset[1]], 'shooter')
    drawIcon(ctx, iconHeight, offset, 'defender')
  } else {
    const iconWidth = iconHeight * ICONS[icon].width / ICONS[icon].height
    internalCanvas.width = iconWidth
    internalCanvas.height = iconHeight
    internalCtx.save()
    internalCtx.drawImage(ICONS[icon],
      0, 0, ICONS[icon].width, ICONS[icon].height,
      0, 0, iconWidth, iconHeight)
    internalCtx.globalCompositeOperation = 'source-in'
    internalCtx.fillStyle = COLORS.star_star
    internalCtx.fillRect(0, 0, iconWidth, iconHeight)
    internalCtx.restore()
    ctx.drawImage(internalCanvas, offset[0] - iconWidth * 0.5, offset[1] - iconHeight * 0.5)
  }
}

function drawName(ctx: CanvasRenderingContext2D, player?: Player<PlayerID>) {
  if (!player) return

  const { id, namePos } = player
  const textheight = 18
  const lastname = PLAYER_META[id].ln

  ctx.save()
  ctx.fillStyle = PLAYER_META[id].star ? COLORS.star_name : COLORS.player_name
  ctx.font = `bold ${textheight}px Arial`;
  ctx.textAlign = "center";
  const textwidth = ctx.measureText(lastname).width
  const x = PLAYER_META[id].star === 'star' ? namePos.x + textheight / 2 : namePos.x
  ctx.fillText(lastname, x, namePos.y)
  ctx.restore()

  if (PLAYER_META[id].star) {
    const starR = Math.floor(textheight / 2) - 1
    const starPadding = 5
    const iconHeight = textheight
    drawIcon(ctx, iconHeight, [
      x - (textwidth + starR) * 0.5 - starPadding,
      namePos.y - textheight / 2 + 2],
      PLAYER_META[id].star as any)
  }
}

export {
  // drawFG as fg,

  drawVisCircles as circles,
  drawVisSheilds as sheilds,
  drawHL as HL,
  drawVis as Vis,
  drawStar as Star,
  drawName as Name,
}