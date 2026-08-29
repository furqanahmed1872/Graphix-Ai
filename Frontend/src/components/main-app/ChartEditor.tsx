"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAppStore } from "@/store/appStore";
import { apiSaveChart, apiUpdateChart } from "@/lib/api";

declare global {
  interface Window {
    Plotly: any;
  }
}

interface PlotlyHTMLElement extends HTMLDivElement {
  data?: any[];
  layout?: any;
}

interface ChartEditorProps {
  message: any;
  divRef: React.RefObject<PlotlyHTMLElement | null>;
  onClose: () => void;
  existingChartId?: string;
}

type ChartTypeId =
  // Line & Scatter
  | "line"
  | "scatter"
  | "line-scatter"
  | "named-lines"
  | "line-dash"
  | "line-shape"
  | "connect-gaps"
  | "annotated-lines"
  | "styled-line"
  | "colored-scatter"
  | "data-labels-hover"
  | "line-data-labels"
  | "scatter-color"
  | "grouped-scatter"
  // Bar
  | "bar"
  | "hbar"
  | "stacked"
  | "stacked100"
  | "grouped"
  | "bar-hover"
  | "bar-direct-labels"
  | "grouped-direct-labels"
  | "bar-rotated"
  | "bar-colors"
  | "bar-styled"
  | "bar-relative"
  // Pie & Donut
  | "pie"
  | "donut"
  | "pie-pull"
  | "pie-styled"
  // Sunburst / Treemap / Icicle
  | "sunburst"
  | "sunburst-multi"
  | "treemap"
  | "treemap-nested"
  | "treemap-color"
  | "icicle"
  | "icicle-multi"
  // Bubble
  | "bubble"
  | "bubble-size"
  | "bubble-size-color"
  | "bubble-hover"
  | "bubble-scaling"
  | "marker-array"
  // Statistical
  | "box"
  | "box-data"
  | "hbox"
  | "grouped-box"
  | "box-outliers"
  | "box-styled"
  | "rainbow-box"
  | "violin"
  | "violin-box"
  | "violin-split"
  | "violin-grouped"
  | "error-bars"
  | "bar-error"
  | "horizontal-error"
  | "asymmetric-error"
  | "strip-chart"
  | "ecdf"
  // Histogram
  | "histogram"
  | "overlaid-histogram"
  | "stacked-histogram"
  | "styled-histogram"
  | "cumulative-histogram"
  | "normalized-histogram"
  | "2d-histogram-contour"
  | "2d-histogram-slider"
  | "probability-histogram"
  // Heatmap & Contour
  | "heatmap"
  | "heatmap-categorical"
  | "heatmap-annotated"
  | "contour-simple"
  | "contour-basic"
  | "contour-lines"
  | "contour-labels"
  | "carpet"
  | "contour-carpet"
  | "carpet-scatter"
  // Filled & Area
  | "area"
  | "area-stacked"
  | "filled-lines"
  | "continuous-error-filled"
  | "asymmetric-offset"
  | "continuous-error"
  // 3D
  | "scatter3d"
  | "ribbon3d"
  | "surface3d"
  | "surface3d-multi"
  | "mesh3d"
  | "line3d"
  | "line3d-plot"
  | "line3d-markers"
  | "line3d-spiral"
  | "random-walk3d"
  | "cone3d"
  | "streamtube3d"
  | "isosurface3d"
  | "volume3d"
  // Maps
  | "choropleth"
  | "choropleth-tile"
  | "world-map"
  | "us-map"
  | "scatter-geo"
  | "line-geo"
  | "bubble-map"
  | "scatter-mapbox"
  | "density-mapbox"
  // Financial
  | "candlestick"
  | "candlestick-no-slider"
  | "candlestick-annotated"
  | "ohlc"
  | "ohlc-no-slider"
  | "waterfall"
  | "waterfall-multi"
  | "funnel"
  | "funnel-stacked"
  | "funnel-area"
  | "time-series"
  | "time-series-slider"
  // Polar & Radar
  | "polar-scatter"
  | "polar-line"
  | "polar-bar"
  | "radar"
  | "radar-multi"
  // Scientific
  | "ternary"
  | "soil-ternary"
  | "log-plots"
  | "log-axes"
  | "splom"
  // Parallel & Sankey
  | "parallel-basic"
  | "parallel-coords"
  | "parallel-advanced"
  | "parallel-categories"
  | "sankey"
  | "sankey-multi"
  | "sankey-styled"
  // Indicator & Table
  | "indicator"
  | "indicator-angular"
  | "indicator-bullet"
  | "indicator-delta"
  | "indicator-number-delta"
  | "table"
  | "table-styled"
  | "table-formatted";

interface ChartTypeDef {
  id: ChartTypeId;
  label: string;
  plotlyType: string;
  group: string;
  category: string;
  icon: React.ReactNode;
  barmode?: string;
  orientation?: string;
  mode?: string;
  fill?: string;
  hole?: number;
  bubble?: boolean;
  mode3d?: string;
}

// ─── Icons ─────────────────────────────────────────────────────────────────

const I = {
  line: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <polyline
        points="2,24 7,15 12,18 18,9 23,13 26,5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  bar: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <rect
        x="2"
        y="14"
        width="6"
        height="12"
        rx="1.5"
        fill="currentColor"
        opacity=".4"
      />
      <rect
        x="11"
        y="8"
        width="6"
        height="18"
        rx="1.5"
        fill="currentColor"
        opacity=".7"
      />
      <rect x="20" y="3" width="6" height="23" rx="1.5" fill="currentColor" />
    </svg>
  ),
  hbar: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <rect
        x="2"
        y="3"
        width="12"
        height="6"
        rx="1.5"
        fill="currentColor"
        opacity=".4"
      />
      <rect
        x="2"
        y="11"
        width="19"
        height="6"
        rx="1.5"
        fill="currentColor"
        opacity=".7"
      />
      <rect x="2" y="19" width="24" height="6" rx="1.5" fill="currentColor" />
    </svg>
  ),
  scatter: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <circle cx="5" cy="22" r="2.5" fill="currentColor" />
      <circle cx="11" cy="14" r="2.5" fill="currentColor" opacity=".8" />
      <circle cx="17" cy="18" r="2.5" fill="currentColor" opacity=".6" />
      <circle cx="22" cy="8" r="2.5" fill="currentColor" />
    </svg>
  ),
  area: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <path
        d="M2 24 L7 15 L12 18 L18 9 L23 13 L26 5 L26 26 L2 26 Z"
        fill="currentColor"
        opacity=".25"
      />
      <polyline
        points="2,24 7,15 12,18 18,9 23,13 26,5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  pie: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <path d="M14 14 L14 2 A12 12 0 0 1 26 14 Z" fill="currentColor" />
      <path
        d="M14 14 L26 14 A12 12 0 0 1 7 24 Z"
        fill="currentColor"
        opacity=".6"
      />
      <path
        d="M14 14 L7 24 A12 12 0 0 1 14 2 Z"
        fill="currentColor"
        opacity=".3"
      />
    </svg>
  ),
  donut: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <path d="M14 14 L14 3 A11 11 0 0 1 25 14 Z" fill="currentColor" />
      <path
        d="M14 14 L25 14 A11 11 0 0 1 6 22 Z"
        fill="currentColor"
        opacity=".6"
      />
      <path
        d="M14 14 L6 22 A11 11 0 0 1 14 3 Z"
        fill="currentColor"
        opacity=".3"
      />
      <circle cx="14" cy="14" r="5" fill="white" />
    </svg>
  ),
  sunburst: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <circle cx="14" cy="14" r="4" fill="currentColor" opacity=".9" />
      <circle
        cx="14"
        cy="14"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray="10 6"
        opacity=".6"
      />
      <circle
        cx="14"
        cy="14"
        r="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="7 5"
        opacity=".35"
      />
    </svg>
  ),
  treemap: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <rect
        x="2"
        y="2"
        width="14"
        height="14"
        rx="1"
        fill="currentColor"
        opacity=".8"
      />
      <rect
        x="18"
        y="2"
        width="8"
        height="6"
        rx="1"
        fill="currentColor"
        opacity=".5"
      />
      <rect
        x="18"
        y="10"
        width="8"
        height="6"
        rx="1"
        fill="currentColor"
        opacity=".35"
      />
      <rect
        x="2"
        y="18"
        width="8"
        height="8"
        rx="1"
        fill="currentColor"
        opacity=".5"
      />
      <rect
        x="12"
        y="18"
        width="14"
        height="8"
        rx="1"
        fill="currentColor"
        opacity=".3"
      />
    </svg>
  ),
  bubble: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <circle cx="7" cy="20" r="5" fill="currentColor" opacity=".45" />
      <circle cx="20" cy="11" r="7" fill="currentColor" opacity=".3" />
      <circle cx="12" cy="17" r="3" fill="currentColor" opacity=".75" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <line
        x1="7"
        y1="3"
        x2="7"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect
        x="3"
        y="8"
        width="8"
        height="12"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
      <line
        x1="3"
        y1="14"
        x2="11"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <line
        x1="7"
        y1="20"
        x2="7"
        y2="25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  violin: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <path
        d="M9 3 Q14 7 14 14 Q14 21 9 25 L19 25 Q14 21 14 14 Q14 7 19 3 Z"
        fill="currentColor"
        opacity=".55"
      />
    </svg>
  ),
  histogram: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <rect
        x="1"
        y="18"
        width="4"
        height="8"
        rx="1"
        fill="currentColor"
        opacity=".3"
      />
      <rect
        x="6"
        y="12"
        width="4"
        height="14"
        rx="1"
        fill="currentColor"
        opacity=".55"
      />
      <rect x="11" y="5" width="5" height="21" rx="1" fill="currentColor" />
      <rect
        x="17"
        y="9"
        width="4"
        height="17"
        rx="1"
        fill="currentColor"
        opacity=".55"
      />
      <rect
        x="22"
        y="14"
        width="5"
        height="12"
        rx="1"
        fill="currentColor"
        opacity=".3"
      />
    </svg>
  ),
  heatmap: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <rect
        x="2"
        y="2"
        width="7"
        height="7"
        rx="1"
        fill="currentColor"
        opacity=".12"
      />
      <rect
        x="11"
        y="2"
        width="7"
        height="7"
        rx="1"
        fill="currentColor"
        opacity=".5"
      />
      <rect
        x="20"
        y="2"
        width="7"
        height="7"
        rx="1"
        fill="currentColor"
        opacity=".9"
      />
      <rect
        x="2"
        y="11"
        width="7"
        height="7"
        rx="1"
        fill="currentColor"
        opacity=".55"
      />
      <rect x="11" y="11" width="7" height="7" rx="1" fill="currentColor" />
      <rect
        x="20"
        y="11"
        width="7"
        height="7"
        rx="1"
        fill="currentColor"
        opacity=".3"
      />
    </svg>
  ),
  contour: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <ellipse
        cx="14"
        cy="14"
        rx="11"
        ry="5"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
      <ellipse
        cx="14"
        cy="14"
        rx="7"
        ry="3"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity=".6"
      />
      <circle cx="14" cy="14" r="2" fill="currentColor" opacity=".8" />
    </svg>
  ),
  waterfall: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <rect x="1" y="15" width="6" height="11" rx="1" fill="currentColor" />
      <rect
        x="8"
        y="9"
        width="5"
        height="6"
        rx="1"
        fill="currentColor"
        opacity=".5"
      />
      <rect
        x="14"
        y="12"
        width="5"
        height="9"
        rx="1"
        fill="#f87171"
        opacity=".75"
      />
      <rect
        x="20"
        y="5"
        width="7"
        height="7"
        rx="1"
        fill="currentColor"
        opacity=".8"
      />
    </svg>
  ),
  funnel: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <rect x="1" y="2" width="26" height="5" rx="1.5" fill="currentColor" />
      <rect
        x="4"
        y="9"
        width="20"
        height="5"
        rx="1.5"
        fill="currentColor"
        opacity=".75"
      />
      <rect
        x="8"
        y="16"
        width="12"
        height="5"
        rx="1.5"
        fill="currentColor"
        opacity=".5"
      />
      <rect
        x="11"
        y="23"
        width="6"
        height="4"
        rx="1.5"
        fill="currentColor"
        opacity=".3"
      />
    </svg>
  ),
  candlestick: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <line
        x1="5"
        y1="3"
        x2="5"
        y2="25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect x="3" y="8" width="4" height="10" rx="1" fill="currentColor" />
      <line
        x1="14"
        y1="5"
        x2="14"
        y2="23"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect x="12" y="10" width="4" height="8" rx="1" fill="#f87171" />
      <line
        x1="23"
        y1="4"
        x2="23"
        y2="24"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect x="21" y="7" width="4" height="11" rx="1" fill="currentColor" />
    </svg>
  ),
  scatter3d: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <path
        d="M14 3 L4 9 L4 21 L14 27 L24 21 L24 9 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity=".4"
      />
      <circle cx="8" cy="12" r="2.5" fill="currentColor" />
      <circle cx="19" cy="9" r="2" fill="currentColor" opacity=".7" />
      <circle cx="14" cy="19" r="3" fill="currentColor" opacity=".85" />
    </svg>
  ),
  surface3d: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <path
        d="M3 20 Q7 10 14 12 Q21 14 25 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M3 24 Q7 16 14 17 Q21 18 25 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity=".55"
      />
    </svg>
  ),
  map: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <polygon
        points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2 1,6"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        opacity=".7"
      />
      <line
        x1="8"
        y1="2"
        x2="8"
        y2="18"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity=".5"
      />
      <line
        x1="16"
        y1="6"
        x2="16"
        y2="22"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity=".5"
      />
    </svg>
  ),
  polar: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <circle
        cx="14"
        cy="14"
        r="11"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity=".3"
        fill="none"
      />
      <circle
        cx="14"
        cy="14"
        r="7"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity=".4"
        fill="none"
      />
      <polygon points="14,4 20,18 8,18" fill="currentColor" opacity=".6" />
    </svg>
  ),
  radar: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <polygon
        points="14,3 24,10 21,22 7,22 4,10"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        opacity=".2"
      />
      <polygon
        points="14,8 20,13 18,20 10,20 8,13"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="currentColor"
        opacity=".4"
      />
    </svg>
  ),
  sankey: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <line
        x1="3"
        y1="4"
        x2="3"
        y2="24"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="25"
        y1="7"
        x2="25"
        y2="17"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M3 8 Q14 8 25 10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity=".7"
      />
      <path
        d="M3 16 Q14 16 25 14"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity=".5"
      />
    </svg>
  ),
  parallel: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <line
        x1="5"
        y1="3"
        x2="5"
        y2="25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="14"
        y1="3"
        x2="14"
        y2="25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="23"
        y1="3"
        x2="23"
        y2="25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M5 8 Q14 6 23 12"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity=".7"
      />
      <path
        d="M5 18 Q14 14 23 20"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity=".5"
      />
    </svg>
  ),
  indicator: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <path
        d="M4 20 A10 10 0 0 1 24 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity=".35"
      />
      <path
        d="M4 20 A10 10 0 0 1 17 11"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="14" cy="20" r="2" fill="currentColor" />
      <line
        x1="14"
        y1="20"
        x2="18"
        y2="11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  table: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <rect
        x="2"
        y="4"
        width="24"
        height="5"
        rx="1"
        fill="currentColor"
        opacity=".8"
      />
      <rect
        x="2"
        y="11"
        width="24"
        height="4"
        rx="1"
        fill="currentColor"
        opacity=".3"
      />
      <rect
        x="2"
        y="17"
        width="24"
        height="4"
        rx="1"
        fill="currentColor"
        opacity=".2"
      />
      <line
        x1="10"
        y1="4"
        x2="10"
        y2="21"
        stroke="currentColor"
        strokeWidth="1"
        opacity=".4"
      />
      <line
        x1="18"
        y1="4"
        x2="18"
        y2="21"
        stroke="currentColor"
        strokeWidth="1"
        opacity=".4"
      />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <line
        x1="7"
        y1="4"
        x2="7"
        y2="24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="4"
        y1="4"
        x2="10"
        y2="4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="4"
        y1="24"
        x2="10"
        y2="24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="7" cy="14" r="3" fill="currentColor" />
    </svg>
  ),
  ternary: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <polygon
        points="14,2 26,24 2,24"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="currentColor"
        opacity=".1"
      />
      <circle cx="14" cy="15" r="2" fill="currentColor" />
      <circle cx="8" cy="20" r="1.5" fill="currentColor" opacity=".6" />
      <circle cx="20" cy="20" r="1.5" fill="currentColor" opacity=".6" />
    </svg>
  ),
  timeseries: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <polyline
        points="2,20 6,15 10,17 14,12 18,14 22,8 26,10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="2"
        y1="24"
        x2="26"
        y2="24"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity=".4"
      />
    </svg>
  ),
  stacked: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <rect x="2" y="18" width="6" height="8" rx="1" fill="currentColor" />
      <rect
        x="2"
        y="11"
        width="6"
        height="6"
        rx="1"
        fill="currentColor"
        opacity=".55"
      />
      <rect x="11" y="13" width="6" height="13" rx="1" fill="currentColor" />
      <rect
        x="11"
        y="6"
        width="6"
        height="6"
        rx="1"
        fill="currentColor"
        opacity=".55"
      />
      <rect x="20" y="9" width="6" height="17" rx="1" fill="currentColor" />
      <rect
        x="20"
        y="3"
        width="6"
        height="5"
        rx="1"
        fill="currentColor"
        opacity=".55"
      />
    </svg>
  ),
  cone: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <path d="M14 4 L24 22 L4 22 Z" fill="currentColor" opacity=".5" />
      <ellipse
        cx="14"
        cy="22"
        rx="10"
        ry="3"
        fill="currentColor"
        opacity=".3"
      />
      <line
        x1="14"
        y1="4"
        x2="20"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity=".7"
      />
    </svg>
  ),
  splom: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <rect
        x="2"
        y="2"
        width="11"
        height="11"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        opacity=".5"
      />
      <rect
        x="15"
        y="2"
        width="11"
        height="11"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        opacity=".5"
      />
      <rect
        x="2"
        y="15"
        width="11"
        height="11"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        opacity=".5"
      />
      <rect
        x="15"
        y="15"
        width="11"
        height="11"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        opacity=".5"
      />
      <circle cx="6" cy="8" r="1.5" fill="currentColor" opacity=".7" />
      <circle cx="10" cy="5" r="1.5" fill="currentColor" opacity=".7" />
      <circle cx="19" cy="7" r="1.5" fill="currentColor" opacity=".7" />
      <circle cx="22" cy="4" r="1.5" fill="currentColor" opacity=".7" />
    </svg>
  ),
  strip: (
    <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
      <line
        x1="8"
        y1="4"
        x2="8"
        y2="24"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity=".3"
      />
      <line
        x1="20"
        y1="4"
        x2="20"
        y2="24"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity=".3"
      />
      <circle cx="8" cy="6" r="1.5" fill="currentColor" />
      <circle cx="7" cy="10" r="1.5" fill="currentColor" />
      <circle cx="9" cy="15" r="1.5" fill="currentColor" />
      <circle cx="8" cy="20" r="1.5" fill="currentColor" />
      <circle cx="20" cy="8" r="1.5" fill="currentColor" />
      <circle cx="19" cy="13" r="1.5" fill="currentColor" />
      <circle cx="21" cy="18" r="1.5" fill="currentColor" />
    </svg>
  ),
};

