import { Point } from 'common/@types'

interface Style {
  fillStyle?: string | CanvasGradient | CanvasPattern | { pattern: CanvasPattern, opacity: number }
  lineWidth?: number
  strokeStyle?: string
  font?: string
  textBaseline?: CanvasTextBaseline
  lineCap?: CanvasLineCap
  lineJoin?: CanvasLineJoin
}
type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]

// type Style = Partial<Pick<CanvasRenderingContext2D, 'fillStyle' | 'strokeStyle' | 'lineWidth' | 'font' | 'textBaseline'>>

function entries<T extends {}>(obj: T): Entries<T> {
  return Object.entries(obj) as any;
}

function applyStyle(ctx: CanvasRenderingContext2D, style: Style = {}) {
  entries(style).forEach((e) => {
    if (e?.[0] === 'lineWidth' && e[1] !== undefined) {
      ctx.lineWidth = e[1] // value
    }
    if (e?.[0] === 'strokeStyle' && e[1] !== undefined) {
      ctx.strokeStyle = e[1]//value
    }
    if (e?.[0] === 'font' && e[1]) {
      ctx.font = e[1]
    }
    if (e?.[0] === 'textBaseline' && e[1]) {
      ctx.textBaseline = e[1]
    }
    if (e?.[0] === 'lineCap' && e[1]) {
      ctx.lineCap = e[1]
    }
    if (e?.[0] === 'lineJoin' && e[1]) {
      ctx.lineJoin = e[1]
    }
  })

  if (style.fillStyle) {
    const value = style.fillStyle
    if (typeof value === 'object' && 'pattern' in value && 'opacity' in value) {
      ctx.fillStyle = value.pattern
      ctx.globalAlpha = value.opacity;
    } else {
      ctx.fillStyle = value
    }
  }
}

function drawLine(ctx: CanvasRenderingContext2D, sx: number, sy: number, dx: number, dy: number, style: Style = {}) {
  applyStyle(ctx, style)
  ctx.beginPath()
  ctx.moveTo(sx, sy)
  ctx.lineTo(dx, dy)
  ctx.stroke()
}

function drawHLine(ctx: CanvasRenderingContext2D, sx: number, sy: number, dx: number) {
  drawLine(ctx, sx, sy, dx, sy)
}

function drawPolygon(ctx: CanvasRenderingContext2D, points: Point[], style?: Style): void;
function drawPolygon(ctx: CanvasRenderingContext2D, points: [number, number][], style?: Style): void;
function drawPolygon(ctx: CanvasRenderingContext2D, points: [number, number][] | Point[], style: Style = {}): void {

  if (points.length === 0) return
  const pointsToDraw: [number, number][] = Array.isArray(points[0])
    ? points as [number, number][]
    : (points as Point[]).map(p => ([p.x, p.y])) as [number, number][]

  let [x, y] = pointsToDraw[0]

  ctx.save()
  applyStyle(ctx, style)

  ctx.beginPath()
  ctx.moveTo(x, y)
  for (let i = 1, len = pointsToDraw.length; i < len; ++i) {
    ([x, y] = pointsToDraw[i]);
    ctx.lineTo(x, y)
  }
  ctx.closePath();
  ctx.stroke()

  ctx.fill();
  ctx.restore()
}

function triangleAt(ctx: CanvasRenderingContext2D, from: Point, center: Point, r: number, style: Style = {}) {
  ctx.save()
  applyStyle(ctx, style)

  // draw arrow
  let x_center = center.x;
  let y_center = center.y;

  let angle, x, y
  ctx.beginPath();

  angle = Math.atan2(center.y - from.y, center.x - from.x)
  x_center -= r * Math.cos(angle);
  y_center -= r * Math.sin(angle);
  x = r * Math.cos(angle) + x_center
  y = r * Math.sin(angle) + y_center
  ctx.moveTo(x, y);

  angle += (1 / 3) * (2 * Math.PI)
  x = r * Math.cos(angle) + x_center
  y = r * Math.sin(angle) + y_center
  ctx.lineTo(x, y);

  angle += (1 / 3) * (2 * Math.PI)
  x = r * Math.cos(angle) + x_center
  y = r * Math.sin(angle) + y_center
  ctx.lineTo(x, y);

  ctx.closePath();


  ctx.fill();
  ctx.restore()
}

interface ArrowParams {
  from: Point
  to: Point
  arrowSize: number
  z?: boolean
  double?: boolean
}
function drawArrow(ctx: CanvasRenderingContext2D, { from, to, arrowSize, z = false, double = false }: ArrowParams, style: Style = {}) {
  // draw line
  ctx.save()
  applyStyle(ctx, style)

  if (z) {
    ctx.transform(1, 0, -0.2, .8, from.x, from.y);
  }
  const nFrom = z ? { x: 0, y: 0 } : from
  const nTo = z ? { x: to.x - from.x, y: to.y - from.y } : to

  if (double) {
    triangleAt(ctx, nTo, nFrom, arrowSize, style)
  }

  ctx.beginPath();
  const angle = Math.atan2(nTo.y - nFrom.y, nTo.x - nFrom.x)
  ctx.moveTo(nFrom.x + arrowSize * Math.cos(angle), nFrom.y + arrowSize * Math.sin(angle));
  ctx.lineTo(nTo.x - arrowSize * Math.cos(angle), nTo.y - arrowSize * Math.sin(angle));
  ctx.stroke();
  ctx.fill();

  triangleAt(ctx, nFrom, nTo, arrowSize, style)
  ctx.restore()
}

