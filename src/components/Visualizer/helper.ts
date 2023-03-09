import { Point } from 'common/@types'

// Return: Close approximation of the length of a Cubic Bezier curve
//
// Ax,Ay,Bx,By,Cx,Cy,Dx,Dy: the 4 control points of the curve
// sampleCount [optional, default=40]: how many intervals to calculate
// Requires: cubicQxy (included below)
//
export function cubicBezierLength(A: Point, B: Point, C: Point, D: Point, sampleCount = 40) {
    var ptCount = sampleCount;
    var totDist = 0;
    var lastX = A.x;
    var lastY = A.y;
    var dx, dy;
    for (var i = 1; i < ptCount; i++) {
        var pt = cubicQxy(i / ptCount, A.x, A.y, B.x, B.y, C.x, C.y, D.x, D.y);
        dx = pt.x - lastX;
        dy = pt.y - lastY;
        totDist += Math.sqrt(dx * dx + dy * dy);
        lastX = pt.x;
        lastY = pt.y;
    }
    dx = D.x - lastX;
    dy = D.y - lastY;
    totDist += Math.sqrt(dx * dx + dy * dy);
    return Math.floor(totDist);
}


// Return: an [x,y] point along a cubic Bezier curve at interval T
//
// Attribution: Stackoverflow's @Blindman67
// Cite: http://stackoverflow.com/questions/36637211/drawing-a-curved-line-in-css-or-canvas-and-moving-circle-along-it/36827074#36827074
// As modified from the above citation
// 
// t: an interval along the curve (0<=t<=1)
// ax,ay,bx,by,cx,cy,dx,dy: control points defining the curve
//
function cubicQxy(t: number, ax: number, ay: number, bx: number, by: number, cx: number, cy: number, dx: number, dy: number) {
    ax += (bx - ax) * t;
    bx += (cx - bx) * t;
    cx += (dx - cx) * t;
    ax += (bx - ax) * t;
    bx += (cx - bx) * t;
    ay += (by - ay) * t;
    by += (cy - by) * t;
    cy += (dy - cy) * t;
    ay += (by - ay) * t;
    by += (cy - by) * t;
    return ({
        x: ax + (bx - ax) * t,
        y: ay + (by - ay) * t
    });
}

export function getGridRect(idx: number, table: { id: number, points: [number, number][] }, player = 0) {
    // only the closer half
    const tableX = table.points[0][0]
    const tableY = table.points[0][1]
    const tableH = table.points[1][1] - table.points[0][1]
    const tableW = table.points[2][0] - table.points[1][0]

    let gridX = 0
    let gridY = 0
    let gridW = 0
    let gridH = 0

    // same x
    if ([1, 4, 7].includes(idx)) {
        gridX = tableX
        gridW = tableW * 0.328
    }

    if ([2, 5, 8].includes(idx)) {
        gridX = tableX + tableW * 0.33
        gridW = tableW * 0.33
    }

    if ([3, 6, 9].includes(idx)) {
        gridX = tableX + tableW * 0.66
        gridW = tableW * (0.295 + player * 0.005)
    }

    // same y
    if ([7, 8, 9].includes(idx)) {
        gridY = tableY + player * 0.5 * tableH
        gridH = tableH * (0.5 - 0.32)
    } else if ([4, 5, 6].includes(idx)) {
        gridY = tableY + (player * 0.5 + 0.18) * tableH
        gridH = tableH * 0.16
    } else if ([1, 2, 3].includes(idx)) {
        gridY = tableY + (player * 0.5 + 0.34) * tableH
        gridH = tableH * 0.16
    }


    return { x: gridX, y: gridY, w: gridW, h: gridH }
}

// cubic bezier percent is 0-1
export function getCubicBezierXYatPercent(startPt: Point, controlPt1: Point,
    controlPt2: Point, endPt: Point, percent: number) {
    const x = CubicN(percent, startPt.x, controlPt1.x, controlPt2.x, endPt.x);
    const y = CubicN(percent, startPt.y, controlPt1.y, controlPt2.y, endPt.y);
    return ({ x: x, y: y });
}

// cubic helper formula at percent distance
function CubicN(pct: number, a: number, b: number, c: number, d: number) {
    var t2 = pct * pct;
    var t3 = t2 * pct;
    return a + (-a * 3 + pct * (3 * a - a * pct)) * pct
        + (3 * b + pct * (-6 * b + b * 3 * pct)) * pct
        + (c * 3 - c * 3 * pct) * t2
        + d * t3;
}