// ─── Chart Type Definitions ────────────────────────────────────────────────

const CHART_TYPES: ChartTypeDef[] = [
  // Line & Scatter
  {
    id: "line",
    label: "Line",
    plotlyType: "scatter",
    mode: "lines",
    group: "line-scatter",
    category: "Line & Scatter",
    icon: I.line,
  },
  {
    id: "scatter",
    label: "Scatter",
    plotlyType: "scatter",
    mode: "markers",
    group: "line-scatter",
    category: "Line & Scatter",
    icon: I.scatter,
  },
  {
    id: "line-scatter",
    label: "Line & Scatter",
    plotlyType: "scatter",
    mode: "lines+markers",
    group: "line-scatter",
    category: "Line & Scatter",
    icon: I.line,
  },
  {
    id: "data-labels-hover",
    label: "Data Labels Hover",
    plotlyType: "scatter",
    mode: "lines+markers",
    group: "line-scatter",
    category: "Line & Scatter",
    icon: I.scatter,
  },
  {
    id: "line-data-labels",
    label: "Line Data Labels",
    plotlyType: "scatter",
    mode: "lines+text",
    group: "line-scatter",
    category: "Line & Scatter",
    icon: I.line,
  },
  {
    id: "scatter-color",
    label: "Scatter + Color Dim",
    plotlyType: "scatter",
    mode: "markers",
    group: "line-scatter",
    category: "Line & Scatter",
    icon: I.scatter,
  },
  {
    id: "grouped-scatter",
    label: "Grouped Scatter",
    plotlyType: "scatter",
    mode: "markers",
    group: "line-scatter",
    category: "Line & Scatter",
    icon: I.scatter,
  },
  {
    id: "named-lines",
    label: "Named Lines",
    plotlyType: "scatter",
    mode: "lines+markers",
    group: "line-scatter",
    category: "Line & Scatter",
    icon: I.line,
  },
  {
    id: "styled-line",
    label: "Styled Line",
    plotlyType: "scatter",
    mode: "lines",
    group: "line-scatter",
    category: "Line & Scatter",
    icon: I.line,
  },
  {
    id: "colored-scatter",
    label: "Colored Scatter",
    plotlyType: "scatter",
    mode: "markers",
    group: "line-scatter",
    category: "Line & Scatter",
    icon: I.scatter,
  },
  {
    id: "line-shape",
    label: "Line Shape Interp.",
    plotlyType: "scatter",
    mode: "lines",
    group: "line-scatter",
    category: "Line & Scatter",
    icon: I.line,
  },
  {
    id: "line-dash",
    label: "Line Dash",
    plotlyType: "scatter",
    mode: "lines",
    group: "line-scatter",
    category: "Line & Scatter",
    icon: I.line,
  },
  {
    id: "connect-gaps",
    label: "Connect Gaps",
    plotlyType: "scatter",
    mode: "lines",
    group: "line-scatter",
    category: "Line & Scatter",
    icon: I.line,
  },
  {
    id: "annotated-lines",
    label: "Annotated Lines",
    plotlyType: "scatter",
    mode: "lines",
    group: "line-scatter",
    category: "Line & Scatter",
    icon: I.line,
  },
  // Bar
  {
    id: "bar",
    label: "Column",
    plotlyType: "bar",
    orientation: "v",
    group: "bar",
    category: "Bar Charts",
    icon: I.bar,
  },
  {
    id: "hbar",
    label: "Horizontal Bar",
    plotlyType: "bar",
    orientation: "h",
    group: "bar",
    category: "Bar Charts",
    icon: I.hbar,
  },
  {
    id: "grouped",
    label: "Grouped Bar",
    plotlyType: "bar",
    barmode: "group",
    group: "bar",
    category: "Bar Charts",
    icon: I.bar,
  },
  {
    id: "stacked",
    label: "Stacked Bar",
    plotlyType: "bar",
    barmode: "stack",
    group: "bar",
    category: "Bar Charts",
    icon: I.stacked,
  },
  {
    id: "stacked100",
    label: "100% Stacked",
    plotlyType: "bar",
    barmode: "relative",
    group: "bar",
    category: "Bar Charts",
    icon: I.stacked,
  },
  {
    id: "bar-hover",
    label: "Bar with Hover",
    plotlyType: "bar",
    group: "bar",
    category: "Bar Charts",
    icon: I.bar,
  },
  {
    id: "bar-direct-labels",
    label: "Bar Direct Labels",
    plotlyType: "bar",
    group: "bar",
    category: "Bar Charts",
    icon: I.bar,
  },
  {
    id: "grouped-direct-labels",
    label: "Grouped Labels",
    plotlyType: "bar",
    barmode: "group",
    group: "bar",
    category: "Bar Charts",
    icon: I.bar,
  },
  {
    id: "bar-rotated",
    label: "Rotated Labels",
    plotlyType: "bar",
    group: "bar",
    category: "Bar Charts",
    icon: I.bar,
  },
  {
    id: "bar-colors",
    label: "Custom Colors",
    plotlyType: "bar",
    group: "bar",
    category: "Bar Charts",
    icon: I.bar,
  },
  {
    id: "bar-styled",
    label: "Styled Bar",
    plotlyType: "bar",
    group: "bar",
    category: "Bar Charts",
    icon: I.bar,
  },
  {
    id: "bar-relative",
    label: "Relative Barmode",
    plotlyType: "bar",
    barmode: "relative",
    group: "bar",
    category: "Bar Charts",
    icon: I.bar,
  },
  // Pie & Donut
  {
    id: "pie",
    label: "Pie Chart",
    plotlyType: "pie",
    group: "pie-donut",
    category: "Pie & Donut",
    icon: I.pie,
  },
  {
    id: "donut",
    label: "Donut Chart",
    plotlyType: "pie",
    hole: 0.45,
    group: "pie-donut",
    category: "Pie & Donut",
    icon: I.donut,
  },
  {
    id: "pie-pull",
    label: "Pie with Pull",
    plotlyType: "pie",
    group: "pie-donut",
    category: "Pie & Donut",
    icon: I.pie,
  },
  {
    id: "pie-styled",
    label: "Styled Pie",
    plotlyType: "pie",
    group: "pie-donut",
    category: "Pie & Donut",
    icon: I.pie,
  },
  // Sunburst / Treemap / Icicle
  {
    id: "sunburst",
    label: "Sunburst",
    plotlyType: "sunburst",
    group: "sunburst-treemap",
    category: "Sunburst & Treemap",
    icon: I.sunburst,
  },
  {
    id: "sunburst-multi",
    label: "Multilevel Sunburst",
    plotlyType: "sunburst",
    group: "sunburst-treemap",
    category: "Sunburst & Treemap",
    icon: I.sunburst,
  },
  {
    id: "treemap",
    label: "Treemap",
    plotlyType: "treemap",
    group: "sunburst-treemap",
    category: "Sunburst & Treemap",
    icon: I.treemap,
  },
  {
    id: "treemap-nested",
    label: "Nested Treemap",
    plotlyType: "treemap",
    group: "sunburst-treemap",
    category: "Sunburst & Treemap",
    icon: I.treemap,
  },
  {
    id: "treemap-color",
    label: "Treemap + Color",
    plotlyType: "treemap",
    group: "sunburst-treemap",
    category: "Sunburst & Treemap",
    icon: I.treemap,
  },
  {
    id: "icicle",
    label: "Icicle",
    plotlyType: "icicle",
    group: "sunburst-treemap",
    category: "Sunburst & Treemap",
    icon: I.treemap,
  },
  {
    id: "icicle-multi",
    label: "Multilevel Icicle",
    plotlyType: "icicle",
    group: "sunburst-treemap",
    category: "Sunburst & Treemap",
    icon: I.treemap,
  },
  // Bubble
  {
    id: "bubble",
    label: "Bubble Chart",
    plotlyType: "scatter",
    mode: "markers",
    bubble: true,
    group: "bubble",
    category: "Bubble Charts",
    icon: I.bubble,
  },
  {
    id: "bubble-size",
    label: "Bubble Marker Size",
    plotlyType: "scatter",
    mode: "markers",
    bubble: true,
    group: "bubble",
    category: "Bubble Charts",
    icon: I.bubble,
  },
  {
    id: "bubble-size-color",
    label: "Bubble Size+Color",
    plotlyType: "scatter",
    mode: "markers",
    bubble: true,
    group: "bubble",
    category: "Bubble Charts",
    icon: I.bubble,
  },
  {
    id: "bubble-hover",
    label: "Bubble Hover Text",
    plotlyType: "scatter",
    mode: "markers",
    bubble: true,
    group: "bubble",
    category: "Bubble Charts",
    icon: I.bubble,
  },
  {
    id: "bubble-scaling",
    label: "Bubble Scaling",
    plotlyType: "scatter",
    mode: "markers",
    bubble: true,
    group: "bubble",
    category: "Bubble Charts",
    icon: I.bubble,
  },
  {
    id: "marker-array",
    label: "Marker Array",
    plotlyType: "scatter",
    mode: "markers",
    group: "bubble",
    category: "Bubble Charts",
    icon: I.scatter,
  },
  // Statistical
  {
    id: "box",
    label: "Box Plot",
    plotlyType: "box",
    group: "statistical",
    category: "Statistical",
    icon: I.box,
  },
  {
    id: "box-data",
    label: "Box + Data",
    plotlyType: "box",
    group: "statistical",
    category: "Statistical",
    icon: I.box,
  },
  {
    id: "hbox",
    label: "Horizontal Box",
    plotlyType: "box",
    orientation: "h",
    group: "statistical",
    category: "Statistical",
    icon: I.box,
  },
  {
    id: "grouped-box",
    label: "Grouped Box",
    plotlyType: "box",
    group: "statistical",
    category: "Statistical",
    icon: I.box,
  },
  {
    id: "box-outliers",
    label: "Box Outliers",
    plotlyType: "box",
    group: "statistical",
    category: "Statistical",
    icon: I.box,
  },
  {
    id: "box-styled",
    label: "Styled Box",
    plotlyType: "box",
    group: "statistical",
    category: "Statistical",
    icon: I.box,
  },
  {
    id: "rainbow-box",
    label: "Rainbow Box",
    plotlyType: "box",
    group: "statistical",
    category: "Statistical",
    icon: I.box,
  },
  {
    id: "violin",
    label: "Violin",
    plotlyType: "violin",
    group: "statistical",
    category: "Statistical",
    icon: I.violin,
  },
  {
    id: "violin-box",
    label: "Violin + Box",
    plotlyType: "violin",
    group: "statistical",
    category: "Statistical",
    icon: I.violin,
  },
  {
    id: "violin-split",
    label: "Split Violin",
    plotlyType: "violin",
    group: "statistical",
    category: "Statistical",
    icon: I.violin,
  },
  {
    id: "violin-grouped",
    label: "Grouped Violin",
    plotlyType: "violin",
    group: "statistical",
    category: "Statistical",
    icon: I.violin,
  },
  {
    id: "error-bars",
    label: "Symmetric Error",
    plotlyType: "scatter",
    mode: "lines+markers",
    group: "statistical",
    category: "Statistical",
    icon: I.error,
  },
  {
    id: "bar-error",
    label: "Bar Error Bars",
    plotlyType: "bar",
    group: "statistical",
    category: "Statistical",
    icon: I.error,
  },
  {
    id: "horizontal-error",
    label: "Horizontal Error",
    plotlyType: "scatter",
    mode: "markers",
    group: "statistical",
    category: "Statistical",
    icon: I.error,
  },
  {
    id: "asymmetric-error",
    label: "Asymmetric Error",
    plotlyType: "scatter",
    mode: "markers",
    group: "statistical",
    category: "Statistical",
    icon: I.error,
  },
  {
    id: "strip-chart",
    label: "Strip Chart",
    plotlyType: "scatter",
    mode: "markers",
    group: "statistical",
    category: "Statistical",
    icon: I.strip,
  },
  {
    id: "ecdf",
    label: "ECDF",
    plotlyType: "scatter",
    mode: "lines",
    group: "statistical",
    category: "Statistical",
    icon: I.line,
  },
  // Histogram
  {
    id: "histogram",
    label: "Histogram",
    plotlyType: "histogram",
    group: "histogram",
    category: "Histograms",
    icon: I.histogram,
  },
  {
    id: "overlaid-histogram",
    label: "Overlaid",
    plotlyType: "histogram",
    group: "histogram",
    category: "Histograms",
    icon: I.histogram,
  },
  {
    id: "stacked-histogram",
    label: "Stacked",
    plotlyType: "histogram",
    group: "histogram",
    category: "Histograms",
    icon: I.histogram,
  },
  {
    id: "styled-histogram",
    label: "Styled",
    plotlyType: "histogram",
    group: "histogram",
    category: "Histograms",
    icon: I.histogram,
  },
  {
    id: "cumulative-histogram",
    label: "Cumulative",
    plotlyType: "histogram",
    group: "histogram",
    category: "Histograms",
    icon: I.histogram,
  },
  {
    id: "normalized-histogram",
    label: "Normalized",
    plotlyType: "histogram",
    group: "histogram",
    category: "Histograms",
    icon: I.histogram,
  },
  {
    id: "probability-histogram",
    label: "Probability",
    plotlyType: "histogram",
    group: "histogram",
    category: "Histograms",
    icon: I.histogram,
  },
  {
    id: "2d-histogram-contour",
    label: "2D Hist Contour",
    plotlyType: "histogram2dcontour",
    group: "histogram",
    category: "Histograms",
    icon: I.contour,
  },
  {
    id: "2d-histogram-slider",
    label: "2D Hist + Slider",
    plotlyType: "histogram2dcontour",
    group: "histogram",
    category: "Histograms",
    icon: I.contour,
  },
  // Heatmap & Contour
  {
    id: "heatmap",
    label: "Heatmap",
    plotlyType: "heatmap",
    group: "heatmap-contour",
    category: "Heatmap & Contour",
    icon: I.heatmap,
  },
  {
    id: "heatmap-categorical",
    label: "Categorical Heatmap",
    plotlyType: "heatmap",
    group: "heatmap-contour",
    category: "Heatmap & Contour",
    icon: I.heatmap,
  },
  {
    id: "heatmap-annotated",
    label: "Annotated Heatmap",
    plotlyType: "heatmap",
    group: "heatmap-contour",
    category: "Heatmap & Contour",
    icon: I.heatmap,
  },
  {
    id: "contour-simple",
    label: "Simple Contour",
    plotlyType: "contour",
    group: "heatmap-contour",
    category: "Heatmap & Contour",
    icon: I.contour,
  },
  {
    id: "contour-basic",
    label: "Basic Contour",
    plotlyType: "contour",
    group: "heatmap-contour",
    category: "Heatmap & Contour",
    icon: I.contour,
  },
  {
    id: "contour-lines",
    label: "Contour Lines",
    plotlyType: "contour",
    group: "heatmap-contour",
    category: "Heatmap & Contour",
    icon: I.contour,
  },
  {
    id: "contour-labels",
    label: "Contour Labels",
    plotlyType: "contour",
    group: "heatmap-contour",
    category: "Heatmap & Contour",
    icon: I.contour,
  },
  {
    id: "carpet",
    label: "Carpet Plot",
    plotlyType: "carpet",
    group: "heatmap-contour",
    category: "Heatmap & Contour",
    icon: I.heatmap,
  },
  {
    id: "contour-carpet",
    label: "Contour Carpet",
    plotlyType: "contourcarpet",
    group: "heatmap-contour",
    category: "Heatmap & Contour",
    icon: I.contour,
  },
  {
    id: "carpet-scatter",
    label: "Carpet Scatter",
    plotlyType: "scattercarpet",
    group: "heatmap-contour",
    category: "Heatmap & Contour",
    icon: I.scatter,
  },
  // Filled & Area
  {
    id: "area",
    label: "Area Chart",
    plotlyType: "scatter",
    mode: "lines",
    fill: "tozeroy",
    group: "filled-area",
    category: "Filled & Area",
    icon: I.area,
  },
  {
    id: "area-stacked",
    label: "Stacked Area",
    plotlyType: "scatter",
    mode: "lines",
    fill: "tonexty",
    group: "filled-area",
    category: "Filled & Area",
    icon: I.area,
  },
  {
    id: "filled-lines",
    label: "Filled Lines",
    plotlyType: "scatter",
    mode: "lines",
    fill: "tozeroy",
    group: "filled-area",
    category: "Filled & Area",
    icon: I.area,
  },
  {
    id: "continuous-error-filled",
    label: "Error Filled",
    plotlyType: "scatter",
    mode: "lines",
    fill: "tonexty",
    group: "filled-area",
    category: "Filled & Area",
    icon: I.area,
  },
  {
    id: "asymmetric-offset",
    label: "Asymmetric Offset",
    plotlyType: "scatter",
    mode: "lines+markers",
    group: "filled-area",
    category: "Filled & Area",
    icon: I.error,
  },
  {
    id: "continuous-error",
    label: "Continuous Error",
    plotlyType: "scatter",
    mode: "lines+markers",
    group: "filled-area",
    category: "Filled & Area",
    icon: I.error,
  },
  // 3D
  {
    id: "scatter3d",
    label: "3D Scatter",
    plotlyType: "scatter3d",
    mode3d: "markers",
    group: "3d",
    category: "3D Charts",
    icon: I.scatter3d,
  },
  {
    id: "ribbon3d",
    label: "Ribbon Plot",
    plotlyType: "scatter3d",
    mode3d: "lines",
    group: "3d",
    category: "3D Charts",
    icon: I.scatter3d,
  },
  {
    id: "surface3d",
    label: "3D Surface",
    plotlyType: "surface",
    group: "3d",
    category: "3D Charts",
    icon: I.surface3d,
  },
  {
    id: "surface3d-multi",
    label: "Multi Surface",
    plotlyType: "surface",
    group: "3d",
    category: "3D Charts",
    icon: I.surface3d,
  },
  {
    id: "mesh3d",
    label: "3D Mesh",
    plotlyType: "mesh3d",
    group: "3d",
    category: "3D Charts",
    icon: I.scatter3d,
  },
  {
    id: "line3d",
    label: "3D Line Chart",
    plotlyType: "scatter3d",
    mode3d: "lines+markers",
    group: "3d",
    category: "3D Charts",
    icon: I.scatter3d,
  },
  {
    id: "line3d-plot",
    label: "3D Line Plot",
    plotlyType: "scatter3d",
    mode3d: "lines",
    group: "3d",
    category: "3D Charts",
    icon: I.scatter3d,
  },
  {
    id: "line3d-markers",
    label: "3D Line+Markers",
    plotlyType: "scatter3d",
    mode3d: "lines+markers",
    group: "3d",
    category: "3D Charts",
    icon: I.scatter3d,
  },
  {
    id: "line3d-spiral",
    label: "3D Spiral",
    plotlyType: "scatter3d",
    mode3d: "lines",
    group: "3d",
    category: "3D Charts",
    icon: I.scatter3d,
  },
  {
    id: "random-walk3d",
    label: "3D Random Walk",
    plotlyType: "scatter3d",
    mode3d: "lines+markers",
    group: "3d",
    category: "3D Charts",
    icon: I.scatter3d,
  },
  {
    id: "cone3d",
    label: "3D Cone",
    plotlyType: "cone",
    group: "3d",
    category: "3D Charts",
    icon: I.cone,
  },
  {
    id: "streamtube3d",
    label: "Streamtube",
    plotlyType: "streamtube",
    group: "3d",
    category: "3D Charts",
    icon: I.cone,
  },
  {
    id: "isosurface3d",
    label: "Isosurface",
    plotlyType: "isosurface",
    group: "3d",
    category: "3D Charts",
    icon: I.surface3d,
  },
  {
    id: "volume3d",
    label: "Volume Plot",
    plotlyType: "volume",
    group: "3d",
    category: "3D Charts",
    icon: I.surface3d,
  },
  // Maps
  {
    id: "choropleth",
    label: "Choropleth Map",
    plotlyType: "choropleth",
    group: "maps",
    category: "Maps & Geo",
    icon: I.map,
  },
  {
    id: "world-map",
    label: "World Map",
    plotlyType: "choropleth",
    group: "maps",
    category: "Maps & Geo",
    icon: I.map,
  },
  {
    id: "us-map",
    label: "US State Map",
    plotlyType: "choropleth",
    group: "maps",
    category: "Maps & Geo",
    icon: I.map,
  },
  {
    id: "scatter-geo",
    label: "Scatter Geo",
    plotlyType: "scattergeo",
    group: "maps",
    category: "Maps & Geo",
    icon: I.scatter,
  },
  {
    id: "line-geo",
    label: "Line Geo",
    plotlyType: "scattergeo",
    mode: "lines",
    group: "maps",
    category: "Maps & Geo",
    icon: I.line,
  },
  {
    id: "bubble-map",
    label: "Bubble Map",
    plotlyType: "scattergeo",
    mode: "markers",
    group: "maps",
    category: "Maps & Geo",
    icon: I.bubble,
  },
  {
    id: "choropleth-tile",
    label: "Choropleth Tile",
    plotlyType: "choroplethmapbox",
    group: "maps",
    category: "Maps & Geo",
    icon: I.map,
  },
  {
    id: "scatter-mapbox",
    label: "Scatter Mapbox",
    plotlyType: "scattermapbox",
    group: "maps",
    category: "Maps & Geo",
    icon: I.scatter,
  },
  {
    id: "density-mapbox",
    label: "Density Mapbox",
    plotlyType: "densitymapbox",
    group: "maps",
    category: "Maps & Geo",
    icon: I.heatmap,
  },
  // Financial
  {
    id: "candlestick",
    label: "Candlestick",
    plotlyType: "candlestick",
    group: "financial",
    category: "Financial",
    icon: I.candlestick,
  },
  {
    id: "candlestick-no-slider",
    label: "Candlestick No Slider",
    plotlyType: "candlestick",
    group: "financial",
    category: "Financial",
    icon: I.candlestick,
  },
  {
    id: "candlestick-annotated",
    label: "Candlestick Annotated",
    plotlyType: "candlestick",
    group: "financial",
    category: "Financial",
    icon: I.candlestick,
  },
  {
    id: "ohlc",
    label: "OHLC Chart",
    plotlyType: "ohlc",
    group: "financial",
    category: "Financial",
    icon: I.candlestick,
  },
  {
    id: "ohlc-no-slider",
    label: "OHLC No Slider",
    plotlyType: "ohlc",
    group: "financial",
    category: "Financial",
    icon: I.candlestick,
  },
  {
    id: "waterfall",
    label: "Waterfall",
    plotlyType: "waterfall",
    group: "financial",
    category: "Financial",
    icon: I.waterfall,
  },
  {
    id: "waterfall-multi",
    label: "Multi Waterfall",
    plotlyType: "waterfall",
    group: "financial",
    category: "Financial",
    icon: I.waterfall,
  },
  {
    id: "funnel",
    label: "Basic Funnel",
    plotlyType: "funnel",
    group: "financial",
    category: "Financial",
    icon: I.funnel,
  },
  {
    id: "funnel-stacked",
    label: "Stacked Funnel",
    plotlyType: "funnel",
    group: "financial",
    category: "Financial",
    icon: I.funnel,
  },
  {
    id: "funnel-area",
    label: "Funnel Area",
    plotlyType: "funnelarea",
    group: "financial",
    category: "Financial",
    icon: I.funnel,
  },
  {
    id: "time-series",
    label: "Time Series",
    plotlyType: "scatter",
    mode: "lines",
    group: "financial",
    category: "Financial",
    icon: I.timeseries,
  },
  {
    id: "time-series-slider",
    label: "Time + Slider",
    plotlyType: "scatter",
    mode: "lines",
    group: "financial",
    category: "Financial",
    icon: I.timeseries,
  },
  // Polar & Radar
  {
    id: "polar-scatter",
    label: "Polar Scatter",
    plotlyType: "scatterpolar",
    mode: "markers",
    group: "polar-radar",
    category: "Polar & Radar",
    icon: I.polar,
  },
  {
    id: "polar-line",
    label: "Polar Line",
    plotlyType: "scatterpolar",
    mode: "lines",
    group: "polar-radar",
    category: "Polar & Radar",
    icon: I.polar,
  },
  {
    id: "polar-bar",
    label: "Polar Bar (Wind Rose)",
    plotlyType: "barpolar",
    group: "polar-radar",
    category: "Polar & Radar",
    icon: I.polar,
  },
  {
    id: "radar",
    label: "Radar / Spider",
    plotlyType: "scatterpolar",
    mode: "lines",
    group: "polar-radar",
    category: "Polar & Radar",
    icon: I.radar,
  },
  {
    id: "radar-multi",
    label: "Radar Multi-Trace",
    plotlyType: "scatterpolar",
    mode: "lines",
    group: "polar-radar",
    category: "Polar & Radar",
    icon: I.radar,
  },
  // Scientific
  {
    id: "ternary",
    label: "Ternary Plot",
    plotlyType: "scatterternary",
    group: "scientific",
    category: "Scientific",
    icon: I.ternary,
  },
  {
    id: "soil-ternary",
    label: "Soil Ternary",
    plotlyType: "scatterternary",
    group: "scientific",
    category: "Scientific",
    icon: I.ternary,
  },
  {
    id: "log-plots",
    label: "Log Plots",
    plotlyType: "scatter",
    mode: "lines+markers",
    group: "scientific",
    category: "Scientific",
    icon: I.line,
  },
  {
    id: "log-axes",
    label: "Logarithmic Axes",
    plotlyType: "scatter",
    mode: "lines",
    group: "scientific",
    category: "Scientific",
    icon: I.line,
  },
  {
    id: "splom",
    label: "SPLOM",
    plotlyType: "splom",
    group: "scientific",
    category: "Scientific",
    icon: I.splom,
  },
  // Parallel & Sankey
  {
    id: "parallel-basic",
    label: "Basic Parallel Coords",
    plotlyType: "parcoords",
    group: "parallel-sankey",
    category: "Parallel & Sankey",
    icon: I.parallel,
  },
  {
    id: "parallel-coords",
    label: "Parallel Coordinates",
    plotlyType: "parcoords",
    group: "parallel-sankey",
    category: "Parallel & Sankey",
    icon: I.parallel,
  },
  {
    id: "parallel-advanced",
    label: "Advanced Parallel",
    plotlyType: "parcoords",
    group: "parallel-sankey",
    category: "Parallel & Sankey",
    icon: I.parallel,
  },
  {
    id: "parallel-categories",
    label: "Parallel Categories",
    plotlyType: "parcats",
    group: "parallel-sankey",
    category: "Parallel & Sankey",
    icon: I.parallel,
  },
  {
    id: "sankey",
    label: "Sankey Diagram",
    plotlyType: "sankey",
    group: "parallel-sankey",
    category: "Parallel & Sankey",
    icon: I.sankey,
  },
  {
    id: "sankey-multi",
    label: "Multilevel Sankey",
    plotlyType: "sankey",
    group: "parallel-sankey",
    category: "Parallel & Sankey",
    icon: I.sankey,
  },
  {
    id: "sankey-styled",
    label: "Styled Sankey",
    plotlyType: "sankey",
    group: "parallel-sankey",
    category: "Parallel & Sankey",
    icon: I.sankey,
  },
  // Indicator & Table
  {
    id: "indicator",
    label: "Indicator Gauge",
    plotlyType: "indicator",
    group: "indicator-table",
    category: "Indicator & Table",
    icon: I.indicator,
  },
  {
    id: "indicator-angular",
    label: "Angular Gauge",
    plotlyType: "indicator",
    group: "indicator-table",
    category: "Indicator & Table",
    icon: I.indicator,
  },
  {
    id: "indicator-bullet",
    label: "Bullet Gauge",
    plotlyType: "indicator",
    group: "indicator-table",
    category: "Indicator & Table",
    icon: I.indicator,
  },
  {
    id: "indicator-delta",
    label: "Delta Indicator",
    plotlyType: "indicator",
    group: "indicator-table",
    category: "Indicator & Table",
    icon: I.indicator,
  },
  {
    id: "indicator-number-delta",
    label: "Number + Delta",
    plotlyType: "indicator",
    group: "indicator-table",
    category: "Indicator & Table",
    icon: I.indicator,
  },
  {
    id: "table",
    label: "Basic Table",
    plotlyType: "table",
    group: "indicator-table",
    category: "Indicator & Table",
    icon: I.table,
  },
  {
    id: "table-styled",
    label: "Styled Table",
    plotlyType: "table",
    group: "indicator-table",
    category: "Indicator & Table",
    icon: I.table,
  },
  {
    id: "table-formatted",
    label: "Formatted Table",
    plotlyType: "table",
    group: "indicator-table",
    category: "Indicator & Table",
    icon: I.table,
  },
];

