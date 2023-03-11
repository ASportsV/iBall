// import { expose } from 'comlink';
// import { LayerId } from '.';
// import type { VisCircle, VisSheild } from './visualizeData';

// import * as draw from './visualizeData'

// declare const self: DedicatedWorkerGlobalScope;
// export default {} as typeof Worker & { new(): Worker };


// // const colorScale = scaleSequential<string>(interpolateRdBu)
// //     .domain([1, 0])


// export class Renderer {

//     layers: Partial<Record<LayerId, { canvas: OffscreenCanvas, ctx: OffscreenCanvasRenderingContext2D }>> = {}
//     addLayer(name: LayerId, canvas: OffscreenCanvas) {
//         console.log('add layers', name)
//         this.layers[name] = {
//             canvas, ctx: canvas.getContext('2d')!
//         }
//     }

//     // private renderBG(frame: ImageBitmap) {
//     //     if (!this.layers.bg) return
//     //     const { ctx, canvas } = this.layers.bg
//     //     ctx.drawImage(frame, 0, 0)
//     // }

//     drawCircles(visCircles: VisCircle[]) {
//         if (!this.layers['1_vis']) return
//         const { ctx, canvas } = this.layers['1_vis']

//         draw.circles(ctx, visCircles)
//     }
//     drawShileds(visShileds: VisSheild[]) {
//         if (!this.layers['1_vis']) return
//         const { ctx, canvas } = this.layers['1_vis']

//         draw.sheilds(ctx, visShileds)
//     }
//     drawVis(visCircles: VisCircle[], visShileds: VisSheild[]) {
//         if (!this.layers['1_vis']) return
//         const { ctx, canvas } = this.layers['1_vis']
//         draw.circles(ctx, visCircles)
//         draw.sheilds(ctx, visShileds)
//     }

//     // private renderVis(players: Player[]) {
//     //     if (!this.layers.vis) return
//     //     const { ctx, canvas } = this.layers.vis

//     //     for (const data of players!) {

//     //         const tid = data.track_id
//     //         const [x, y, w, h] = data.bbox
//     //         const { left_hip, right_hip, left_ankle, right_ankle, nose } = data.keypoints
//     //         const { id } = data.player

//     //         // const { tx, ty } = data
//     //         // if(id === ) {
//     //         // const shotRate = getShotRate(id, tx, ty)
//     //         // }

//     //         // 1. calculate cx and cy
//     //         const cx = (left_hip.x + right_hip.x) / 2
//     //         const cy = (y + h + Math.max(left_ankle.y, right_ankle.y)) / 2

//     //         // 2. render the vis
//     //         ctx.save()
//     //         const [a, b, c, d, e, f] = [1.75257350e+00, 5.98341402e-02, -8.91780472e-01, 2.49200452e-01, 0, 0]
//     //         ctx.setTransform(a, b, c, d, e, f);
//     //         const transformedPoint = {
//     //             x: a * cx + c * cy + e,
//     //             y: b * cx + d * cy + f,
//     //         };
//     //         const tx = (cx - (c / d) * cy + (c / d) * f - e) / (a - (c / d) * b)
//     //         const ty = (cx - e - a * tx) / c

//     //         const in_r = 10
//     //         const out_r = 25
//     //         ctx.lineWidth = out_r - in_r;
//     //         ctx.strokeStyle = colorScale(1);
//     //         ctx.beginPath()
//     //         ctx.arc(tx, ty, in_r + (out_r - in_r) / 2, 0, 2 * Math.PI);
//     //         ctx.stroke();
//     //         ctx.restore()
//     //     }
//     // }

//     // private renderFG(frame: ImageBitmap, mask: ImageBitmap) {
//     //     if (!this.layers.fg) return
//     //     const { ctx, canvas } = this.layers.fg

//     //     ctx.save()
//     //     ctx.drawImage(mask!, 0, 0)
//     //     ctx.globalCompositeOperation = 'source-in'
//     //     ctx.drawImage(frame, 0, 0)
//     //     ctx.restore()
//     // }


//     // private renderAnnot(players: Player[]) {
//     //     if (!this.layers.annot) return
//     //     const { ctx, canvas } = this.layers.annot
//     //     ctx.fillStyle = '#f5f5f5'
//     //     ctx.font = "18px Arial";
//     //     for (const data of players) {
//     //         const { nose } = data.keypoints
//     //         ctx!.fillText(data.player.lastname, nose.x, nose.y - 20,)
//     //     }
//     // }

//     cleanLayer(layerNames: LayerId[]) {
//         layerNames
//             // .filter(l => this.layers[l] !== undefined)
//             .forEach(layerName => {
//                 if (!this.layers[layerName]) return
//                 const { ctx, canvas } = this.layers[layerName]!
//                 ctx.clearRect(0, 0, canvas.width, canvas.height)
//             })
//     }

//     // renderFrame({ frame, mask, players }: Frame) {
//     //     this.cleanLayer(['bg', 'vis', 'fg', 'annot'])
//     //     // this.renderBG(frame)
//     //     if (mask && players) {
//     //         this.renderVis(players)
//     //         // this.renderFG(frame, mask)
//     //         // this.renderAnnot(players)
//     //     }
//     // }

// }

// expose(Renderer)

export {}