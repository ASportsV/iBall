import { useEffect, useRef } from "react";

import { axisBottom, axisLeft } from "d3-axis";
import { ScaleBand, scaleBand, ScaleLinear, scaleLinear } from "d3-scale";
import { select } from 'd3-selection'
import { line, curveMonotoneX } from 'd3-shape'

import { extent } from "common/@utils";
interface AxisBottomProps {
  scale: ScaleBand<string> | ScaleLinear<number, number>;
  transform: string;
}

export function AxisBottom({ scale, transform }: AxisBottomProps) {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    if (ref.current) {
      select(ref.current).call(axisBottom(scale as any));
    }
  }, [scale]);

  return <g ref={ref} transform={transform} />;
}

export interface AxisLeftProps {
  scale: ScaleLinear<number, number, never>;
}

function AxisLeft({ scale }: AxisLeftProps) {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    if (ref.current) {
      select(ref.current).call(axisLeft(scale));
    }
  }, [scale]);

  return <g ref={ref} />;
}

interface ChartProps {
  width?: number
  height?: number
}

interface BarChartProps extends ChartProps {
  fixY?: boolean
  maxY?: number
  data: Array<{ id: string, value: number, fill: string }>
}

export function BarChart({ fixY: normalizeY = false, maxY = 1, data = [], width: w = 400, height: h = 200 }: BarChartProps) {

  const margin = { top: 10, right: 10, bottom: 20, left: 50 };
  const width = w - margin.left - margin.right;
  const height = h - margin.top - margin.bottom;

  const scaleX = scaleBand()
    .domain(new Set(data.map(d => d.id)))
    .range([0, width]);

  const scaleY = scaleLinear()
    .domain([0, normalizeY ? maxY : Math.max(...data.map(d => d.value))])
    .range([height, 0]);
  return <svg
    width={width + margin.left + margin.right}
    height={height + margin.top + margin.bottom}
  >
    <g transform={`translate(${margin.left}, ${margin.top})`}>
      <AxisBottom scale={scaleX} transform={`translate(0, ${height})`} />
      <AxisLeft scale={scaleY} />

      {data
        .map(({ id, value, fill }, idx) => (
          <rect
            key={`${id}_${idx}`}
            x={scaleX(id)}
            y={scaleY(value)}
            width={scaleX.bandwidth()}
            height={height - scaleY(value)}
            fill={fill}
          // fill={value.on ? "teal" : "lightpink"}
          />
        ))}

    </g>
  </svg>
}


interface LineChartProps extends ChartProps {
  data: Array<{ fIdx: number, videoIdx: number, value: number }>
}

export function LineChart({ data, width: w = 400, height: h = 200 }: LineChartProps) {

  const margin = { top: 10, right: 10, bottom: 20, left: 50 };
  const width = w - margin.left - margin.right;
  const height = h - margin.top - margin.bottom;

  const [minFIdx, maxFIdx] = extent(data.map(d => d.fIdx))

  const videos = Object.entries(data.reduce((o, d) => {
    if (!(d.videoIdx in o)) o[d.videoIdx] = []
    o[d.videoIdx].push(d.fIdx)
    return o
  }, {} as Record<number, number[]>))
    .sort((a, b) => +a[0] - +b[0])
    .map(([_, fIdxs]) => {
      const [minIdx, maxIdx] = extent(fIdxs)
      return { x: minIdx, w: maxIdx - minIdx }
    })

  // merge data points
  const points = Object.values(
    data.reduce((o, d) => {
      const key = `${d.fIdx}_${d.value}`
      if(!(key in o)) o[key] = d
      return o
    }, {} as Record<string, any>)
  )

  const scaleX = scaleLinear()
    .domain([minFIdx, maxFIdx])
    .range([0, width]);

  const scaleY = scaleLinear()
    .domain([0, 0.6])
    .range([height, 0]);

  const lineGenerator = line<{ fIdx: number, value: number }>()
    .x(d => scaleX(d.fIdx))
    .y(d => scaleY(d.value))
    .curve(curveMonotoneX);

  return <svg
    width={width + margin.left + margin.right}
    height={height + margin.top + margin.bottom}
  >
    <g transform={`translate(${margin.left}, ${margin.top})`}>
      <AxisBottom scale={scaleX} transform={`translate(0, ${height})`} />
      <AxisLeft scale={scaleY} />

      {videos.map(({ x, w }, idx) => <rect
        key={`${idx}`}
        x={scaleX(x)}
        y={scaleY(0.6)}
        width={scaleX(w)}
        height={height - scaleY(0.6)}
        fill={'rgba(30, 30, 30, 0.1)'}
      />
      )}

      <path
        stroke="black"
        strokeWidth={2}
        fill="none"
        d={lineGenerator(points) ?? ''}
      >
      </path>
    </g>
  </svg>
}