const CHART_GROUPS_ORDER = [
  { id: "line-scatter", label: "Line & Scatter", color: "#3b82f6" },
  { id: "bar", label: "Bar Charts", color: "#10b981" },
  { id: "pie-donut", label: "Pie & Donut", color: "#ec4899" },
  { id: "sunburst-treemap", label: "Sunburst & Treemap", color: "#f97316" },
  { id: "bubble", label: "Bubble Charts", color: "#a855f7" },
  { id: "statistical", label: "Statistical", color: "#f59e0b" },
  { id: "histogram", label: "Histograms", color: "#8b5cf6" },
  { id: "heatmap-contour", label: "Heatmap & Contour", color: "#E8FF5A" },
  { id: "filled-area", label: "Filled & Area", color: "#ef4444" },
  { id: "3d", label: "3D Charts", color: "#a855f7" },
  { id: "maps", label: "Maps & Geo", color: "#14b8a6" },
  { id: "financial", label: "Financial", color: "#f97316" },
  { id: "polar-radar", label: "Polar & Radar", color: "#4ade80" },
  { id: "scientific", label: "Scientific", color: "#E8FF5A" },
  { id: "parallel-sankey", label: "Parallel & Sankey", color: "#fb923c" },
  { id: "indicator-table", label: "Indicator & Table", color: "#64748b" },
];

// ─── Type Detector ─────────────────────────────────────────────────────────

function detectChartTypeId(traces: any[]): ChartTypeId {
  if (!traces || traces.length === 0) return "bar";
  const t0 = traces[0];
  const type = (t0.type || "bar").toLowerCase();
  const mode = (t0.mode || "").toLowerCase();
  const fill = t0.fill || "";
  const orient = t0.orientation || "v";
  if (type === "scatter3d" || (type === "scatter" && t0.z)) return "scatter3d";
  if (type === "mesh3d") return "mesh3d";
  if (type === "surface") return "surface3d";
  if (type === "cone") return "cone3d";
  if (type === "streamtube") return "streamtube3d";
  if (type === "isosurface") return "isosurface3d";
  if (type === "volume") return "volume3d";
  if (type === "waterfall") return "waterfall";
  if (type === "funnel") return "funnel";
  if (type === "funnelarea") return "funnel-area";
  if (type === "candlestick") return "candlestick";
  if (type === "ohlc") return "ohlc";
  if (type === "box") return orient === "h" ? "hbox" : "box";
  if (type === "violin") return "violin";
  if (type === "histogram") return "histogram";
  if (type === "histogram2dcontour") return "2d-histogram-contour";
  if (type === "heatmap") return "heatmap";
  if (type === "contour") return "contour-basic";
  if (type === "carpet") return "carpet";
  if (type === "contourcarpet") return "contour-carpet";
  if (type === "scattercarpet") return "carpet-scatter";
  if (type === "parcoords") return "parallel-coords";
  if (type === "parcats") return "parallel-categories";
  if (type === "scatterternary") return "ternary";
  if (type === "sunburst") return "sunburst";
  if (type === "treemap") return "treemap";
  if (type === "icicle") return "icicle";
  if (type === "splom") return "splom";
  if (type === "sankey") return "sankey";
  if (type === "indicator") return "indicator";
  if (type === "table") return "table";
  if (type === "choropleth") return "choropleth";
  if (type === "choroplethmapbox") return "choropleth-tile";
  if (type === "scattergeo") return "scatter-geo";
  if (type === "scattermapbox") return "scatter-mapbox";
  if (type === "densitymapbox") return "density-mapbox";
  if (type === "scatterpolar")
    return mode.includes("lines") ? "radar" : "polar-scatter";
  if (type === "barpolar") return "polar-bar";
  if (type === "pie" && t0.hole && t0.hole > 0) return "donut";
  if (type === "pie") return "pie";
  if (type === "scatter" && mode.includes("lines") && fill === "tonexty")
    return "area-stacked";
  if (type === "scatter" && mode.includes("lines") && fill)
    return "filled-lines";
  if (type === "scatter" && mode.includes("lines") && mode.includes("markers"))
    return "line-scatter";
  if (type === "scatter" && mode.includes("lines")) return "line";
  if (type === "scatter" && t0.marker?.sizeref) return "bubble";
  if (type === "scatter") return "scatter";
  if (type === "bar" && orient === "h") return "hbar";
  if (type === "bar") return "bar";
  return "bar";
}