interface CircleParams {
  x: number, y: number, r: number, startAngle?: number, angle?: number, z?: boolean
}
function drawCircle(ctx: CanvasRenderingContext2D, { x, y, r, startAngle = 0, angle = 2 * Math.PI, z = false }: CircleParams, style: Style = {}) {
  // draw line
  ctx.save()
  applyStyle(ctx, style)

  if (z) {
    ctx.transform(1, 0, -0.2, .5, x, y);
  }
  x = z ? 0 : x
  y = z ? 0 : y

  ctx.beginPath();
  ctx.arc(x, y, r, startAngle, angle)
  ctx.lineTo(x, y)

  ctx.stroke()
  ctx.fill();

  ctx.restore()
}

interface RoundedRectParams {
  x: number
  y: number
  w: number
  h: number
  r: number
  z?: boolean
}
function drawRoundedRect(ctx: CanvasRenderingContext2D, { x, y, w, h, r, z = false }: RoundedRectParams, style: Style = {}) {
  ctx.save()
  applyStyle(ctx, style)

  if (z) {
    ctx.transform(1, 0, -0.1, .9, x, y);
  }
  x = z ? 0 : x
  y = z ? 0 : y

  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();

  ctx.stroke()
  ctx.fill();

  ctx.restore()
}



interface TextParams {
  x: number,
  y: number,
  text: string
  z?: boolean
}
function drawText(ctx: CanvasRenderingContext2D, { x, y, text, z = false }: TextParams, style: Style = {}) {
  ctx.save()
  applyStyle(ctx, style)

  if (z) {
    ctx.transform(1, 0, -0.1, .9, x, y);
  }
  x = z ? 0 : x
  y = z ? 0 : y

  ctx.strokeText(text, x, y)
  ctx.fillText(text, x, y)
  ctx.restore()
}

interface ConeParams {
  x: number
  y: number
  r: number
  h: number
  r1?: number
}
type Point3D = [number, number, number]
function drawCone(ctx: CanvasRenderingContext2D, { x, y, r, h, r1 = 0 }: ConeParams, style: Style = {}) {
  ctx.save()
  applyStyle(ctx, style)
  // ctx.globalCompositeOperation = 'soft-light'
  const dAlpha = 0.1;

  const nodes: Point3D[] = [
    // [0, -h, 0]
  ];
  const uNodes: Point3D[] = []

  const faces: [Point3D, Point3D, Point3D, Point3D][] = [];
  //creating nodes
  let alpha = 0;
  // let i = 1;
  for (let i = 0; alpha <= 2 * Math.PI + dAlpha; ++i) {
    // while () {
    let x = r * Math.cos(alpha);
    let z = r * Math.sin(alpha);
    nodes[i] = [x, 0, z];
    alpha += dAlpha;

    x = r1 * Math.cos(alpha);
    z = r1 * Math.sin(alpha);
    uNodes[i] = [x, -(1 - r1 / r) * h, z];
  }

  //creating faces
  let p = 0;
  for (let n = 0; n < nodes.length - 1; n++) {
    let face: [Point3D, Point3D, Point3D, Point3D] = [uNodes[p], nodes[p], nodes[p + 1], uNodes[p + 1]];
    faces[n] = face;
    p += 1;
  }

  // Rotate shape around the x-axis
  function rotateX3D(theta: number) {
    const sinTheta = Math.sin(-theta);
    const cosTheta = Math.cos(-theta);

    for (let n = 0; n < nodes.length; n++) {
      let node = nodes[n];
      let y = node[1];
      let z = node[2];
      node[1] = y * cosTheta - z * sinTheta;
      node[2] = z * cosTheta + y * sinTheta;

      node = uNodes[n];
      y = node[1];
      z = node[2];
      node[1] = y * cosTheta - z * sinTheta;
      node[2] = z * cosTheta + y * sinTheta;
    }
  }

  //rotateZ3D(10 * Math.PI / 180);
  rotateX3D((20 * Math.PI) / 180);

  ctx.translate(x, y);

  // Draw faces
  for (let i = 0; i < faces.length; i++) {
    const [v0, v1, v2, v3] = faces[i]
    ctx.beginPath();
    ctx.moveTo(v0[0], v0[1]);
    ctx.lineTo(v1[0], v1[1]);
    ctx.lineTo(v2[0], v2[1]);
    ctx.lineTo(v3[0], v3[1]);
    ctx.lineTo(v0[0], v0[1]);
    ctx.fill();
    // ctx.stroke();
    ctx.closePath();
  }

  ctx.restore()
}

interface LabelParams {
  x: number,
  y: number,
  w: number, h: number,
  text: string
}
function drawLabel(ctx: CanvasRenderingContext2D, { x, y, w, h, text }: LabelParams, style: Style = {}) {
  ctx.save()
  applyStyle(ctx, style)

  ctx.beginPath()
  ctx.moveTo(x, y);
  ctx.lineTo(x + 100, y - 50)
  ctx.stroke()

  ctx.rect(x+100, y-50, w, h)
  ctx.stroke()
  ctx.fillStyle = '#fff'
  ctx.fill()
  applyStyle(ctx, style)

  // ctx.strokeText(text, x + 110, y - 50)
  ctx.fillText(text, x + 105, y - 50 + 5)
  ctx.restore()
}


export {
  drawLine as line,
  drawHLine as hLine,
  drawPolygon as polygon,
  drawArrow as arrow,
  drawCircle as circle,
  drawRoundedRect as roundedRect,
  drawText as text,
  drawCone as cone,
  drawLabel as label,
}