// ─── Data Generators ───────────────────────────────────────────────────────

function genBox(traces: any[], pal: string[]) {
  return traces.map((t: any, i: number) => {
    const y = t.y?.map(Number).filter((n: number) => !isNaN(n)) || [];
    return {
      type: "box",
      name: t.name || `S${i + 1}`,
      y: y.length >= 4 ? y : [10, 15, 13, 17, 14, 12, 18, 11, 16, 13],
      marker: { color: pal[i % pal.length] },
      boxmean: true,
    };
  });
}
function genViolin(traces: any[], pal: string[]) {
  return traces.map((t: any, i: number) => {
    const y = t.y?.map(Number).filter((n: number) => !isNaN(n)) || [];
    return {
      type: "violin",
      name: t.name || `S${i + 1}`,
      y:
        y.length >= 5
          ? y
          : Array.from({ length: 30 }, () => Math.random() * 20 + 5),
      marker: { color: pal[i % pal.length] },
      box: { visible: true },
      meanline: { visible: true },
    };
  });
}
function genHistogram(traces: any[], pal: string[], variant: string) {
  return traces.map((t: any, i: number) => {
    const x = (t.y || t.x || []).map(Number).filter((n: number) => !isNaN(n));
    const base: any = {
      type: "histogram",
      name: t.name || `S${i + 1}`,
      x:
        x.length >= 5
          ? x
          : Array.from({ length: 50 }, () => Math.random() * 20 + i * 5),
      marker: { color: pal[i % pal.length] },
    };
    if (variant === "overlaid-histogram") base.opacity = 0.7;
    if (variant === "cumulative-histogram") base.cumulative = { enabled: true };
    if (
      variant === "normalized-histogram" ||
      variant === "probability-histogram"
    )
      base.histnorm = "probability";
    return base;
  });
}
function gen2DHistContour() {
  const n = 100;
  return [
    {
      type: "histogram2dcontour",
      x: Array.from({ length: n }, () => Math.random() * 10),
      y: Array.from({ length: n }, () => Math.random() * 10),
      colorscale: "Viridis",
      contours: { showlabels: true },
    },
  ];
}
function genHeatmap(traces: any[], variant: string) {
  if (traces[0]?.z) return traces;
  const cols = traces.length,
    rows = Math.max(...traces.map((t: any) => (t.y || t.x || []).length), 4);
  const z = Array.from({ length: rows }, (_, r) =>
    Array.from(
      { length: cols },
      (_, c) => traces[c]?.y?.[r] ?? Math.random() * 100,
    ),
  );
  const base: any = {
    type: "heatmap",
    z,
    x: traces.map((t: any, i: number) => t.name || `S${i + 1}`),
    y: (
      traces[0]?.x || Array.from({ length: rows }, (_, i) => `Row ${i + 1}`)
    ).map(String),
    colorscale: "Viridis",
  };
  if (variant === "heatmap-annotated") {
    base.text = z.map((r: number[]) => r.map((v: number) => v.toFixed(1)));
    base.texttemplate = "%{text}";
  }
  return [base];
}
function genContour(traces: any[], variant: string) {
  if (traces[0]?.z)
    return [
      {
        ...traces[0],
        type: "contour",
        colorscale: "Viridis",
        contours:
          variant === "contour-lines"
            ? { coloring: "lines" }
            : variant === "contour-labels"
              ? { showlabels: true }
              : {},
      },
    ];
  const size = 20,
    x = Array.from({ length: size }, (_, i) => i),
    y = Array.from({ length: size }, (_, i) => i);
  const z = y.map((yi) =>
    x.map((xi) => Math.sin(xi / 3) * Math.cos(yi / 3) * 10),
  );
  const base: any = { type: "contour", x, y, z, colorscale: "Viridis" };
  if (variant === "contour-lines") base.contours = { coloring: "lines" };
  if (variant === "contour-labels") base.contours = { showlabels: true };
  return [base];
}
function genTernary(traces: any[], pal: string[]) {
  return traces.map((t: any, i: number) => {
    const len = Math.max((t.y || []).length, 5),
      a = Array.from({ length: len }, () => Math.random() * 100);
    const b = a.map((ai) => Math.random() * (100 - ai)),
      c = a.map((ai, idx) => 100 - ai - b[idx]);
    return {
      type: "scatterternary",
      name: t.name || `S${i + 1}`,
      a,
      b,
      c,
      mode: "markers",
      marker: { color: pal[i % pal.length], size: 8 },
    };
  });
}
function genParcoords(traces: any[], pal: string[]) {
  const dims = traces.map((t: any, i: number) => ({
    label: t.name || `Dim ${i + 1}`,
    values:
      (t.y || t.x || []).map(Number).filter((n: number) => !isNaN(n)).length >=
      3
        ? (t.y || t.x || []).map(Number)
        : Array.from({ length: 20 }, () => Math.random() * 100),
  }));
  if (dims.length < 2)
    dims.push({
      label: "Dim 2",
      values: Array.from({ length: 20 }, () => Math.random() * 100),
    });
  return [
    {
      type: "parcoords",
      line: { color: dims[0].values, colorscale: "Viridis" },
      dimensions: dims,
    },
  ];
}
function genParcats(traces: any[], pal: string[]) {
  const dims = traces
    .slice(0, 3)
    .map((t: any, i: number) => ({
      label: t.name || `Cat ${i + 1}`,
      values:
        t.x ||
        Array.from(
          { length: 20 },
          () => `Option ${Math.floor(Math.random() * 3) + 1}`,
        ),
    }));
  if (dims.length < 2)
    dims.push({
      label: "Cat 2",
      values: Array.from(
        { length: 20 },
        () => `X${Math.floor(Math.random() * 2) + 1}`,
      ),
    });
  return [
    {
      type: "parcats",
      dimensions: dims,
      line: { color: pal[0], colorscale: "Viridis" },
    },
  ];
}
function genWaterfall(traces: any[], pal: string[]) {
  const t0 = traces[0] || {},
    x = t0.x || ["Start", "Q1", "Q2", "Q3", "Q4", "Total"],
    y = (t0.y || [100, 20, -15, 35, -10, 130]).map(Number);
  return [
    {
      type: "waterfall",
      name: t0.name || "Waterfall",
      x,
      y,
      measure: y.map((_: any, i: number) =>
        i === 0 || i === y.length - 1 ? "absolute" : "relative",
      ),
      connector: { line: { color: "rgb(63,63,63)" } },
      increasing: { marker: { color: pal[1] || "#10b981" } },
      decreasing: { marker: { color: "#ef4444" } },
      totals: { marker: { color: pal[0] || "#3b82f6" } },
    },
  ];
}
function genCandlestick(traces: any[]) {
  const t0 = traces[0] || {},
    dates =
      t0.x ||
      Array.from({ length: 30 }, (_, i) => {
        const d = new Date(2024, 0, i + 1);
        return d.toISOString().split("T")[0];
      });
  const open =
    t0.open ||
    Array.from(
      { length: dates.length },
      (_, i) => 100 + Math.sin(i / 3) * 15 + Math.random() * 5,
    );
  return [
    {
      type: "candlestick",
      x: dates,
      open,
      high: t0.high || open.map((o: number) => o + Math.random() * 10),
      low: t0.low || open.map((o: number) => o - Math.random() * 10),
      close: t0.close || open.map((o: number) => o + (Math.random() - 0.5) * 8),
      increasing: { line: { color: "#10b981" } },
      decreasing: { line: { color: "#ef4444" } },
    },
  ];
}
function genOHLC(traces: any[]) {
  const t0 = traces[0] || {},
    dates =
      t0.x ||
      Array.from({ length: 30 }, (_, i) => {
        const d = new Date(2024, 0, i + 1);
        return d.toISOString().split("T")[0];
      });
  const open =
    t0.open ||
    Array.from({ length: dates.length }, (_, i) => 100 + Math.sin(i / 3) * 15);
  return [
    {
      type: "ohlc",
      x: dates,
      open,
      high: open.map((o: number) => o + Math.random() * 8),
      low: open.map((o: number) => o - Math.random() * 8),
      close: open.map((o: number) => o + (Math.random() - 0.5) * 6),
      increasing: { line: { color: "#10b981" } },
      decreasing: { line: { color: "#ef4444" } },
    },
  ];
}
function genFunnel(traces: any[], pal: string[], stacked: boolean) {
  if (stacked)
    return traces.map((t: any, i: number) => ({
      type: "funnel",
      name: t.name || `S${i + 1}`,
      y: t.x || ["Awareness", "Interest", "Desire", "Action"],
      x: t.y || [500 - i * 80, 400 - i * 60, 300 - i * 50, 200 - i * 40],
      marker: { color: pal[i % pal.length] },
    }));
  const t0 = traces[0] || {};
  return [
    {
      type: "funnel",
      y: t0.x || ["Visits", "Downloads", "Prospects", "Invoiced", "Paid"],
      x: t0.y || [13873, 10533, 5443, 2703, 908],
      marker: { color: pal.slice(0, 5) },
      textinfo: "value+percent initial",
    },
  ];
}
function genFunnelArea(traces: any[], pal: string[]) {
  return [
    {
      type: "funnelarea",
      values: traces[0]?.y || [5, 4, 3, 2, 1],
      text: traces[0]?.x || [
        "Awareness",
        "Interest",
        "Desire",
        "Action",
        "Purchase",
      ],
      marker: { colors: pal.slice(0, 5) },
    },
  ];
}
function genSurface3D(traces: any[]) {
  if (traces[0]?.z)
    return traces.map((t: any) => ({
      ...t,
      type: "surface",
      colorscale: "Viridis",
    }));
  const size = 25,
    x = Array.from({ length: size }, (_, i) => (i - size / 2) / 5),
    y = Array.from({ length: size }, (_, i) => (i - size / 2) / 5);
  return [
    {
      type: "surface",
      x,
      y,
      z: y.map((yi) => x.map((xi) => Math.sin(Math.sqrt(xi * xi + yi * yi)))),
      colorscale: "Viridis",
    },
  ];
}
function genMesh3D(pal: string[]) {
  const n = 50,
    theta = Array.from({ length: n }, (_, i) => (i / n) * 2 * Math.PI),
    phi = Array.from({ length: n }, (_, i) => (i / n) * Math.PI);
  return [
    {
      type: "mesh3d",
      x: theta.map((t, i) => Math.sin(phi[i]) * Math.cos(t)),
      y: theta.map((t, i) => Math.sin(phi[i]) * Math.sin(t)),
      z: phi.map((p) => Math.cos(p)),
      alphahull: 7,
      color: pal[0],
      opacity: 0.7,
    },
  ];
}
function genScatter3D(traces: any[], pal: string[], mode3d: string) {
  return traces.map((t: any, i: number) => {
    const n = Math.max((t.y || []).length, 20);
    return {
      type: "scatter3d",
      name: t.name || `S${i + 1}`,
      x: t.x || Array.from({ length: n }, () => Math.random() * 10),
      y: t.y || Array.from({ length: n }, () => Math.random() * 10),
      z: t.z || Array.from({ length: n }, () => Math.random() * 10),
      mode: mode3d || "markers",
      marker: { color: pal[i % pal.length], size: 5, opacity: 0.8 },
      line: { color: pal[i % pal.length], width: 2 },
    };
  });
}
function genCone3D(pal: string[]) {
  const n = 9,
    x = [],
    y = [],
    z = [],
    u = [],
    v = [],
    w = [];
  for (let i = 0; i < n; i++) {
    x.push(i % 3);
    y.push(Math.floor(i / 3));
    z.push(0);
    u.push(Math.cos(i));
    v.push(Math.sin(i));
    w.push(0.5);
  }
  return [
    {
      type: "cone",
      x,
      y,
      z,
      u,
      v,
      w,
      colorscale: "Viridis",
      sizemode: "absolute",
      sizeref: 0.5,
    },
  ];
}
function genStreamtube(pal: string[]) {
  const x = [],
    y = [],
    z = [],
    u = [],
    v = [],
    w = [];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      x.push(i);
      y.push(j);
      z.push(0);
      u.push(1);
      v.push(0);
      w.push(0);
    }
  return [
    {
      type: "streamtube",
      x,
      y,
      z,
      u,
      v,
      w,
      colorscale: "Portland",
      sizeref: 0.5,
    },
  ];
}
function genIsosurface(pal: string[]) {
  const n = 5;
  const vals = [];
  const x = [],
    y = [],
    z = [],
    val = [];
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      for (let k = 0; k < n; k++) {
        x.push(i - 2);
        y.push(j - 2);
        z.push(k - 2);
        val.push(Math.pow(i - 2, 2) + Math.pow(j - 2, 2) + Math.pow(k - 2, 2));
      }
  return [
    {
      type: "isosurface",
      x,
      y,
      z,
      value: val,
      isomin: 1,
      isomax: 4,
      colorscale: "Viridis",
      opacity: 0.6,
      surface: { count: 3 },
    },
  ];
}
function genVolume(pal: string[]) {
  const n = 5;
  const x = [],
    y = [],
    z = [],
    val = [];
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      for (let k = 0; k < n; k++) {
        x.push(i - 2);
        y.push(j - 2);
        z.push(k - 2);
        val.push(Math.sin(i) * Math.cos(j) * Math.sin(k));
      }
  return [
    {
      type: "volume",
      x,
      y,
      z,
      value: val,
      isomin: -0.5,
      isomax: 0.5,
      colorscale: "RdBu",
      opacity: 0.2,
      surface: { count: 17 },
      slices: { z: { show: true, locations: [0] } },
    },
  ];
}
function genChoropleth(variant: string, pal: string[]) {
  const countries = [
    "USA",
    "CAN",
    "GBR",
    "DEU",
    "FRA",
    "AUS",
    "JPN",
    "CHN",
    "IND",
    "BRA",
  ];
  const us_states = [
    "NY",
    "CA",
    "TX",
    "FL",
    "IL",
    "PA",
    "OH",
    "GA",
    "NC",
    "MI",
  ];
  const isUS = variant === "us-map";
  const locations = isUS ? us_states : countries;
  return [
    {
      type: "choropleth",
      locationmode: isUS ? "USA-states" : "country names",
      locations,
      z: locations.map(() => Math.random() * 100),
      colorscale: "Viridis",
      geo: isUS ? { scope: "usa" } : undefined,
    },
  ];
}
function genScatterGeo(traces: any[], pal: string[], mode: string) {
  const cities = [
    { name: "New York", lat: 40.7, lon: -74 },
    { name: "London", lat: 51.5, lon: -0.12 },
    { name: "Tokyo", lat: 35.7, lon: 139.7 },
    { name: "Sydney", lat: -33.9, lon: 151.2 },
    { name: "Paris", lat: 48.9, lon: 2.3 },
  ];
  return traces
    .slice(0, 2)
    .map((t: any, i: number) => ({
      type: "scattergeo",
      name: t.name || `S${i + 1}`,
      lat: cities.map((c) => c.lat + Math.random() * 5 - 2.5),
      lon: cities.map((c) => c.lon + Math.random() * 5 - 2.5),
      mode: mode || "markers",
      marker: { color: pal[i % pal.length], size: 8 },
    }));
}
function genPolarScatter(traces: any[], pal: string[], mode: string) {
  return traces.map((t: any, i: number) => {
    const n = 20;
    return {
      type: "scatterpolar",
      name: t.name || `S${i + 1}`,
      r: Array.from({ length: n }, () => Math.random() * 5),
      theta: Array.from({ length: n }, (_, j) => j * (360 / n)),
      mode: mode || "markers",
      marker: { color: pal[i % pal.length], size: 8 },
      line: { color: pal[i % pal.length] },
    };
  });
}
function genRadar(traces: any[], pal: string[]) {
  const cats = [
    "Speed",
    "Strength",
    "Agility",
    "Endurance",
    "Intelligence",
    "Luck",
  ];
  return traces.map((t: any, i: number) => ({
    type: "scatterpolar",
    name: t.name || `S${i + 1}`,
    r: [...Array.from({ length: cats.length }, () => Math.random() * 5 + 2), 0],
    theta: [...cats, cats[0]],
    fill: "toself",
    fillcolor: pal[i % pal.length] + "33",
    line: { color: pal[i % pal.length] },
    mode: "lines",
  }));
}
function genPolarBar(traces: any[], pal: string[]) {
  const n = 8,
    dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return traces
    .slice(0, 2)
    .map((t: any, i: number) => ({
      type: "barpolar",
      name: t.name || `Wind ${i + 1}`,
      r: Array.from({ length: n }, () => Math.random() * 30 + 10),
      theta: dirs,
      marker: { color: pal[i % pal.length], opacity: 0.8 },
    }));
}
function genSankey(traces: any[], pal: string[]) {
  const node = {
    label: ["A", "B", "C", "D", "E", "F"],
    color: pal.slice(0, 6),
    pad: 15,
    thickness: 20,
  };
  const link = {
    source: [0, 0, 1, 2, 3, 4],
    target: [2, 3, 3, 4, 4, 5],
    value: [8, 4, 2, 8, 4, 2],
  };
  return [
    {
      type: "sankey",
      node,
      link: { ...link, color: pal.slice(0, 6).map((c: string) => c + "88") },
    },
  ];
}
function genIndicator(variant: string, traces: any[]) {
  const value = traces[0]?.y?.[0] ?? 67;
  const prev = traces[0]?.y?.[1] ?? 52;
  const base: any = {
    type: "indicator",
    value,
    number: { font: { size: 60 } },
  };
  if (variant === "indicator-angular" || variant === "indicator") {
    base.mode = "number+gauge";
    base.gauge = {
      axis: { range: [0, 100] },
      bar: { color: "#E8FF5A" },
      bgcolor: "white",
      borderwidth: 2,
      bordercolor: "#ccc",
      steps: [
        { range: [0, 50], color: "#fef3c7" },
        { range: [50, 80], color: "#d1fae5" },
        { range: [80, 100], color: "#dcfce7" },
      ],
      threshold: {
        line: { color: "red", width: 4 },
        thickness: 0.75,
        value: 90,
      },
    };
  } else if (variant === "indicator-bullet") {
    base.mode = "number+gauge";
    base.gauge = {
      shape: "bullet",
      axis: { range: [0, 100] },
      bar: { color: "#E8FF5A" },
      steps: [
        { range: [0, 50], color: "#e5e7eb" },
        { range: [50, 80], color: "#d1d5db" },
      ],
      threshold: {
        line: { color: "#ef4444", width: 2 },
        thickness: 0.75,
        value: 85,
      },
    };
  } else if (
    variant === "indicator-delta" ||
    variant === "indicator-number-delta"
  ) {
    base.mode = "number+delta";
    base.delta = {
      reference: prev,
      relative: true,
      increasing: { color: "#10b981" },
      decreasing: { color: "#ef4444" },
    };
  }
  return [base];
}
function genTable(
  traces: any[],
  variant: string,
  pal: string[],
  textClr: string,
) {
  const headers = traces.map(
    (t: any, i: number) => t.name || `Column ${i + 1}`,
  );
  const maxLen = Math.max(
    ...traces.map((t: any) => (t.y || t.x || []).length),
    5,
  );
  const cells = traces.map(
    (t: any) =>
      t.y || t.x || Array.from({ length: maxLen }, (_, i) => `Row ${i + 1}`),
  );
  const headerFill =
    variant === "table-formatted"
      ? pal.slice(0, headers.length)
      : variant === "table-styled"
        ? "#1e293b"
        : "#f3f4f6";
  const headerFont =
    variant === "table-formatted" || variant === "table-styled"
      ? { color: "white", size: 13 }
      : { color: "#374151", size: 12 };
  const cellFill =
    variant === "table-styled"
      ? cells[0].map((_: any, i: number) => (i % 2 === 0 ? "#f8fafc" : "white"))
      : variant === "table-formatted"
        ? cells[0].map((_: any, i: number) =>
            i % 2 === 0 ? "#f0f9ff" : "white",
          )
        : "white";
  return [
    {
      type: "table",
      header: {
        values: headers,
        fill: { color: headerFill },
        font: headerFont,
        align: "left",
        height: 36,
      },
      cells: {
        values: cells,
        fill: { color: cellFill },
        font: { color: "#374151", size: 12 },
        align: "left",
        height: 30,
        line: { color: "#e2e8f0", width: 1 },
      },
    },
  ];
}
function genSPLOM(traces: any[], pal: string[]) {
  const dims = traces
    .slice(0, 4)
    .map((t: any, i: number) => ({
      label: t.name || `Dim ${i + 1}`,
      values: (t.y || Array.from({ length: 30 }, () => Math.random() * 10)).map(
        Number,
      ),
    }));
  if (dims.length < 2)
    dims.push({
      label: "Dim 2",
      values: Array.from({ length: 30 }, () => Math.random() * 10),
    });
  return [
    {
      type: "splom",
      dimensions: dims,
      marker: { color: pal[0], size: 5, opacity: 0.7 },
      diagonal: { visible: false },
    },
  ];
}
function genErrorBar(traces: any[], pal: string[], variant: string) {
  return traces.map((t: any, i: number) => {
    const x = t.x || ["Jan", "Feb", "Mar", "Apr", "May"],
      y = (t.y || [10, 15, 13, 17, 14]).map(Number);
    const err = y.map((v: number) => v * 0.1 + 1);
    const base: any = {
      type: "scatter",
      name: t.name || `S${i + 1}`,
      x,
      y,
      mode: "lines+markers",
      marker: { color: pal[i % pal.length] },
      line: { color: pal[i % pal.length] },
    };
    if (variant === "horizontal-error")
      base.error_x = { type: "data", array: err, visible: true };
    else if (variant === "asymmetric-error")
      base.error_y = {
        type: "data",
        array: err,
        arrayminus: err.map((v: number) => v * 0.5),
        visible: true,
      };
    else base.error_y = { type: "data", array: err, visible: true };
    return base;
  });
}
function genStripChart(traces: any[], pal: string[]) {
  return traces.map((t: any, i: number) => ({
    type: "scatter",
    name: t.name || `S${i + 1}`,
    x: Array.from({ length: 30 }, () => t.name || `S${i + 1}`),
    y: Array.from({ length: 30 }, () => Math.random() * 20 + 5),
    mode: "markers",
    marker: {
      color: pal[i % pal.length],
      size: 6,
      opacity: 0.6,
      symbol: "circle",
    },
  }));
}
function genECDF(traces: any[], pal: string[]) {
  return traces.map((t: any, i: number) => {
    const raw = (t.y || Array.from({ length: 50 }, () => Math.random() * 20))
      .map(Number)
      .sort((a: number, b: number) => a - b);
    return {
      type: "scatter",
      name: t.name || `S${i + 1}`,
      x: raw,
      y: raw.map((_: any, idx: number) => (idx + 1) / raw.length),
      mode: "lines",
      line: { color: pal[i % pal.length], shape: "hv" },
    };
  });
}

// ─── Palettes & Fonts ──────────────────────────────────────────────────────

const PALETTES = [
  {
    id: "neon",
    label: "Neon",
    colors: [
      "#00f5ff",
      "#bf5fff",
      "#ff006e",
      "#ffbe0b",
      "#00e676",
      "#ff4081",
      "#40c4ff",
      "#69ff47",
    ],
  },
  {
    id: "vivid",
    label: "Vivid",
    colors: [
      "#6366f1",
      "#8b5cf6",
      "#ec4899",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#06b6d4",
      "#f97316",
    ],
  },
  {
    id: "ocean",
    label: "Ocean",
    colors: [
      "#06b6d4",
      "#0ea5e9",
      "#38bdf8",
      "#0284c7",
      "#0369a1",
      "#075985",
      "#7dd3fc",
      "#bae6fd",
    ],
  },
  {
    id: "sunset",
    label: "Sunset",
    colors: [
      "#f97316",
      "#ef4444",
      "#eab308",
      "#f43f5e",
      "#fb923c",
      "#fbbf24",
      "#dc2626",
      "#b45309",
    ],
  },
  {
    id: "forest",
    label: "Forest",
    colors: [
      "#4ade80",
      "#86efac",
      "#6ee7b7",
      "#a3e635",
      "#34d399",
      "#16a34a",
      "#15803d",
      "#166534",
    ],
  },
  {
    id: "galaxy",
    label: "Galaxy",
    colors: [
      "#a78bfa",
      "#c084fc",
      "#818cf8",
      "#e879f9",
      "#7dd3fc",
      "#f0abfc",
      "#9333ea",
      "#7c3aed",
    ],
  },
  {
    id: "mono",
    label: "Mono",
    colors: [
      "#1e293b",
      "#334155",
      "#475569",
      "#64748b",
      "#94a3b8",
      "#cbd5e1",
      "#e2e8f0",
      "#f8fafc",
    ],
  },
  {
    id: "pastel",
    label: "Pastel",
    colors: [
      "#fca5a5",
      "#fcd34d",
      "#6ee7b7",
      "#93c5fd",
      "#c4b5fd",
      "#f9a8d4",
      "#a5f3fc",
      "#bbf7d0",
    ],
  },
  {
    id: "earth",
    label: "Earth",
    colors: [
      "#92400e",
      "#b45309",
      "#d97706",
      "#ca8a04",
      "#78350f",
      "#44403c",
      "#57534e",
      "#713f12",
    ],
  },
  {
    id: "berry",
    label: "Berry",
    colors: [
      "#be185d",
      "#9d174d",
      "#db2777",
      "#ec4899",
      "#a21caf",
      "#86198f",
      "#7e22ce",
      "#6b21a8",
    ],
  },
  {
    id: "coral",
    label: "Coral",
    colors: [
      "#fb7185",
      "#f472b6",
      "#e879f9",
      "#c084fc",
      "#818cf8",
      "#60a5fa",
      "#34d399",
      "#fbbf24",
    ],
  },
  {
    id: "slate",
    label: "Slate",
    colors: [
      "#64748b",
      "#475569",
      "#6366f1",
      "#8b5cf6",
      "#06b6d4",
      "#10b981",
      "#f59e0b",
      "#ef4444",
    ],
  },
];
const FONTS = [
  "Inter",
  "DM Sans",
  "Space Grotesk",
  "Outfit",
  "Manrope",
  "Plus Jakarta Sans",
  "Sora",
  "Nunito",
  "Poppins",
  "IBM Plex Sans",
  "DM Mono",
  "JetBrains Mono",
  "Fira Code",
  "Roboto",
  "Roboto Mono",
];
const BG_PRESETS = [
  { id: "white", label: "White", hex: "#ffffff" },
  { id: "paper", label: "Paper", hex: "#fafaf9" },
  { id: "light", label: "Light", hex: "#f3f4f6" },
  { id: "black", label: "Black", hex: "#0a0a0a" },
  { id: "slate", label: "Slate", hex: "#0f172a" },
  { id: "navy", label: "Navy", hex: "#0c1445" },
  { id: "purple", label: "Purple", hex: "#1a0533" },
  { id: "green", label: "Forest", hex: "#052e16" },
];

// ─── Sub-components ────────────────────────────────────────────────────────

function Sec({
  title,
  children,
  open = true,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(open);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-transparent border-none cursor-pointer"
      >
        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
          {title}
        </span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.18s",
          }}
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="#c4c4c4"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen && <div className="px-4 pb-4 pt-0.5">{children}</div>}
    </div>
  );
}
function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <span className="text-[11px] text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className="relative border-none cursor-pointer transition-colors duration-200"
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: value ? "#E8FF5A" : "#e5e7eb",
        }}
      >
        <span
          className="absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow transition-all duration-200"
          style={{ left: value ? 18 : 3 }}
        />
      </button>
    </div>
  );
}
function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-[11px] text-gray-700">{label}</span>
        <span className="text-[11px] font-bold text-cyan-500 font-mono">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-cyan-500"
      />
    </div>
  );
}
function TxtInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="w-full px-2.5 py-[7px] text-[11px] rounded-lg bg-gray-50 text-gray-900 outline-none transition-all duration-150"
      style={{
        border: `1.5px solid ${focused ? "#E8FF5A" : "#e5e7eb"}`,
        boxShadow: focused ? "0 0 0 3px rgba(232,255,90,0.1)" : "none",
      }}
    />
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function ChartEditor({
  message,
  divRef,
  onClose,
  existingChartId,
}: ChartEditorProps) {
  const plotRef = useRef<PlotlyHTMLElement>(null);
  const userHasEdited = useRef(false);
  const paletteChangedRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<
    "graph" | "style" | "axes" | "annotate" | "export"
  >("graph");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const getLiveData = useCallback((): { data: any[]; layout: any } => {
    const liveDiv = divRef?.current;
    const msgLayout = message?.content?.layout || {};
    if (liveDiv && liveDiv.data && liveDiv.data.length > 0) {
      const liveLayout = liveDiv.layout || {};
      // Always preserve title from message.content if live div has stripped it
      const resolvedTitle = liveLayout.title || msgLayout.title;
      return {
        data: liveDiv.data,
        layout: {
          ...msgLayout,
          ...liveLayout,
          title: resolvedTitle,
        },
      };
    }
    return {
      data: message?.content?.data || [],
      layout: msgLayout,
    };
  }, [divRef, message]);
  const { token, isAuthenticated, addSavedChart, updateSavedChart } =
    useAppStore();
  const [dbSaveStatus, setDbSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [chartTypeId, setChartTypeId] = useState<ChartTypeId>("bar");
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [bgHex, setBgHex] = useState("#111111");
  const [customBg, setCustomBg] = useState("#111111");
  const [borderRadius, setBorderRadius] = useState(12);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [xLabel, setXLabel] = useState("");
  const [yLabel, setYLabel] = useState("");
  const [showLegend, setShowLegend] = useState(true);
  const [legendPos, setLegendPos] = useState<
    "bottom" | "top" | "left" | "right"
  >("bottom");
  const [showGrid, setShowGrid] = useState(true);
  const [showZero, setShowZero] = useState(true);
  const [showTicks, setShowTicks] = useState(true);
  const [xAngle, setXAngle] = useState(0);
  const [fontFamily, setFontFamily] = useState("DM Mono");
  const [fontSize, setFontSize] = useState(11);
  const [titleSize, setTitleSize] = useState(15);
  const [lineWidth, setLineWidth] = useState(2);
  const [markerSize, setMarkerSize] = useState(7);
  const [opacity, setOpacity] = useState(90);
  const [barGap, setBarGap] = useState(20);
  const [smooth, setSmooth] = useState(false);
  const [showMarkers, setShowMarkers] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [fillOpacity, setFillOpacity] = useState(30);
  const [borderWidth, setBorderWidth] = useState(0);
  const [logX, setLogX] = useState(false);
  const [logY, setLogY] = useState(false);
  const [reverseX, setReverseX] = useState(false);
  const [reverseY, setReverseY] = useState(false);
  const [annotations, setAnnotations] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");
  const [exportW, setExportW] = useState(1200);
  const [exportH, setExportH] = useState(700);

  const isLightBg = ["#ffffff", "#fafaf9", "#f3f4f6"].includes(bgHex);

  const markEdited = () => {
    userHasEdited.current = true;
  };

  useEffect(() => {
    const { data: liveData, layout: liveLayout } = getLiveData();
    // Always prefer message.content.layout for title — divRef may be
    // empty or have a stripped layout on first mount
    const msgLayout = message?.content?.layout ?? {};
    const extractTitle = (l: any) =>
      typeof l?.title === "string" ? l.title : (l?.title?.text ?? "");
    const resolvedTitle =
      extractTitle(liveLayout) || extractTitle(msgLayout) || "";
    setTitle(resolvedTitle);
    setSubtitle(liveLayout._subtitle || "");
    setAnnotations(
      Array.isArray(liveLayout._annotations) ? liveLayout._annotations : [],
    );
    setXLabel(liveLayout.xaxis?.title?.text || liveLayout.xaxis?.title || "");
    setYLabel(liveLayout.yaxis?.title?.text || liveLayout.yaxis?.title || "");
    const detectedId = detectChartTypeId(liveData);
    setChartTypeId(detectedId);
    const grp = CHART_TYPES.find((c) => c.id === detectedId)?.group || "bar";
    setActiveGroup(grp);
    setShowLegend(liveLayout.showlegend !== false);
    setShowGrid(liveLayout.xaxis?.showgrid !== false);
    setShowZero(liveLayout.xaxis?.zeroline !== false);
    userHasEdited.current = false;
    setMounted(true);
    paletteChangedRef.current = false;
  }, [getLiveData]);

  useEffect(() => {
    if (!mounted) return;
    const msgId = message?.id;
    if (!msgId) return;
    if (!window.__graphixChartData) window.__graphixChartData = {};
    const existing = window.__graphixChartData[msgId] ?? getLiveData();
    window.__graphixChartData[msgId] = {
      ...existing,
      layout: {
        ...existing.layout,
        _subtitle: subtitle,
        _annotations: annotations,
        title: title ? { text: title } : existing.layout.title,
      },
    };
  }, [mounted, title, subtitle, annotations, message?.id, getLiveData]);

  const buildPieData = useCallback(
    (rawData: any[], pal: string[], hole?: number) => {
      if (rawData.length === 0) return [];
      if (rawData[0]?.type === "pie")
        return rawData.map((t: any) => ({
          ...t,
          type: "pie",
          hole: hole || 0,
          marker: { ...t.marker, colors: pal },
        }));
      const labels: string[] = [],
        values: number[] = [];
      rawData.forEach((t: any, i: number) => {
        labels.push(t.name || `S${i + 1}`);
        values.push(
          Array.isArray(t.y)
            ? t.y.reduce((s: number, v: any) => s + (Number(v) || 0), 0)
            : Number(t.y) || 0,
        );
      });
      return [
        {
          type: "pie",
          labels,
          values,
          hole: hole || 0,
          marker: { colors: pal },
          textinfo: "label+percent",
          hoverinfo: "label+value+percent",
        },
      ];
    },
    [],
  );

  const buildHierarchyData = useCallback(
    (rawData: any[], plotlyType: string, pal: string[]) => {
      if (rawData[0]?.type === plotlyType) return rawData;
      const labels = [
        "Root",
        "Branch A",
        "Branch B",
        "Leaf A1",
        "Leaf A2",
        "Leaf B1",
        "Leaf B2",
      ];
      const parents = [
        "",
        "Root",
        "Root",
        "Branch A",
        "Branch A",
        "Branch B",
        "Branch B",
      ];
      const values = [0, 10, 15, 5, 5, 8, 7];
      return [
        {
          type: plotlyType,
          labels,
          parents,
          values,
          marker: { colors: pal.slice(0, 7) },
        },
      ];
    },
    [],
  );

  const applyChart = useCallback(() => {
    if (!userHasEdited.current) return;
    if (!plotRef.current || typeof window === "undefined" || !window.Plotly)
      return;
    const Plotly = window.Plotly;
    const { data: liveData, layout: liveLayout } = getLiveData();
    const ct = CHART_TYPES.find((c) => c.id === chartTypeId) || CHART_TYPES[0];
    let pal: string[];
    if (paletteChangedRef.current) {
      pal = PALETTES[paletteIdx].colors;
    } else {
      pal = liveData.map((t: any, i: number): string => {
        if (Array.isArray(t.marker?.colors) && t.marker.colors[0])
          return String(t.marker.colors[0]);
        if (typeof t.marker?.color === "string" && t.marker.color)
          return t.marker.color;
        if (typeof t.line?.color === "string" && t.line.color)
          return t.line.color;
        if (typeof t.fillcolor === "string" && t.fillcolor)
          return t.fillcolor.replace(/(.{7}).+/, "$1"); // strip alpha
        return PALETTES[paletteIdx].colors[
          i % PALETTES[paletteIdx].colors.length
        ];
      });
      // If we only got palette defaults, just use the palette
      const defaultPal = PALETTES[paletteIdx].colors;
      if (pal.every((c, i) => c === defaultPal[i % defaultPal.length])) {
        pal = defaultPal;
      }
    }
    const isCardLight = !isLightBg;
    const cardBgColor = isCardLight ? "#ffffff" : "#1e293b";
    const textClr = isCardLight ? "#111827" : "rgba(255,255,255,0.85)";
    const gridClr = isCardLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.08)";
    const lineClr = isCardLight ? "#d1d5db" : "rgba(255,255,255,0.12)";

    let data: any[];

    // ── Hierarchy charts ──
    if (
      [
        "sunburst",
        "sunburst-multi",
        "treemap",
        "treemap-nested",
        "treemap-color",
        "icicle",
        "icicle-multi",
      ].includes(ct.id)
    ) {
      data = buildHierarchyData(liveData, ct.plotlyType, pal);
    }
    // ── Pie/Donut ──
    else if (ct.id === "pie" || ct.id === "pie-styled")
      data = buildPieData(liveData, pal, 0);
    else if (ct.id === "donut") data = buildPieData(liveData, pal, 0.45);
    else if (ct.id === "pie-pull") {
      const d = buildPieData(liveData, pal, 0);
      if (d[0]) d[0].pull = [0.1, ...Array(d[0].values?.length - 1).fill(0)];
      data = d;
    }
    // ── Box/Violin ──
    else if (
      [
        "box",
        "box-data",
        "grouped-box",
        "box-outliers",
        "box-styled",
        "rainbow-box",
      ].includes(ct.id)
    ) {
      data = genBox(liveData, pal);
      if (ct.id === "grouped-box")
        data = data.map((d) => ({ ...d, boxpoints: "all", jitter: 0.3 }));
      if (ct.id === "box-outliers")
        data = data.map((d) => ({ ...d, boxpoints: "outliers" }));
      if (ct.id === "rainbow-box")
        data = data.map((d, i) => ({
          ...d,
          marker: { color: pal[i % pal.length], opacity: 0.7 },
        }));
    } else if (ct.id === "hbox")
      data = genBox(liveData, pal).map((d) => ({
        ...d,
        orientation: "h",
        x: d.y,
        y: undefined,
      }));
    else if (
      ["violin", "violin-box", "violin-split", "violin-grouped"].includes(ct.id)
    ) {
      data = genViolin(liveData, pal);
      if (ct.id === "violin-box")
        data = data.map((d) => ({ ...d, box: { visible: true } }));
      if (ct.id === "violin-split") {
        data = genViolin(liveData.slice(0, 2), pal).map((d, i) => ({
          ...d,
          side: i % 2 === 0 ? "negative" : "positive",
          meanline: { visible: true },
        }));
      }
    }
    // ── Strip / ECDF ──
    else if (ct.id === "strip-chart") data = genStripChart(liveData, pal);
    else if (ct.id === "ecdf") data = genECDF(liveData, pal);
    // ── Histogram ──
    else if (
      [
        "histogram",
        "overlaid-histogram",
        "stacked-histogram",
        "styled-histogram",
        "cumulative-histogram",
        "normalized-histogram",
        "probability-histogram",
      ].includes(ct.id)
    )
      data = genHistogram(liveData, pal, ct.id);
    else if (
      ct.id === "2d-histogram-contour" ||
      ct.id === "2d-histogram-slider"
    )
      data = gen2DHistContour();
    // ── Heatmap/Contour ──
    else if (
      ["heatmap", "heatmap-categorical", "heatmap-annotated"].includes(ct.id)
    )
      data = genHeatmap(liveData, ct.id);
    else if (
      [
        "contour-simple",
        "contour-basic",
        "contour-lines",
        "contour-labels",
      ].includes(ct.id)
    )
      data = genContour(liveData, ct.id);
    else if (ct.id === "carpet")
      data = [
        {
          type: "carpet",
          a: [4, 4, 4, 4.5, 4.5, 4.5, 5, 5, 5],
          b: [1, 2, 3, 1, 2, 3, 1, 2, 3],
          y: [2, 3.5, 4, 3, 4.5, 5, 5.5, 6.5, 7.5],
          aaxis: { title: "a" },
          baxis: { title: "b" },
        },
      ];
    else if (ct.id === "contour-carpet") {
      const c = {
        type: "carpet",
        a: [0, 1, 2, 3],
        b: [0, 1],
        y: [
          [0, 0.5],
          [1, 1.5],
          [2, 2.5],
          [3, 3.5],
        ],
        aaxis: {},
        baxis: {},
      };
      data = [
        c,
        {
          type: "contourcarpet",
          a: [0, 1, 2, 3, 0, 1, 2, 3],
          b: [0, 0, 0, 0, 1, 1, 1, 1],
          z: [1, 1.5, 2, 2.5, 1.5, 2, 2.5, 3],
          carpet: "c0",
        },
      ];
    } else if (ct.id === "carpet-scatter")
      data = [
        {
          type: "carpet",
          a: [4, 4, 4, 4.5, 4.5, 4.5, 5, 5, 5],
          b: [1, 2, 3, 1, 2, 3, 1, 2, 3],
          y: [2, 3.5, 4, 3, 4.5, 5, 5.5, 6.5, 7.5],
          aaxis: {},
          baxis: {},
        },
        {
          type: "scattercarpet",
          a: [4, 4.5, 5],
          b: [1.5, 2.5, 1.5],
          mode: "markers",
          marker: { color: pal[0], size: 10 },
        },
      ];
    // ── Filled/Area ──
    else if (ct.id === "area" || ct.id === "filled-lines") {
      data = liveData.map((t: any, i: number) => {
        const c = pal[i % pal.length],
          fa = Math.round(fillOpacity * 2.55)
            .toString(16)
            .padStart(2, "0");
        return {
          ...t,
          type: "scatter",
          mode: "lines",
          fill: "tozeroy",
          fillcolor: c + fa,
          line: {
            color: c,
            width: lineWidth,
            shape: smooth ? "spline" : "linear",
          },
        };
      });
    } else if (
      ct.id === "area-stacked" ||
      ct.id === "continuous-error-filled"
    ) {
      data = liveData.map((t: any, i: number) => {
        const c = pal[i % pal.length],
          fa = Math.round(fillOpacity * 2.55)
            .toString(16)
            .padStart(2, "0");
        return {
          ...t,
          type: "scatter",
          mode: "lines",
          fill: i === 0 ? "tozeroy" : "tonexty",
          fillcolor: c + fa,
          line: { color: c, width: lineWidth },
        };
      });
    }
    // ── Error bars ──
    else if (
      [
        "error-bars",
        "horizontal-error",
        "asymmetric-error",
        "asymmetric-offset",
        "continuous-error",
      ].includes(ct.id)
    )
      data = genErrorBar(liveData, pal, ct.id);
    else if (ct.id === "bar-error")
      data = liveData.map((t: any, i: number) => ({
        type: "bar",
        name: t.name || `S${i + 1}`,
        x: t.x || ["A", "B", "C", "D"],
        y: (t.y || [10, 15, 13, 17]).map(Number),
        error_y: { type: "data", array: [1.5, 2, 1, 2.5], visible: true },
        marker: { color: pal[i % pal.length] },
      }));
    // ── Scientific ──
    else if (ct.id === "ternary" || ct.id === "soil-ternary")
      data = genTernary(liveData, pal);
    else if (
      ["parallel-basic", "parallel-coords", "parallel-advanced"].includes(ct.id)
    )
      data = genParcoords(liveData, pal);
    else if (ct.id === "parallel-categories") data = genParcats(liveData, pal);
    else if (ct.id === "splom") data = genSPLOM(liveData, pal);
    // ── Sankey ──
    else if (["sankey", "sankey-multi", "sankey-styled"].includes(ct.id)) {
      data = genSankey(liveData, pal);
      if (ct.id === "sankey-styled")
        data[0].link.color = data[0].link.color.map(
          (_: any, i: number) => pal[i % pal.length] + "aa",
        );
    }
    // ── Waterfall ──
    else if (ct.id === "waterfall" || ct.id === "waterfall-multi")
      data = genWaterfall(liveData, pal);
    // ── Candlestick / OHLC ──
    else if (
      [
        "candlestick",
        "candlestick-no-slider",
        "candlestick-annotated",
      ].includes(ct.id)
    )
      data = genCandlestick(liveData);
    else if (ct.id === "ohlc" || ct.id === "ohlc-no-slider")
      data = genOHLC(liveData);
    // ── Funnel ──
    else if (ct.id === "funnel") data = genFunnel(liveData, pal, false);
    else if (ct.id === "funnel-stacked") data = genFunnel(liveData, pal, true);
    else if (ct.id === "funnel-area") data = genFunnelArea(liveData, pal);
    // ── Time series ──
    else if (ct.id === "time-series" || ct.id === "time-series-slider")
      data = liveData.map((t: any, i: number) => ({
        ...t,
        type: "scatter",
        mode: "lines",
        line: {
          color: pal[i % pal.length],
          width: lineWidth,
          shape: smooth ? "spline" : "linear",
        },
      }));
    // ── 3D ──
    else if (ct.id === "surface3d" || ct.id === "surface3d-multi") {
      data = genSurface3D(liveData);
      if (ct.id === "surface3d-multi")
        data = [
          data[0],
          {
            ...data[0],
            z: data[0].z.map((r: number[]) =>
              r.map((v: number) => v * 0.7 + 0.5),
            ),
            opacity: 0.6,
          },
        ];
    } else if (ct.id === "mesh3d")
      data = liveData[0]?.i
        ? liveData.map((t: any) => ({
            ...t,
            type: "mesh3d",
            opacity: opacity / 100,
          }))
        : genMesh3D(pal);
    else if (ct.id === "cone3d") data = genCone3D(pal);
    else if (ct.id === "streamtube3d") data = genStreamtube(pal);
    else if (ct.id === "isosurface3d") data = genIsosurface(pal);
    else if (ct.id === "volume3d") data = genVolume(pal);
    else if (
      [
        "scatter3d",
        "ribbon3d",
        "line3d",
        "line3d-plot",
        "line3d-markers",
      ].includes(ct.id)
    ) {
      data = genScatter3D(liveData, pal, ct.mode3d || "markers");
    } else if (ct.id === "line3d-spiral") {
      const t = Array.from({ length: 100 }, (_, i) => i / 10);
      data = [
        {
          type: "scatter3d",
          mode: "lines",
          x: t.map((v) => Math.cos(v)),
          y: t.map((v) => Math.sin(v)),
          z: t,
          line: { color: pal[0], width: 4 },
        },
      ];
    } else if (ct.id === "random-walk3d") {
      let x = 0,
        y = 0,
        z = 0;
      const xs: number[] = [],
        ys: number[] = [],
        zs: number[] = [];
      for (let i = 0; i < 60; i++) {
        x += Math.random() - 0.5;
        y += Math.random() - 0.5;
        z += Math.random() - 0.5;
        xs.push(x);
        ys.push(y);
        zs.push(z);
      }
      data = [
        {
          type: "scatter3d",
          mode: "lines+markers",
          x: xs,
          y: ys,
          z: zs,
          marker: { color: pal[0], size: 4 },
          line: { color: pal[1] || pal[0], width: 2 },
        },
      ];
    }
    // ── Maps ──
    else if (
      ct.id === "choropleth" ||
      ct.id === "world-map" ||
      ct.id === "us-map"
    )
      data = genChoropleth(ct.id, pal);
    else if (
      ct.id === "scatter-geo" ||
      ct.id === "line-geo" ||
      ct.id === "bubble-map"
    )
      data = genScatterGeo(liveData, pal, ct.mode || "markers");
    else if (ct.id === "choropleth-tile")
      data = [
        {
          type: "choroplethmapbox",
          locations: ["USA", "CAN", "GBR"],
          z: [1, 2, 3],
          colorscale: "Viridis",
        },
      ];
    else if (ct.id === "scatter-mapbox")
      data = [
        {
          type: "scattermapbox",
          lat: [40.7, 51.5, 35.7],
          lon: [-74, -0.12, 139.7],
          mode: "markers",
          marker: { color: pal[0], size: 10 },
        },
      ];
    else if (ct.id === "density-mapbox")
      data = [
        {
          type: "densitymapbox",
          lat: [40.7, 40.8, 40.75, 51.5, 51.6],
          lon: [-74, -73.9, -74.1, -0.12, -0.2],
          z: [1, 2, 1.5, 3, 2],
          colorscale: "Viridis",
        },
      ];
    // ── Polar & Radar ──
    else if (ct.id === "polar-scatter" || ct.id === "polar-line")
      data = genPolarScatter(liveData, pal, ct.mode || "markers");
    else if (ct.id === "polar-bar") data = genPolarBar(liveData, pal);
    else if (ct.id === "radar" || ct.id === "radar-multi")
      data = genRadar(liveData.slice(0, ct.id === "radar" ? 1 : 3), pal);
    // ── Log ──
    else if (ct.id === "log-plots" || ct.id === "log-axes")
      data = liveData.map((t: any, i: number) => ({
        ...t,
        type: "scatter",
        mode: "lines+markers",
        marker: { color: pal[i % pal.length], size: markerSize },
        line: { color: pal[i % pal.length], width: lineWidth },
      }));
    // ── Indicator ──
    else if (
      [
        "indicator",
        "indicator-angular",
        "indicator-bullet",
        "indicator-delta",
        "indicator-number-delta",
      ].includes(ct.id)
    )
      data = genIndicator(ct.id, liveData);
    // ── Table ──
    else if (["table", "table-styled", "table-formatted"].includes(ct.id))
      data = genTable(liveData, ct.id, pal, textClr);
    // ── Default ──
    else {
      data = liveData.map((t: any, i: number) => {
        const c = pal[i % pal.length];
        const base: any = { ...t };
        base.type = ct.plotlyType;
        base.name = t.name || `S${i + 1}`;
        base.marker = {
          ...(t.marker || {}),
          color: c,
          size: ct.bubble ? (t.marker?.size ?? markerSize) : markerSize,
          opacity: opacity / 100,
          line: { color: "rgba(255,255,255,0.3)", width: borderWidth },
        };
        base.line = {
          color: c,
          width: lineWidth,
          shape: smooth ? "spline" : "linear",
        };
        if (ct.mode)
          base.mode =
            ct.mode + (showMarkers && ct.mode === "lines" ? "+markers" : "");
        else if (ct.plotlyType === "scatter") base.mode = "markers";
        else delete base.mode;
        if (ct.fill) {
          base.fill = ct.fill;
          const fa = Math.round(fillOpacity * 2.55)
            .toString(16)
            .padStart(2, "0");
          base.fillcolor = c + fa;
        } else delete base.fill;
        if (ct.hole) base.hole = ct.hole;
        else delete base.hole;
        if (ct.orientation) base.orientation = ct.orientation;
        else delete base.orientation;
        if (showLabels) {
          base.texttemplate = "%{y}";
          base.textposition = "outside";
          base.textfont = {
            size: fontSize - 1,
            color: textClr,
            family: fontFamily,
          };
          base.cliponaxis = false;
        } else {
          delete base.texttemplate;
          delete base.text;
        }
        if (ct.bubble) {
          const s = (t.y || [])
            .map(Number)
            .map((v: number) => Math.max(Math.abs(v) / 5, 5));
          base.marker = {
            ...base.marker,
            size: s,
            sizemode: "area",
            sizeref: 0.5,
          };
        }
        if (ct.id === "line-dash") {
          const dashes = ["solid", "dash", "dot", "dashdot"];
          base.line = { ...base.line, dash: dashes[i % dashes.length] };
        }
        if (ct.id === "line-shape") {
          const shapes = ["linear", "spline", "hv", "vh", "hvh", "vhv"];
          base.line = { ...base.line, shape: shapes[i % shapes.length] };
        }
        return base;
      });
    }

    // ── Layout ──
    const legendConfig: Record<string, any> = {
      bottom: {
        orientation: "h",
        x: 0.5,
        xanchor: "center",
        y: -0.22,
        yanchor: "top",
      },
      top: {
        orientation: "h",
        x: 0.5,
        xanchor: "center",
        y: 1.06,
        yanchor: "bottom",
      },
      left: { orientation: "v", x: -0.18, xanchor: "right", y: 0.5 },
      right: { orientation: "v", x: 1.04, xanchor: "left", y: 0.5 },
    };
    const is3D = ct.group === "3d";
    const isPie = ["pie", "donut", "pie-pull", "pie-styled"].includes(ct.id);
    const isHierarchy = [
      "sunburst",
      "sunburst-multi",
      "treemap",
      "treemap-nested",
      "treemap-color",
      "icicle",
      "icicle-multi",
    ].includes(ct.id);
    const isPolar = ct.group === "polar-radar";
    const isMap = ct.group === "maps";
    const isIndicatorOrTable = [
      "indicator",
      "indicator-angular",
      "indicator-bullet",
      "indicator-delta",
      "indicator-number-delta",
      "table",
      "table-styled",
      "table-formatted",
    ].includes(ct.id);
    const isNoAxes =
      [
        "ternary",
        "soil-ternary",
        "parallel-basic",
        "parallel-coords",
        "parallel-advanced",
        "parallel-categories",
        "2d-histogram-contour",
        "2d-histogram-slider",
        "sankey",
        "sankey-multi",
        "sankey-styled",
      ].includes(ct.id) ||
      isPie ||
      isPolar ||
      isHierarchy ||
      is3D ||
      isMap ||
      isIndicatorOrTable;

    const layout: any = {
      autosize: true,
      paper_bgcolor: cardBgColor,
      plot_bgcolor: cardBgColor,
      font: { family: fontFamily, size: fontSize, color: textClr },
      showlegend: showLegend,
      legend: showLegend
        ? {
            ...legendConfig[legendPos],
            font: { family: fontFamily, size: fontSize - 1, color: textClr },
            bgcolor: isCardLight
              ? "rgba(255,255,255,0.9)"
              : "rgba(15,23,42,0.7)",
            bordercolor: lineClr,
            borderwidth: 1,
          }
        : undefined,
      margin: {
        t: title ? titleSize + 35 : 30,
        b: showLegend && legendPos === "bottom" ? 80 : 50,
        l: yLabel ? 70 : 60,
        r: 20,
      },
      bargap: barGap / 100,
      barmode: ct.barmode || liveLayout?.barmode || "group",
    };
    if (title)
      layout.title = {
        text: title,
        font: { color: textClr, size: titleSize, family: fontFamily },
        x: 0.5,
      };
    if (is3D)
      layout.scene = {
        ...(liveLayout?.scene || {}),
        xaxis: {
          gridcolor: gridClr,
          tickfont: { color: textClr, size: 10 },
          backgroundcolor: cardBgColor,
        },
        yaxis: {
          gridcolor: gridClr,
          tickfont: { color: textClr, size: 10 },
          backgroundcolor: cardBgColor,
        },
        zaxis: {
          gridcolor: gridClr,
          tickfont: { color: textClr, size: 10 },
          backgroundcolor: cardBgColor,
        },
        bgcolor: cardBgColor,
      };
    if (isPolar)
      layout.polar = {
        radialaxis: {
          visible: true,
          gridcolor: gridClr,
          tickfont: { color: textClr },
        },
        angularaxis: { gridcolor: gridClr, tickfont: { color: textClr } },
        bgcolor: cardBgColor,
      };
    if (isMap) {
      layout.geo = {
        showframe: false,
        showcoastlines: true,
        projection: { type: "natural earth" },
        bgcolor: cardBgColor,
        lakecolor: cardBgColor,
        landcolor: isCardLight ? "#e5e7eb" : "#2d3748",
        oceancolor: isCardLight ? "#bfdbfe" : "#1e3a5f",
        showcountries: true,
        countrycolor: lineClr,
      };
    }
    if (!isNoAxes) {
      layout.xaxis = {
        ...(liveLayout?.xaxis || {}),
        title: xLabel
          ? { text: xLabel, font: { size: fontSize, color: textClr } }
          : undefined,
        showgrid: showGrid,
        gridcolor: gridClr,
        gridwidth: 1,
        zeroline: showZero,
        zerolinecolor: gridClr,
        zerolinewidth: 1.5,
        showticklabels: showTicks,
        tickfont: { size: fontSize - 1, color: textClr, family: fontFamily },
        tickangle: ct.id === "bar-rotated" ? -45 : xAngle,
        automargin: true,
        type:
          logX || ct.id === "log-plots" || ct.id === "log-axes"
            ? "log"
            : undefined,
        autorange: reverseX ? "reversed" : true,
        showline: true,
        linecolor: lineClr,
        linewidth: 1,
      };
      layout.yaxis = {
        ...(liveLayout?.yaxis || {}),
        title: yLabel
          ? { text: yLabel, font: { size: fontSize, color: textClr } }
          : undefined,
        showgrid: showGrid,
        gridcolor: gridClr,
        gridwidth: 1,
        zeroline: showZero,
        zerolinecolor: gridClr,
        showticklabels: showTicks,
        tickfont: { size: fontSize - 1, color: textClr, family: fontFamily },
        automargin: true,
        type:
          logY || ct.id === "log-plots" || ct.id === "log-axes"
            ? "log"
            : undefined,
        autorange: reverseY ? "reversed" : true,
        showline: true,
        linecolor: lineClr,
        linewidth: 1,
      };
    }
    if (ct.id === "stacked-histogram" || ct.id === "overlaid-histogram")
      layout.barmode = ct.id === "stacked-histogram" ? "stack" : "overlay";
    if (ct.id === "candlestick-no-slider" || ct.id === "ohlc-no-slider")
      layout.xaxis = {
        ...(layout.xaxis || {}),
        rangeslider: { visible: false },
      };
    else if (["candlestick", "candlestick-annotated", "ohlc"].includes(ct.id))
      layout.xaxis = {
        ...(layout.xaxis || {}),
        rangeslider: { visible: true },
      };
    if (ct.id === "funnel-stacked") layout.funnelmode = "stack";
    if (ct.id === "time-series-slider")
      layout.xaxis = {
        ...(layout.xaxis || {}),
        rangeslider: { visible: true },
      };

    // Guard: some type conversions may produce empty data
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("[ChartEditor] applyChart: no data for type", ct.id);
      return;
    }

    // Deep-clone to prevent Plotly from mutating our state references,
    // which causes stale-data crashes on subsequent type switches.
    let safeData: any[];
    let safeLayout: any;
    try {
      safeData = JSON.parse(JSON.stringify(data));
      safeLayout = JSON.parse(JSON.stringify(layout));
    } catch {
      safeData = data;
      safeLayout = layout;
    }

    try {
      Plotly.react(plotRef.current, safeData, safeLayout, {
        responsive: true,
        displayModeBar: false,
      });
    } catch (err) {
      console.error("[ChartEditor] Plotly.react error:", err);
      // Fallback: purge and re-plot cleanly
      try {
        Plotly.purge(plotRef.current);
        Plotly.newPlot(plotRef.current, safeData, safeLayout, {
          responsive: true,
          displayModeBar: false,
        });
      } catch (e2) {
        console.error("[ChartEditor] Plotly.newPlot fallback failed:", e2);
      }
    }
  }, [
    chartTypeId,
    paletteIdx,
    bgHex,
    showLegend,
    legendPos,
    showGrid,
    showZero,
    showTicks,
    xAngle,
    fontFamily,
    fontSize,
    titleSize,
    lineWidth,
    markerSize,
    opacity,
    barGap,
    smooth,
    showMarkers,
    showLabels,
    fillOpacity,
    borderWidth,
    xLabel,
    yLabel,
    logX,
    logY,
    reverseX,
    reverseY,
    title,
    getLiveData,
    buildPieData,
    buildHierarchyData,
    isLightBg,
  ]);

  // ── REPLACE WITH THIS (the fixed version) ───────────────────
  useEffect(() => {
    if (!mounted || !plotRef.current || !window.Plotly) return;
    // Always call applyChart — never forward the raw dark-theme layout
    // that SingleChartArea uses (transparent bg, white text).
    // On the editor's white card those colors are invisible:
    //   • paper_bgcolor / plot_bgcolor → "rgba(0,0,0,0)" = white on white
    //   • font.color → "rgba(255,255,255,0.45)" = white text on white bg
    //   • gridcolor   → "rgba(255,255,255,0.04)" = invisible grid
    // applyChart() always rebuilds layout with correct light-card colors.
    // Setting userHasEdited=true here does NOT trigger a type conversion —
    // chartTypeId is initialised from the live chart's detected type, so
    // applyChart just re-renders the same chart with proper styling.
    userHasEdited.current = true;
    applyChart();
  }, [mounted, applyChart]);
  // Note: getLiveData removed from deps — applyChart calls it internally.

  const handleExport = (fmt: string) => {
    if (!plotRef.current || !window.Plotly) return;
    window.Plotly.downloadImage(plotRef.current, {
      format: fmt as any,
      width: exportW,
      height: exportH,
      filename: (title || "chart").replace(/[^a-z0-9]/gi, "_").toLowerCase(),
    });
  };

  const handleSaveToDatabase = async () => {
    if (
      !token ||
      !isAuthenticated ||
      dbSaveStatus === "saving" ||
      dbSaveStatus === "saved"
    )
      return;
    setDbSaveStatus("saving");
    try {
      const live = getLiveData();

      // Normalises both "My Chart" (string) and {text:"My Chart"} (Plotly object)
      const rawExtract = (t: any): string => {
        if (typeof t === "string") return t.trim();
        if (typeof t?.text === "string") return t.text.trim();
        return "";
      };

      const finalTitle =
        title.trim() ||
        rawExtract(plotRef.current?.layout?.title) ||
        rawExtract(live.layout?.title) ||
        rawExtract(message?.content?.layout?.title) ||
        "Untitled Chart";

      const plotData = plotRef.current?.data ?? live.data;
      const plotLayout = plotRef.current?.layout ?? live.layout;

      const chartJson = {
        data: plotData,
        layout: {
          ...plotLayout,
          title: { text: finalTitle }, // always clean {text} form, never raw Plotly object
          _subtitle: subtitle,
          _annotations: annotations,
        },
      };

      if (existingChartId) {
        const updated = await apiUpdateChart(token, existingChartId, {
          title: finalTitle,
          chartConfig: chartJson,
        });
        updateSavedChart(updated);
      } else {
        const saved = await apiSaveChart(token, {
          title: finalTitle,
          prompt: finalTitle,
          chartConfig: chartJson,
        });
        addSavedChart(saved);
      }

      setDbSaveStatus("saved");
      setTimeout(() => setDbSaveStatus("idle"), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setDbSaveStatus("error");
      setTimeout(() => setDbSaveStatus("idle"), 3000);
    }
  };

  if (!mounted || typeof document === "undefined") return null;

  const TABS = [
    { id: "graph", label: "Graph" },
    { id: "style", label: "Style" },
    { id: "axes", label: "Axes" },
    { id: "annotate", label: "Notes" },
    { id: "export", label: "Export" },
  ] as const;
  const filteredTypes = searchQuery.trim()
    ? CHART_TYPES.filter(
        (ct) =>
          ct.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ct.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : activeGroup
      ? CHART_TYPES.filter((ct) => ct.group === activeGroup)
      : [];
  const cardBg = isLightBg ? "#1e293b" : "#ffffff";
  const outerBg = isLightBg ? "#e2e8f0" : "#1a1a1a";

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex flex-col font-sans"
      style={{ background: "#0a0a0a" }}
    >
      {/* Top Bar */}
      <div
        className="flex items-center gap-2 px-4 h-[52px] shrink-0 border-b border-[#252525]"
        style={{ background: "#1a1a1a" }}
      >
        <button
          onClick={onClose}
          className="w-[34px] h-[34px] flex items-center justify-center border border-[#333] rounded-[9px] bg-transparent cursor-pointer text-[#888] hover:text-white hover:border-[#555] transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled chart"
          className="bg-transparent border-none outline-none text-sm font-bold text-slate-200 flex-1"
        />
        <span className="text-[#666] text-base">|</span>
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Add subtitle…"
          className="bg-transparent border-none outline-none text-[13px] text-[#999] max-w-[220px]"
        />
        <button
          onClick={() => handleExport("png")}
          className="px-3 py-1.5 text-[11px] font-semibold rounded-[7px] border border-[#333] bg-[#222] text-[#ccc] cursor-pointer hover:bg-[#333] transition-colors"
        >
          PNG
        </button>
        <button
          onClick={() => handleExport("svg")}
          className="px-3 py-1.5 text-[11px] font-semibold rounded-[7px] border border-[#333] bg-[#222] text-[#ccc] cursor-pointer hover:bg-[#333] transition-colors"
        >
          SVG
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Chart Area */}
        <div
          className="flex-1 flex items-center justify-center relative p-8"
          style={{ background: outerBg }}
        >
          {isLightBg && (
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          )}
          <div
            className="relative w-full flex flex-col shadow-2xl overflow-hidden"
            style={{
              background: cardBg,
              borderRadius,
              boxShadow: isLightBg
                ? "0 28px 80px rgba(0,0,0,0.85), 0 4px 20px rgba(0,0,0,0.5)"
                : "0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.12)",
              maxWidth: "calc(100% - 0px)",
              minHeight: 480,
            }}
          >
            {(title || subtitle || showWatermark) && (
              <div
                className="flex items-start justify-between px-6 pt-5 pb-3"
                style={{
                  borderBottom: title
                    ? `1px solid ${isLightBg ? "#252525" : "#e5e7eb"}`
                    : "none",
                }}
              >
                <div>
                  {title && (
                    <h3
                      className="m-0 font-bold leading-snug"
                      style={{
                        fontSize: titleSize,
                        color: isLightBg ? "#f1f5f9" : "#111827",
                        fontFamily,
                      }}
                    >
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p
                      className="mt-1 mb-0 text-xs"
                      style={{
                        color: isLightBg ? "rgba(255,255,255,0.4)" : "#9ca3af",
                        fontFamily,
                      }}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
                {showWatermark && (
                  <span
                    className="text-[10px] font-semibold whitespace-nowrap mt-0.5"
                    style={{
                      color: isLightBg ? "rgba(255,255,255,0.15)" : "#d1d5db",
                    }}
                  >
                    ✦ Graphix
                  </span>
                )}
              </div>
            )}
            {annotations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-6 pt-2">
                {annotations.map((a, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2.5 py-0.5 rounded-full font-mono"
                    style={{
                      background: "rgba(232,255,90,0.1)",
                      color: "#E8FF5A",
                      border: "1px solid rgba(232,255,90,0.25)",
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            )}
            <div ref={plotRef} className="w-full" style={{ minHeight: 420 }} />
          </div>
        </div>

        {/* Right Panel */}
        <div
          className="w-[320px] flex flex-col shrink-0 overflow-hidden border-l border-[#252525]"
          style={{ background: "#1a1a1a" }}
        >
          {/* Tabs */}
          <div className="flex border-b border-[#252525] shrink-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className="flex-1 py-2.5 border-none bg-transparent cursor-pointer text-[9px] font-bold uppercase tracking-wider transition-colors"
                style={{
                  borderBottom:
                    tab === t.id
                      ? "2.5px solid #E8FF5A"
                      : "2.5px solid transparent",
                  color: tab === t.id ? "#E8FF5A" : "#666",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            {/* GRAPH TAB */}
            {tab === "graph" && (
              <>
                <div className="px-4 pt-3 pb-1.5">
                  <input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value) setActiveGroup(null);
                    }}
                    placeholder="Search all chart types…"
                    className="w-full px-2.5 py-[7px] text-[11px] border border-gray-200 rounded-lg bg-gray-50 outline-none"
                  />
                </div>
                {!searchQuery && (
                  <div
                    className="flex gap-1.5 px-4 pb-2 overflow-x-auto"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {CHART_GROUPS_ORDER.map((g) => {
                      const isActive = activeGroup === g.id;
                      return (
                        <button
                          key={g.id}
                          onClick={() => setActiveGroup(isActive ? null : g.id)}
                          className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer whitespace-nowrap transition-all"
                          style={{
                            border: isActive
                              ? `1.5px solid ${g.color}`
                              : "1.5px solid #e5e7eb",
                            background: isActive ? `${g.color}18` : "#fafafa",
                            color: isActive ? g.color : "#9ca3af",
                          }}
                        >
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                )}
                {(searchQuery || activeGroup) && (
                  <div className="px-4 pb-4">
                    {searchQuery && (
                      <p className="text-[10px] text-gray-400 mb-2 tracking-wide">
                        {filteredTypes.length} result
                        {filteredTypes.length !== 1 ? "s" : ""}
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-1.5">
                      {filteredTypes.map((ct) => {
                        const isActive = chartTypeId === ct.id;
                        const grpColor =
                          CHART_GROUPS_ORDER.find((g) => g.id === ct.group)
                            ?.color || "#E8FF5A";
                        return (
                          <button
                            key={ct.id}
                            onClick={() => {
                              markEdited();
                              setChartTypeId(ct.id as ChartTypeId);
                            }}
                            className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-[10px] cursor-pointer transition-all"
                            style={{
                              border: isActive
                                ? `2px solid ${grpColor}`
                                : "1.5px solid #e5e7eb",
                              background: isActive
                                ? `${grpColor}0f`
                                : "#fafafa",
                              color: isActive ? grpColor : "#6b7280",
                            }}
                          >
                            {ct.icon}
                            <span className="text-[9px] font-semibold text-center leading-tight">
                              {ct.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {!searchQuery && !activeGroup && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-[11px] text-gray-400">
                      Select a category or search to browse all{" "}
                      {CHART_TYPES.length} chart types
                    </p>
                  </div>
                )}
                <Sec title="Data Labels" open={false}>
                  <Toggle
                    label="Show values on chart"
                    value={showLabels}
                    onChange={(v) => {
                      markEdited();
                      setShowLabels(v);
                    }}
                  />
                  <Toggle
                    label="Show markers on lines"
                    value={showMarkers}
                    onChange={(v) => {
                      markEdited();
                      setShowMarkers(v);
                    }}
                  />
                </Sec>
                <Sec title="Legend" open={false}>
                  <Toggle
                    label="Show legend"
                    value={showLegend}
                    onChange={(v) => {
                      markEdited();
                      setShowLegend(v);
                    }}
                  />
                  {showLegend && (
                    <div>
                      <p className="text-[11px] text-gray-400 mt-1 mb-1.5">
                        Position
                      </p>
                      <div className="grid grid-cols-4 gap-1">
                        {(["top", "bottom", "left", "right"] as const).map(
                          (pos) => (
                            <button
                              key={pos}
                              onClick={() => {
                                markEdited();
                                setLegendPos(pos);
                              }}
                              className="py-1.5 text-[10px] font-semibold rounded-[7px] cursor-pointer capitalize transition-all"
                              style={{
                                border:
                                  legendPos === pos
                                    ? "1.5px solid #E8FF5A"
                                    : "1.5px solid #e5e7eb",
                                background:
                                  legendPos === pos
                                    ? "rgba(232,255,90,0.07)"
                                    : "#fafafa",
                                color:
                                  legendPos === pos ? "#E8FF5A" : "#9ca3af",
                              }}
                            >
                              {pos}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </Sec>
                <Sec title="Watermark" open={false}>
                  <Toggle
                    label="Show Graphix branding"
                    value={showWatermark}
                    onChange={(v) => {
                      markEdited();
                      setShowWatermark(v);
                    }}
                  />
                </Sec>
              </>
            )}

            {/* STYLE TAB */}
            {tab === "style" && (
              <>
                <Sec title="Color Palette">
                  {PALETTES.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        markEdited();
                        paletteChangedRef.current = true;
                        setPaletteIdx(i);
                      }}
                      className="w-full flex items-center gap-2.5 px-2 py-[7px] rounded-lg cursor-pointer mb-0.5 transition-all"
                      style={{
                        border:
                          paletteIdx === i
                            ? "1.5px solid #E8FF5A"
                            : "1.5px solid transparent",
                        background:
                          paletteIdx === i
                            ? "rgba(232,255,90,0.05)"
                            : "transparent",
                      }}
                    >
                      <div className="flex gap-[3px]">
                        {p.colors.slice(0, 6).map((c, j) => (
                          <span
                            key={j}
                            className="w-3.5 h-3.5 rounded-[3px] block"
                            style={{ background: c }}
                          />
                        ))}
                      </div>
                      <span
                        className="text-xs font-medium flex-1 text-left"
                        style={{
                          color: paletteIdx === i ? "#E8FF5A" : "#374151",
                        }}
                      >
                        {p.label}
                      </span>
                      {paletteIdx === i && (
                        <span className="text-cyan-500 text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </Sec>
                <Sec title="Background">
                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {BG_PRESETS.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          markEdited();
                          setBgHex(b.hex);
                        }}
                        className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-[9px] cursor-pointer transition-all"
                        style={{
                          border:
                            bgHex === b.hex
                              ? "2px solid #E8FF5A"
                              : "1.5px solid #e5e7eb",
                          background:
                            bgHex === b.hex
                              ? "rgba(232,255,90,0.05)"
                              : "#fafafa",
                        }}
                      >
                        <span
                          className="w-6 h-6 rounded-[6px] block border border-gray-300"
                          style={{ background: b.hex }}
                        />
                        <span
                          className="text-[9.5px] font-semibold"
                          style={{
                            color: bgHex === b.hex ? "#E8FF5A" : "#9ca3af",
                          }}
                        >
                          {b.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] text-gray-400 w-[74px] shrink-0">
                      Custom
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="color"
                        value={customBg}
                        onChange={(e) => {
                          markEdited();
                          setCustomBg(e.target.value);
                          setBgHex(e.target.value);
                        }}
                        className="w-8 h-8 border border-gray-200 rounded-[7px] cursor-pointer p-0.5"
                      />
                      <span className="text-[11px] text-gray-400 font-mono">
                        {customBg.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </Sec>
                <Sec title="Typography">
                  <div className="mb-2.5">
                    <p className="text-[11px] text-gray-400 mb-1.5">
                      Font family
                    </p>
                    <select
                      value={fontFamily}
                      onChange={(e) => {
                        markEdited();
                        setFontFamily(e.target.value);
                      }}
                      className="w-full px-2.5 py-[7px] text-[11px] border border-gray-200 rounded-lg bg-gray-50 text-gray-900 outline-none"
                    >
                      {FONTS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Slider
                    label="Base font size"
                    value={fontSize}
                    min={8}
                    max={18}
                    unit="px"
                    onChange={(v) => {
                      markEdited();
                      setFontSize(v);
                    }}
                  />
                  <Slider
                    label="Title font size"
                    value={titleSize}
                    min={12}
                    max={36}
                    unit="px"
                    onChange={(v) => {
                      markEdited();
                      setTitleSize(v);
                    }}
                  />
                </Sec>
                <Sec title="Marks & Lines" open={false}>
                  <Slider
                    label="Opacity"
                    value={opacity}
                    min={20}
                    max={100}
                    unit="%"
                    onChange={(v) => {
                      markEdited();
                      setOpacity(v);
                    }}
                  />
                  <Slider
                    label="Line width"
                    value={lineWidth}
                    min={1}
                    max={8}
                    onChange={(v) => {
                      markEdited();
                      setLineWidth(v);
                    }}
                  />
                  <Slider
                    label="Marker size"
                    value={markerSize}
                    min={3}
                    max={20}
                    onChange={(v) => {
                      markEdited();
                      setMarkerSize(v);
                    }}
                  />
                  <Slider
                    label="Bar gap"
                    value={barGap}
                    min={0}
                    max={60}
                    unit="%"
                    onChange={(v) => {
                      markEdited();
                      setBarGap(v);
                    }}
                  />
                  <Slider
                    label="Fill opacity"
                    value={fillOpacity}
                    min={5}
                    max={80}
                    unit="%"
                    onChange={(v) => {
                      markEdited();
                      setFillOpacity(v);
                    }}
                  />
                  <Slider
                    label="Border width"
                    value={borderWidth}
                    min={0}
                    max={5}
                    onChange={(v) => {
                      markEdited();
                      setBorderWidth(v);
                    }}
                  />
                  <Toggle
                    label="Smooth curves (spline)"
                    value={smooth}
                    onChange={(v) => {
                      markEdited();
                      setSmooth(v);
                    }}
                  />
                </Sec>
                <Sec title="Card" open={false}>
                  <Slider
                    label="Border radius"
                    value={borderRadius}
                    min={0}
                    max={28}
                    unit="px"
                    onChange={(v) => {
                      markEdited();
                      setBorderRadius(v);
                    }}
                  />
                </Sec>
              </>
            )}

            {/* AXES TAB */}
            {tab === "axes" && (
              <>
                <Sec title="Axis Labels">
                  <div className="mb-2.5">
                    <p className="text-[11px] text-gray-400 mb-1.5">
                      X-Axis label
                    </p>
                    <TxtInput
                      value={xLabel}
                      onChange={(v) => {
                        markEdited();
                        setXLabel(v);
                      }}
                      placeholder="e.g. Month"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 mb-1.5">
                      Y-Axis label
                    </p>
                    <TxtInput
                      value={yLabel}
                      onChange={(v) => {
                        markEdited();
                        setYLabel(v);
                      }}
                      placeholder="e.g. Revenue ($)"
                    />
                  </div>
                </Sec>
                <Sec title="Grid & Lines">
                  <Toggle
                    label="Show grid lines"
                    value={showGrid}
                    onChange={(v) => {
                      markEdited();
                      setShowGrid(v);
                    }}
                  />
                  <Toggle
                    label="Show zero line"
                    value={showZero}
                    onChange={(v) => {
                      markEdited();
                      setShowZero(v);
                    }}
                  />
                  <Toggle
                    label="Show tick labels"
                    value={showTicks}
                    onChange={(v) => {
                      markEdited();
                      setShowTicks(v);
                    }}
                  />
                </Sec>
                <Sec title="Scale">
                  <Toggle
                    label="Log scale — X axis"
                    value={logX}
                    onChange={(v) => {
                      markEdited();
                      setLogX(v);
                    }}
                  />
                  <Toggle
                    label="Log scale — Y axis"
                    value={logY}
                    onChange={(v) => {
                      markEdited();
                      setLogY(v);
                    }}
                  />
                  <Toggle
                    label="Reverse X axis"
                    value={reverseX}
                    onChange={(v) => {
                      markEdited();
                      setReverseX(v);
                    }}
                  />
                  <Toggle
                    label="Reverse Y axis"
                    value={reverseY}
                    onChange={(v) => {
                      markEdited();
                      setReverseY(v);
                    }}
                  />
                </Sec>
                <Sec title="X-Axis Rotation" open={false}>
                  <Slider
                    label="Tick angle"
                    value={xAngle}
                    min={-90}
                    max={90}
                    unit="°"
                    onChange={(v) => {
                      markEdited();
                      setXAngle(v);
                    }}
                  />
                </Sec>
              </>
            )}

            {/* ANNOTATE TAB */}
            {tab === "annotate" && (
              <>
                <Sec title="Title & Subtitle">
                  <div className="mb-2.5">
                    <p className="text-[11px] text-gray-400 mb-1.5">
                      Chart title
                    </p>
                    <TxtInput
                      value={title}
                      onChange={setTitle}
                      placeholder="Add a title…"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 mb-1.5">Subtitle</p>
                    <TxtInput
                      value={subtitle}
                      onChange={setSubtitle}
                      placeholder="Optional subtitle…"
                    />
                  </div>
                </Sec>
                <Sec title="Annotation Labels">
                  <div className="flex gap-1.5 mb-2.5">
                    <input
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newNote.trim()) {
                          setAnnotations((a) => [...a, newNote.trim()]);
                          setNewNote("");
                        }
                      }}
                      placeholder="e.g. Peak Q3 · Enter to add"
                      className="flex-1 px-2.5 py-[7px] text-[11px] border border-gray-200 rounded-lg bg-gray-50 outline-none"
                    />
                    <button
                      onClick={() => {
                        if (newNote.trim()) {
                          setAnnotations((a) => [...a, newNote.trim()]);
                          setNewNote("");
                        }
                      }}
                      className="px-3 py-[7px] text-xs font-bold rounded-lg border-none bg-cyan-500 text-white cursor-pointer hover:bg-cyan-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  {annotations.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-2.5 py-[7px] rounded-lg bg-gray-50 border border-gray-200 mb-1.5"
                    >
                      <span className="text-[11px] text-gray-700">{a}</span>
                      <button
                        onClick={() =>
                          setAnnotations((an) => an.filter((_, j) => j !== i))
                        }
                        className="border-none bg-transparent text-gray-300 cursor-pointer text-sm p-0 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </Sec>
              </>
            )}

            {/* EXPORT TAB */}
            {tab === "export" && (
              <>
                <Sec title="Dimensions">
                  <div className="mb-2.5">
                    <p className="text-[11px] text-gray-400 mb-1.5">Width px</p>
                    <input
                      type="number"
                      value={exportW}
                      onChange={(e) => setExportW(Number(e.target.value))}
                      className="w-full px-2.5 py-[7px] text-[11px] border border-gray-200 rounded-lg bg-gray-50 outline-none font-mono"
                    />
                  </div>
                  <div className="mb-2.5">
                    <p className="text-[11px] text-gray-400 mb-1.5">
                      Height px
                    </p>
                    <input
                      type="number"
                      value={exportH}
                      onChange={(e) => setExportH(Number(e.target.value))}
                      className="w-full px-2.5 py-[7px] text-[11px] border border-gray-200 rounded-lg bg-gray-50 outline-none font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {[
                      { l: "Square", w: 800, h: 800 },
                      { l: "Landscape", w: 1200, h: 700 },
                      { l: "Portrait", w: 700, h: 1000 },
                      { l: "4K UHD", w: 3840, h: 2160 },
                      { l: "Twitter", w: 1200, h: 675 },
                      { l: "Instagram", w: 1080, h: 1080 },
                      { l: "Slide 16:9", w: 1920, h: 1080 },
                      { l: "Slide 4:3", w: 1024, h: 768 },
                    ].map((p) => {
                      const active = exportW === p.w && exportH === p.h;
                      return (
                        <button
                          key={p.l}
                          onClick={() => {
                            setExportW(p.w);
                            setExportH(p.h);
                          }}
                          className="py-[7px] px-1.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-all text-left"
                          style={{
                            border: active
                              ? "1.5px solid #E8FF5A"
                              : "1.5px solid #e5e7eb",
                            background: active
                              ? "rgba(232,255,90,0.06)"
                              : "#fafafa",
                            color: active ? "#E8FF5A" : "#6b7280",
                          }}
                        >
                          {p.l}
                          <span className="block text-[9px] text-gray-400 font-mono mt-0.5">
                            {p.w}×{p.h}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Sec>
                <Sec title="Download">
                  <div className="flex flex-col gap-2">
                    {[
                      {
                        fmt: "png",
                        label: "PNG",
                        desc: "Best for web & docs",
                        primary: true,
                      },
                      {
                        fmt: "svg",
                        label: "SVG",
                        desc: "Vector, infinite scale",
                        primary: false,
                      },
                      {
                        fmt: "jpeg",
                        label: "JPEG",
                        desc: "Compressed, smaller",
                        primary: false,
                      },
                    ].map(({ fmt, label, desc, primary }) => (
                      <button
                        key={fmt}
                        onClick={() => handleExport(fmt)}
                        className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] cursor-pointer text-left transition-all hover:opacity-90"
                        style={{
                          border: primary ? "none" : "1.5px solid #e5e7eb",
                          background: primary
                            ? "linear-gradient(135deg,#E8FF5A,#E8FF5A)"
                            : "#fafafa",
                          color: primary ? "#fff" : "#374151",
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <div>
                          <div className="text-xs font-bold">
                            Download {label}
                          </div>
                          <div className="text-[10px] opacity-65 mt-0.5">
                            {desc}
                          </div>
                        </div>
                        <span className="ml-auto text-[9px] font-mono opacity-50">
                          {exportW}×{exportH}
                        </span>
                      </button>
                    ))}
                    <button
                      onClick={handleSaveToDatabase}
                      disabled={!isAuthenticated || dbSaveStatus === "saving"}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] text-left transition-all hover:opacity-90"
                      style={{
                        border:
                          dbSaveStatus === "saved"
                            ? "1.5px solid #E8FF5A"
                            : "1.5px solid #e5e7eb",
                        background:
                          dbSaveStatus === "saved"
                            ? "rgba(232,255,90,0.08)"
                            : "#fafafa",
                        color: dbSaveStatus === "saved" ? "#E8FF5A" : "#374151",
                        cursor:
                          !isAuthenticated ||
                          dbSaveStatus === "saving" ||
                          dbSaveStatus === "saved"
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          !isAuthenticated || dbSaveStatus === "saving"
                            ? 0.65
                            : 1,
                      }}
                    >
                      {dbSaveStatus === "saving" ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          style={{
                            animation: "spin 1s linear infinite",
                            flexShrink: 0,
                          }}
                        >
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      ) : dbSaveStatus === "saved" ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#E8FF5A"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          style={{ flexShrink: 0 }}
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          style={{ flexShrink: 0 }}
                        >
                          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                          <polyline points="17 21 17 13 7 13 7 21" />
                          <polyline points="7 3 7 8 15 8" />
                        </svg>
                      )}
                      <div>
                        <div className="text-xs font-bold">
                          {dbSaveStatus === "saving"
                            ? "Saving…"
                            : dbSaveStatus === "saved"
                              ? existingChartId
                                ? "Chart Updated ✓"
                                : "Saved to My Graphs ✓"
                              : dbSaveStatus === "error"
                                ? "Save failed — retry"
                                : existingChartId
                                  ? "Update Chart"
                                  : "Save to My Graphs"}
                        </div>
                        <div className="text-[10px] opacity-65 mt-0.5">
                          {isAuthenticated
                            ? existingChartId
                              ? "Overwrites the saved version"
                              : "Appears in your dashboard"
                            : "Sign in to save"}
                        </div>
                      </div>
                    </button>
                  </div>
                </Sec>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
  