"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ChartSubtype {
  label: string;
  prompt: string | null;
}
interface ChartGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  subtypes: ChartSubtype[];
}

const Icons = {
  LineScatter: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <polyline
        points="1,12 4,7 7,9 10,4 13,6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="4" cy="7" r="1.2" fill="currentColor" />
      <circle cx="10" cy="4" r="1.2" fill="currentColor" />
      <circle cx="13" cy="6" r="1.2" fill="currentColor" />
    </svg>
  ),
  Bar: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="1"
        y="7"
        width="3"
        height="7"
        rx="0.5"
        fill="currentColor"
        opacity="0.5"
      />
      <rect
        x="5.5"
        y="4"
        width="3"
        height="10"
        rx="0.5"
        fill="currentColor"
        opacity="0.7"
      />
      <rect
        x="10"
        y="2"
        width="3"
        height="12"
        rx="0.5"
        fill="currentColor"
        opacity="0.95"
      />
      <line
        x1="0.5"
        y1="14.5"
        x2="14.5"
        y2="14.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.3"
      />
    </svg>
  ),
  PieBubble: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 8 L8 1.5 A6.5 6.5 0 0 1 14.5 8 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M8 8 L14.5 8 A6.5 6.5 0 0 1 3.5 13.2 Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M8 8 L3.5 13.2 A6.5 6.5 0 0 1 8 1.5 Z"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  ),
  Statistical: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="4"
        y="5"
        width="8"
        height="6"
        rx="0.5"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
      />
      <line
        x1="8"
        y1="5"
        x2="8"
        y2="11"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <line
        x1="4"
        y1="8"
        x2="2"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="8"
        x2="14"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="6.5"
        x2="2"
        y2="9.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="14"
        y1="6.5"
        x2="14"
        y2="9.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  ),
  Histogram: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="1"
        y="9"
        width="2.5"
        height="5"
        rx="0.3"
        fill="currentColor"
        opacity="0.4"
      />
      <rect
        x="4"
        y="6"
        width="2.5"
        height="8"
        rx="0.3"
        fill="currentColor"
        opacity="0.65"
      />
      <rect
        x="7"
        y="3"
        width="2.5"
        height="11"
        rx="0.3"
        fill="currentColor"
        opacity="0.9"
      />
      <rect
        x="10"
        y="5"
        width="2.5"
        height="9"
        rx="0.3"
        fill="currentColor"
        opacity="0.65"
      />
      <rect
        x="13"
        y="8"
        width="2.5"
        height="6"
        rx="0.3"
        fill="currentColor"
        opacity="0.4"
      />
    </svg>
  ),
  FilledError: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M1 11 Q4 6 7 8 Q10 10 14 4 L14 13 Q10 14 7 12 Q4 12 1 14 Z"
        fill="currentColor"
        opacity="0.2"
      />
      <polyline
        points="1,11 4,7 7,8 10,5 14,4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  ContourHeat: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="1"
        y="1"
        width="3.2"
        height="3.2"
        rx="0.3"
        fill="currentColor"
        opacity="0.12"
      />
      <rect
        x="4.9"
        y="1"
        width="3.2"
        height="3.2"
        rx="0.3"
        fill="currentColor"
        opacity="0.4"
      />
      <rect
        x="8.8"
        y="1"
        width="3.2"
        height="3.2"
        rx="0.3"
        fill="currentColor"
        opacity="0.8"
      />
      <rect
        x="1"
        y="4.9"
        width="3.2"
        height="3.2"
        rx="0.3"
        fill="currentColor"
        opacity="0.4"
      />
      <rect
        x="4.9"
        y="4.9"
        width="3.2"
        height="3.2"
        rx="0.3"
        fill="currentColor"
        opacity="0.95"
      />
      <rect
        x="8.8"
        y="4.9"
        width="3.2"
        height="3.2"
        rx="0.3"
        fill="currentColor"
        opacity="0.55"
      />
      <rect
        x="1"
        y="8.8"
        width="3.2"
        height="3.2"
        rx="0.3"
        fill="currentColor"
        opacity="0.65"
      />
      <rect
        x="4.9"
        y="8.8"
        width="3.2"
        height="3.2"
        rx="0.3"
        fill="currentColor"
        opacity="0.35"
      />
      <rect
        x="8.8"
        y="8.8"
        width="3.2"
        height="3.2"
        rx="0.3"
        fill="currentColor"
        opacity="0.15"
      />
    </svg>
  ),
  Scientific: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <polygon
        points="8,1.5 14.5,13.5 1.5,13.5"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
        strokeLinejoin="round"
      />
      <line
        x1="4.75"
        y1="9.5"
        x2="11.25"
        y2="9.5"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeOpacity="0.45"
      />
      <line
        x1="6.4"
        y1="6.5"
        x2="9.6"
        y2="6.5"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeOpacity="0.3"
      />
      <circle cx="8" cy="9.5" r="1.1" fill="currentColor" />
      <circle cx="5.5" cy="12.5" r="0.8" fill="currentColor" opacity="0.55" />
      <circle cx="11" cy="11" r="0.8" fill="currentColor" opacity="0.55" />
    </svg>
  ),
  Financial: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <line
        x1="3"
        y1="2.5"
        x2="3"
        y2="13.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
      <rect
        x="1.5"
        y="5"
        width="3"
        height="5"
        rx="0.4"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <line
        x1="8"
        y1="1.5"
        x2="8"
        y2="12.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
      <rect
        x="6.5"
        y="3.5"
        width="3"
        height="4.5"
        rx="0.4"
        fill="currentColor"
        opacity="0.9"
      />
      <line
        x1="13"
        y1="3.5"
        x2="13"
        y2="14.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
      <rect
        x="11.5"
        y="6"
        width="3"
        height="6"
        rx="0.4"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  ),
  ThreeD: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1.5 L14 5 L14 11.5 L8 15 L2 11.5 L2 5 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinejoin="round"
        strokeOpacity="0.6"
      />
      <line
        x1="8"
        y1="1.5"
        x2="8"
        y2="15"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeOpacity="0.3"
      />
      <line
        x1="2"
        y1="5"
        x2="14"
        y2="5"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeOpacity="0.3"
      />
      <circle cx="8" cy="8.5" r="1.6" fill="currentColor" opacity="0.9" />
      <circle cx="5" cy="11.5" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="11.5" cy="7" r="0.8" fill="currentColor" opacity="0.5" />
    </svg>
  ),
};

const CHART_GROUPS: ChartGroup[] = [
  {
    id: "line-scatter",
    label: "Line & Scatter",
    icon: <Icons.LineScatter />,
    description: "Trends, correlations, time series",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Line & Scatter Plot", prompt: "Line and Scatter Plot" },
      {
        label: "Data Labels Hover",
        prompt: "Line and Scatter Plot Data Labels Hover",
      },
      {
        label: "Line with Data Labels",
        prompt: "Line chart Data Labels on The Plot",
      },
      {
        label: "Scatter + Color Dimension",
        prompt: "Scatter Plot with a Color Dimension",
      },
      { label: "Grouped Scatter", prompt: "Grouped Scatter Plot" },
      { label: "Basic Line Plot", prompt: "Basic Line Plot" },
      { label: "Named Lines", prompt: "Adding Names to Line and Scatter Plot" },
      { label: "Stylized Line & Scatter", prompt: "Line and Scatter Stylized" },
      { label: "Styled Line Plot", prompt: "Styling Line Plot" },
      { label: "Colored Scatter", prompt: "Colored and Styled Scatter Plot" },
      {
        label: "Line Shape Interpolation",
        prompt: "Line Shape Options for Interpolation",
      },
      { label: "Line Dash", prompt: "Line Dash" },
      { label: "Connect Gaps", prompt: "line chart Connect Gaps Between Data" },
      { label: "Annotated Lines", prompt: "Labelling Lines with Annotations" },
    ],
  },
  {
    id: "bar",
    label: "Bar Charts",
    icon: <Icons.Bar />,
    description: "Comparisons, rankings, categories",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Basic Bar Chart", prompt: "Basic Bar Chart" },
      { label: "Grouped Bar", prompt: "Grouped Bar Chart" },
      { label: "Stacked Bar", prompt: "Stacked Bar Chart" },
      { label: "Bar with Hover Text", prompt: "Bar Chart with Hover Text" },
      {
        label: "Bar with Direct Labels",
        prompt: "Bar Chart with Direct Labels",
      },
      {
        label: "Grouped Bar Direct Labels",
        prompt: "Grouped Bar Chart with Direct Labels",
      },
      { label: "Rotated Labels", prompt: "Bar Chart with Rotated Labels" },
      {
        label: "Custom Bar Colors",
        prompt: "Customizing Individual Bar Colors",
      },
      { label: "Custom Bar Base", prompt: "Customizing Individual Bar Base" },
      { label: "Colored & Styled Bar", prompt: "Colored and Styled Bar Chart" },
      { label: "Relative Barmode", prompt: "Bar Chart with Relative Barmode" },
    ],
  },
  {
    id: "pie-bubble",
    label: "Pie & Bubble",
    icon: <Icons.PieBubble />,
    description: "Proportions, distributions, sizes",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Basic Pie Chart", prompt: "Basic Pie Chart" },
      { label: "Donut Chart", prompt: "Donut Chart" },
      { label: "Bubble Chart", prompt: "bubble chart" },
      { label: "Bubble Marker Size", prompt: "Marker Size on Bubble Charts" },
      {
        label: "Bubble Size + Color",
        prompt: "Marker Size and Color on Bubble Charts",
      },
      { label: "Bubble Hover Text", prompt: "Hover Text on Bubble Charts" },
      { label: "Bubble Size Scaling", prompt: "Bubble Size Scaling on Charts" },
      {
        label: "Marker Array (Beautiful)",
        prompt: "Marker Size, Color, and Symbol as an Array",
      },
    ],
  },
  {
    id: "statistical",
    label: "Statistical",
    icon: <Icons.Statistical />,
    description: "Distributions, errors, outliers",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Symmetric Error Bars", prompt: "Basic Symmetric Error Bars" },
      { label: "Bar with Error Bars", prompt: "Bar Chart with Error Bars" },
      { label: "Horizontal Error Bars", prompt: "Horizontal Error Bars" },
      { label: "Asymmetric Error Bars", prompt: "Asymmetric Error Bars" },
      { label: "Styled Error Bars", prompt: "Colored and Styled Error Bars" },
      { label: "Basic Box Plot", prompt: "Basic Box Plot" },
      {
        label: "Box + Underlying Data",
        prompt: "Box Plot That Displays the Underlying Data",
      },
      { label: "Horizontal Box Plot", prompt: "Horizontal Box Plot" },
      { label: "Grouped Box Plot", prompt: "Grouped Box Plot" },
      { label: "Box Styled Outliers", prompt: "Box Plot Styling Outliers" },
      { label: "Fully Styled Box Plot", prompt: "Fully Styled Box Plot" },
      { label: "Rainbow Box Plot", prompt: "Rainbow Box Plot" },
    ],
  },
  {
    id: "histogram",
    label: "Histograms",
    icon: <Icons.Histogram />,
    description: "Frequency, distribution, density",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Basic Histogram", prompt: "Basic Histogram" },
      { label: "Overlaid Histogram", prompt: "Overlaid Histogram" },
      { label: "Stacked Histograms", prompt: "Stacked Histograms" },
      { label: "Styled Histogram", prompt: "Colored and Styled Histograms" },
      { label: "Cumulative Histogram", prompt: "Cumulative Histogram" },
      { label: "Normalized Histogram", prompt: "Normalized Histogram" },
      {
        label: "2D Histogram Contour",
        prompt: "2D Histogram Contour Plot with Histogram Subplots",
      },
      {
        label: "2D Histogram + Slider",
        prompt: "2D Histogram Contour Plot with Slider Control",
      },
    ],
  },
  {
    id: "filled-error",
    label: "Filled & Error",
    icon: <Icons.FilledError />,
    description: "Confidence bands, filled areas",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Filled Lines", prompt: "Filled Lines" },
      {
        label: "Continuous Error Filled",
        prompt: "Continuous Error Bars Filled Lines",
      },
      {
        label: "Asymmetric + Offset",
        prompt: "Asymmetric Error Bars with a Constant Offset",
      },
      { label: "Continuous Error Bars", prompt: "Continuous Error Bars" },
    ],
  },
  {
    id: "contour-heat",
    label: "Contour & Heat",
    icon: <Icons.ContourHeat />,
    description: "Density, intensity, 2D patterns",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Simple Contour", prompt: "Simple Contour Plot" },
      { label: "Basic Contour", prompt: "Basic Contour Plot" },
      { label: "Contour Lines", prompt: "Contour Lines" },
      { label: "Contour Labels", prompt: "Contour Line Labels" },
      { label: "Basic Heatmap", prompt: "Basic Heatmap" },
      {
        label: "Categorical Heatmap",
        prompt: "Heatmap with Categorical Axis Labels",
      },
      { label: "Annotated Heatmap", prompt: "Annotated Heatmap" },
    ],
  },
  {
    id: "scientific",
    label: "Scientific",
    icon: <Icons.Scientific />,
    description: "Ternary, parallel coords, log scales",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Ternary + Markers", prompt: "Basic Ternary Plot with Markers" },
      { label: "Soil Types Ternary", prompt: "Soil Types Ternary Plot" },
      {
        label: "Basic Parallel Coords",
        prompt: "Basic Parallel Coordinates Plot",
      },
      { label: "Parallel Coordinates", prompt: "Parallel Coordinates Plot" },
      {
        label: "Advanced Parallel Coords",
        prompt: "Advanced Parallel Coordinates Plot",
      },
      { label: "Log Plots", prompt: "Log Plots" },
      { label: "Logarithmic Axes", prompt: "Logarithmic Axes" },
    ],
  },
  {
    id: "financial",
    label: "Financial",
    icon: <Icons.Financial />,
    description: "Candlestick, waterfall, funnel, time series",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Basic Waterfall", prompt: "Basic Waterfall Chart" },
      {
        label: "Multi-Category Waterfall",
        prompt: "Multi Category Waterfall Chart",
      },
      { label: "Styled Waterfall", prompt: "Style Waterfall Chart" },
      { label: "Simple Candlestick", prompt: "Simple Candlestick Chart" },
      {
        label: "Candlestick No Slider",
        prompt: "Candlestick Chart without Rangeslider",
      },
      {
        label: "Candlestick + Annotations",
        prompt: "Customise Candlestick Chart with Shapes and Annotations",
      },
      {
        label: "Candlestick + Rangeselector",
        prompt: "Candlestick Charts Add Rangeselector",
      },
      { label: "Basic Funnel", prompt: "Basic Funnel Plot" },
      {
        label: "Funnel + Marker Style",
        prompt: "Funnel Plot Setting Marker Size and Color",
      },
      { label: "Stacked Funnel", prompt: "Stacked Funnel" },
      {
        label: "Time Series + Rangeslider",
        prompt: "Time Series with Rangeslider",
      },
      { label: "Basic Time Series", prompt: "Basic Time Series" },
    ],
  },
  {
    id: "3d",
    label: "3D Charts",
    icon: <Icons.ThreeD />,
    description: "Three-dimensional visualizations",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "3D Scatter", prompt: "3D Scatter Plot" },
      { label: "Basic Ribbon Plot", prompt: "Basic Ribbon Plot" },
      { label: "3D Ribbon Plot", prompt: "Basic Ribbon Plot 3d" },
      {
        label: "Topographical Surface",
        prompt: "Topographical 3D Surface Plot",
      },
      { label: "Multiple 3D Surfaces", prompt: "Multiple 3D Surface Plots" },
      { label: "3D Mesh Plot", prompt: "Simple 3D Mesh Plot" },
      { label: "3D Line Chart", prompt: "3D line chart" },
      { label: "3D Mesh Tetrahedron", prompt: "3D Mesh Tetrahedron" },
      { label: "3D Line Plot", prompt: "3D Line Plot" },
      { label: "3D Line + Markers", prompt: "3D Line + Markers Plot" },
      { label: "3D Line Spiral", prompt: "3D Line Spiral Plot" },
      { label: "3D Random Walk", prompt: "3D Random Walk Plot" },
    ],
  },
];

const TOTAL_TYPES = CHART_GROUPS.reduce((s, g) => s + g.subtypes.length - 1, 0);
const DEMO_TEXT = "Show me a 3D scatter of sales vs. engagement by region";

// ─── Step Components (unchanged logic, same props) ───────────────────────────

function StepInput({ active }: { active: boolean }) {
  const [typed, setTyped] = useState("");
  const [cursorOn, setCursorOn] = useState(true);
  useEffect(() => {
    if (!active) {
      setTyped("");
      return;
    }
    let i = 0;
    setTyped("");
    const blinkId = setInterval(() => setCursorOn((c) => !c), 530);
    const typeId = setInterval(() => {
      i++;
      setTyped(DEMO_TEXT.slice(0, i));
      if (i >= DEMO_TEXT.length) clearInterval(typeId);
    }, 36);
    return () => {
      clearInterval(typeId);
      clearInterval(blinkId);
    };
  }, [active]);

  return (
    <div
      className="rounded-2xl border border-white/10 bg-white overflow-hidden"
      style={{
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.7)",
      }}
    >
      <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-50 border-b border-zinc-100">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <div className="flex-1 mx-3 h-5 rounded bg-white border border-zinc-200 flex items-center px-2 gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
          <span className="font-mono text-[10px] text-zinc-400">
            app.graphai.io
          </span>
        </div>
      </div>
      <div
        className="h-44 flex items-center justify-center"
        style={{
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(0,0,0,0.04) 39px,rgba(0,0,0,0.04) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(0,0,0,0.04) 39px,rgba(0,0,0,0.04) 40px)",
        }}
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center mx-auto mb-2">
            <span className="text-xl text-zinc-300">◈</span>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono">
            Your chart will appear here
          </p>
        </div>
      </div>
      <div className="p-3 border-t border-zinc-100">
        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-500 text-[11px] font-mono whitespace-nowrap shadow-sm">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <rect
                x="1"
                y="1"
                width="10"
                height="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M4 6h4M6 4v4"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            Add CSV
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-500 text-[11px] font-mono whitespace-nowrap shadow-sm">
            <span>⬡</span> Chart Type
          </button>
          <div className="flex-1 font-mono text-[12px] text-zinc-700 min-w-0 flex items-center gap-px">
            <span>{typed}</span>
            {active && (
              <span
                className={`inline-block w-[1.5px] h-3.5 bg-zinc-800 transition-opacity ${cursorOn ? "opacity-100" : "opacity-0"}`}
              />
            )}
            {!typed && !active && (
              <span className="text-zinc-300">
                Write your request or add a CSV…
              </span>
            )}
          </div>
          <button className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 6h10M7 2l4 4-4 4"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function StepSelector({ active }: { active: boolean }) {
  const [activeGroup, setActiveGroup] = useState<ChartGroup | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    if (!active) {
      setActiveGroup(null);
      setSelected(null);
      return;
    }
    const t1 = setTimeout(() => setActiveGroup(CHART_GROUPS[9]), 500);
    const t2 = setTimeout(() => setSelected("3D Scatter"), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active]);

  return (
    <div
      className="rounded-2xl border border-white/10 bg-white overflow-hidden"
      style={{
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.7)",
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-b border-zinc-100">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-[10px] text-zinc-500">
            Select chart type
          </span>
        </div>
        <span className="font-mono text-[10px] text-zinc-400">
          {CHART_GROUPS.length} categories · {TOTAL_TYPES} types
        </span>
      </div>
      <div className="flex" style={{ height: 360 }}>
        <div className="w-44 flex-shrink-0 border-r border-zinc-100 overflow-y-auto bg-zinc-50 py-1">
          {CHART_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() =>
                setActiveGroup(activeGroup?.id === g.id ? null : g)
              }
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left transition-all duration-150 border-l-2 ${activeGroup?.id === g.id ? "bg-white border-l-zinc-800" : "border-l-transparent hover:bg-white/80 hover:border-l-zinc-300"}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 flex-shrink-0 flex items-center justify-center text-zinc-400">
                  {g.icon}
                </span>
                <div className="min-w-0">
                  <div
                    className={`text-[11px] font-semibold truncate ${activeGroup?.id === g.id ? "text-zinc-900" : "text-zinc-500"}`}
                  >
                    {g.label}
                  </div>
                  <div className="text-[9px] text-zinc-400 mt-0.5 font-mono">
                    {g.subtypes.length - 1} types
                  </div>
                </div>
              </div>
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
                className={`flex-shrink-0 transition-transform duration-150 ${activeGroup?.id === g.id ? "rotate-90" : ""}`}
              >
                <path
                  d="M2 1.5l3 2.5-3 2.5"
                  stroke={activeGroup?.id === g.id ? "#27272a" : "#d4d4d8"}
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-3 bg-white">
          {!activeGroup ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-zinc-300">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                className="text-zinc-200"
              >
                <rect
                  x="4"
                  y="10"
                  width="8"
                  height="20"
                  rx="1"
                  fill="currentColor"
                  opacity="0.4"
                />
                <rect
                  x="16"
                  y="6"
                  width="8"
                  height="24"
                  rx="1"
                  fill="currentColor"
                  opacity="0.65"
                />
                <rect
                  x="28"
                  y="14"
                  width="8"
                  height="16"
                  rx="1"
                  fill="currentColor"
                  opacity="0.3"
                />
              </svg>
              <span className="text-xs font-mono text-zinc-400 text-center">
                Select a category
                <br />
                to see all chart types
              </span>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between px-1 pb-3 mb-2 border-b border-zinc-100">
                <div>
                  <div className="text-xs font-bold text-zinc-900">
                    {activeGroup.icon} {activeGroup.label}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {activeGroup.description}
                  </div>
                </div>
                <span className="font-mono text-[9px] text-zinc-400 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded flex-shrink-0 ml-2">
                  {activeGroup.subtypes.length - 1} types
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {activeGroup.subtypes.map((sub, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(sub.label)}
                    className={`text-left px-2.5 py-2 rounded-lg text-[11px] transition-all duration-100 border ${sub.prompt === null ? "col-span-2 bg-zinc-900 border-zinc-900 text-white font-semibold hover:bg-zinc-800" : selected === sub.label ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 hover:bg-zinc-50"}`}
                  >
                    {sub.prompt === null ? (
                      <span className="flex items-center gap-2">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M6 1v2M6 9v2M1 6h2M9 6h2M2.5 2.5l1.4 1.4M8.1 8.1l1.4 1.4M9.5 2.5L8.1 3.9M3.9 8.1L2.5 9.5"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                          />
                        </svg>
                        Let AI choose the best {activeGroup.label} type
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 font-mono">
                        <span
                          className={`w-1 h-1 rounded-full flex-shrink-0 ${selected === sub.label ? "bg-white" : "bg-zinc-300"}`}
                        />
                        {sub.label}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 py-2.5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
        <span className="font-mono text-[10px] text-zinc-400">
          Click category → pick type → AI generates it
        </span>
        {selected && (
          <span className="font-mono text-[10px] text-white bg-zinc-900 px-2 py-0.5 rounded">
            ✓ {selected}
          </span>
        )}
      </div>
    </div>
  );
}

function StepProcessing({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);
  const PROC = [
    {
      icon: "◈",
      label: "Parsing your request",
      detail: "Understanding data structure & intent",
    },
    {
      icon: "⬡",
      label: "Selecting chart type",
      detail: "Matching 3D Scatter to your dataset",
    },
    {
      icon: "σ",
      label: "Mapping dimensions",
      detail: "x: Sales  ·  y: Engagement  ·  z: Region",
    },
    {
      icon: "✦",
      label: "Rendering visualization",
      detail: "Applying styling, axes & interactions",
    },
  ];
  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    setStep(0);
    const ids = PROC.map((_, i) =>
      setTimeout(() => setStep(i + 1), 500 + i * 950),
    );
    return () => ids.forEach(clearTimeout);
  }, [active]);

  return (
    <div
      className="rounded-2xl border border-white/10 bg-white overflow-hidden"
      style={{
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.7)",
      }}
    >
      <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-50 border-b border-zinc-100">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <div className="flex items-center gap-2 ml-3">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-50 animate-ping" />
            <span className="relative w-2 h-2 rounded-full bg-zinc-600" />
          </span>
          <span className="font-mono text-[10px] text-zinc-500">
            AI is working…
          </span>
        </div>
      </div>
      <div className="divide-y divide-zinc-50">
        {PROC.map((s, i) => {
          const done = step > i + 1,
            current = step === i + 1;
          return (
            <div
              key={i}
              className={`flex items-center gap-4 px-5 py-4 transition-all duration-500 ${step <= i ? "opacity-20" : "opacity-100"}`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-400 ${done ? "bg-zinc-900 text-white" : current ? "bg-zinc-100 border-2 border-zinc-300" : "bg-zinc-50 text-zinc-300 border border-zinc-100"}`}
              >
                {current ? (
                  <svg
                    className="animate-spin text-zinc-600"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeOpacity="0.2"
                    />
                    <path
                      d="M12 2a10 10 0 0 1 10 10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2.5 7l3 3 6-6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className="text-base text-zinc-400">{s.icon}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold ${done ? "text-zinc-800" : current ? "text-zinc-700" : "text-zinc-400"}`}
                >
                  {s.label}
                </p>
                <p
                  className={`text-[11px] font-mono mt-0.5 ${done || current ? "text-zinc-400" : "text-zinc-300"}`}
                >
                  {s.detail}
                </p>
              </div>
              {done && (
                <span className="font-mono text-[10px] text-zinc-400 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-full flex-shrink-0">
                  done
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="px-5 py-4 border-t border-zinc-100 bg-zinc-50">
        <div className="h-1 rounded-full bg-zinc-100 overflow-hidden">
          <div
            className="h-full bg-zinc-900 rounded-full transition-all duration-700"
            style={{ width: `${(step / PROC.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="font-mono text-[10px] text-zinc-400">
            Processing your data
          </span>
          <span className="font-mono text-[10px] text-zinc-700 font-semibold">
            {Math.round((step / PROC.length) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function StepChart({ active }: { active: boolean }) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!active || !plotRef.current) {
      setReady(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      import("plotly.js-dist-min").then(({ default: Plotly }) => {
        if (cancelled || !plotRef.current) return;
        const n = 130;
        const regions = ["North", "South", "East", "West", "Central"];
        const palette: Record<string, string> = {
          North: "#06b6d4",
          South: "#a855f7",
          East: "#f59e0b",
          West: "#10b981",
          Central: "#f43f5e",
        };
        const base: Record<string, [number, number]> = {
          North: [62, 72],
          South: [44, 55],
          East: [76, 82],
          West: [54, 65],
          Central: [50, 60],
        };
        const x: number[] = [],
          y: number[] = [],
          z: number[] = [],
          colors: string[] = [],
          sizes: number[] = [],
          texts: string[] = [];
        for (let i = 0; i < n; i++) {
          const r = regions[Math.floor(Math.random() * regions.length)];
          const xv = base[r][0] + (Math.random() - 0.5) * 38,
            yv = base[r][1] + (Math.random() - 0.5) * 38;
          const zv = xv * 0.42 + yv * 0.34 + Math.random() * 18;
          x.push(+xv.toFixed(1));
          y.push(+yv.toFixed(1));
          z.push(+zv.toFixed(1));
          colors.push(palette[r]);
          sizes.push(4 + zv / 16);
          texts.push(
            `<b>${r}</b><br>Sales: ${xv.toFixed(0)}k<br>Engagement: ${yv.toFixed(0)}%<br>Score: ${zv.toFixed(0)}`,
          );
        }
        Plotly.react(
          plotRef.current!,
          [
            ...Object.entries(palette).map(([region, color]) => {
              const xi: number[] = [],
                yi: number[] = [],
                zi: number[] = [],
                ti: string[] = [],
                si: number[] = [];
              for (let k = 0; k < x.length; k++) {
                if (texts[k].startsWith(`<b>${region}`)) {
                  xi.push(x[k]);
                  yi.push(y[k]);
                  zi.push(z[k]);
                  ti.push(texts[k]);
                  si.push(sizes[k]);
                }
              }
              return {
                type: "scatter3d",
                mode: "markers",
                name: region,
                x: xi,
                y: yi,
                z: zi,
                text: ti,
                hovertemplate: "%{text}<extra></extra>",
                marker: {
                  size: si.map((s) => s * 1.4),
                  color,
                  opacity: 0.92,
                  line: { color: "rgba(255,255,255,0.25)", width: 0.8 },
                },
              } as any;
            }),
          ],
          {
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            scene: {
              bgcolor: "transparent",
              xaxis: {
                title: {
                  text: "Sales (k)",
                  font: { size: 10, color: "#06b6d4" },
                },
                gridcolor: "rgba(6,182,212,0.15)",
                zerolinecolor: "rgba(6,182,212,0.25)",
                tickfont: { size: 9, color: "rgba(255,255,255,0.4)" },
                backgroundcolor: "rgba(6,182,212,0.03)",
              },
              yaxis: {
                title: {
                  text: "Engagement (%)",
                  font: { size: 10, color: "#06b6d4" },
                },
                gridcolor: "rgba(6,182,212,0.15)",
                zerolinecolor: "rgba(6,182,212,0.25)",
                tickfont: { size: 9, color: "rgba(255,255,255,0.4)" },
                backgroundcolor: "rgba(6,182,212,0.03)",
              },
              zaxis: {
                title: { text: "Score", font: { size: 10, color: "#06b6d4" } },
                gridcolor: "rgba(6,182,212,0.15)",
                zerolinecolor: "rgba(6,182,212,0.25)",
                tickfont: { size: 9, color: "rgba(255,255,255,0.4)" },
                backgroundcolor: "rgba(6,182,212,0.03)",
              },
              camera: { eye: { x: 1.6, y: 1.6, z: 1.1 } },
              aspectmode: "cube",
            },
            legend: {
              font: {
                size: 11,
                color: "rgba(255,255,255,0.75)",
                family: "DM Mono, monospace",
              },
              bgcolor: "rgba(0,0,0,0.4)",
              bordercolor: "rgba(6,182,212,0.2)",
              borderwidth: 1,
              x: 0.01,
              y: 0.99,
            },
            margin: { t: 10, b: 0, l: 0, r: 0 },
            showlegend: true,
          },
          { displayModeBar: false, responsive: true },
        );
        setReady(true);
      });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      import("plotly.js-dist-min").then(({ default: Plotly }) => {
        if (plotRef.current) Plotly.purge(plotRef.current);
      });
    };
  }, [active]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#080f1a",
        border: "1px solid rgba(6,182,212,0.25)",
        boxShadow:
          "0 0 0 1px rgba(6,182,212,0.08), 0 24px 64px rgba(0,0,0,0.8), 0 0 80px rgba(6,182,212,0.08)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          background: "rgba(6,182,212,0.05)",
          borderColor: "rgba(6,182,212,0.15)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <div className="flex items-center gap-2 ml-3">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-40 animate-ping" />
              <span className="relative w-2 h-2 rounded-full bg-cyan-400" />
            </span>
            <span className="font-mono text-[10px] text-cyan-400/70">
              3D Sales Scatter — Ready
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          {["SVG", "CSV", "PNG"].map((f) => (
            <button
              key={f}
              className="px-2 py-0.5 rounded font-mono text-[10px] border transition-colors"
              style={
                f === "PNG"
                  ? {
                      background: "#06b6d4",
                      borderColor: "#06b6d4",
                      color: "#000",
                    }
                  : {
                      background: "transparent",
                      borderColor: "rgba(6,182,212,0.2)",
                      color: "rgba(6,182,212,0.5)",
                    }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="relative" style={{ height: 360 }}>
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
        >
          <div ref={plotRef} style={{ width: "100%", height: "100%" }} />
        </div>
        {!ready && (
          <div
            className="absolute inset-0 flex items-center justify-center gap-3"
            style={{ color: "#06b6d4" }}
          >
            <svg
              className="animate-spin"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeOpacity="0.2"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-xs font-mono">Rendering 3D chart…</span>
          </div>
        )}
      </div>
      <div
        className={`px-4 py-3 flex items-center gap-2.5 transition-all duration-500 delay-700 ${ready ? "opacity-100" : "opacity-0"}`}
        style={{
          borderTop: "1px solid rgba(6,182,212,0.15)",
          background: "rgba(6,182,212,0.05)",
        }}
      >
        <span className="text-cyan-400 text-xs">✦</span>
        <span className="font-mono text-[11px] text-cyan-300/70">
          East & North regions show strongest correlation (r = 0.87) — potential
          growth targets
        </span>
      </div>
    </div>
  );
}

// ─── Step metadata ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    label: "Write your request",
    headline: "Plain English.\nNo SQL needed.",
    body: "Type any natural-language request — or drag in a CSV. Describe what you want to see and GraphAI figures out the rest.",
    tag: "Input",
    component: StepInput,
  },
  {
    num: "02",
    label: "Choose chart type",
    headline: `${TOTAL_TYPES}+ chart types.\nAI picks for you.`,
    body: `Browse ${CHART_GROUPS.length} categories of chart types — or let AI automatically choose the most effective visualization for your data.`,
    tag: "Selection",
    component: StepSelector,
  },
  {
    num: "03",
    label: "AI processes your data",
    headline: "Parse. Map.\nRender.",
    body: "GraphAI parses intent, maps every dimension to an optimal visual encoding, and generates a fully interactive chart in under 3 seconds.",
    tag: "Processing",
    component: StepProcessing,
  },
  {
    num: "04",
    label: "Get your chart",
    headline: "Interactive &\nexport-ready.",
    body: "Rotate, zoom, hover for details. Export in one click as PNG, SVG, or CSV — or embed anywhere with a snippet.",
    tag: "Output",
    component: StepChart,
  },
];

// ─── Main component ─────────────────────────────────────────────────────────

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      let fired = false;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!fired) {
              fired = true;
              return;
            }
            if (e.isIntersecting) setActiveStep(i);
          });
        },
        { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#111212]">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow top */}
     

      {/* ── HEADER ── */}
      <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          {/* Left: label + heading */}
          <div className="max-w-xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6"
              style={{
                border: "1px solid rgba(6,182,212,0.2)",
                background: "rgba(6,182,212,0.05)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span
                className="text-[10px] tracking-[0.25em] uppercase font-mono"
                style={{ color: "rgba(6,182,212,0.8)" }}
              >
                How it works
              </span>
            </div>
            <h2
              className="text-5xl md:text-6xl font-black tracking-tighter leading-none"
              style={{ color: "#fff" }}
            >
              From question
              <br />
              <span style={{ color: "rgba(6,182,212,0.6)" }}>to chart.</span>
            </h2>
          </div>

          {/* Right: descriptor + steps count */}
          <div className="md:text-right">
            <p className="text-white/40 text-sm font-mono leading-relaxed mb-4 max-w-xs md:ml-auto">
              No code. No SQL.
              <br />
              No configuration. Just describe what you need.
            </p>
            <div className="flex md:justify-end gap-6">
              {[
                ["4", "steps"],
                [String(TOTAL_TYPES) + "+", "chart types"],
                [String(CHART_GROUPS.length), "categories"],
              ].map(([n, l]) => (
                <div key={l} className="text-center">
                  <div className="text-2xl font-black text-white">{n}</div>
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step tab bar */}
        <div className="mt-14 flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() =>
                stepRefs.current[i]?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                })
              }
              className="flex-1 min-w-[120px] flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 relative overflow-hidden"
              style={{
                background:
                  activeStep === i
                    ? "rgba(6,182,212,0.08)"
                    : "rgba(255,255,255,0.02)",
                border:
                  activeStep === i
                    ? "1px solid rgba(6,182,212,0.25)"
                    : "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span
                className="text-[10px] font-black font-mono flex-shrink-0"
                style={{
                  color:
                    activeStep === i ? "#06b6d4" : "rgba(255,255,255,0.15)",
                }}
              >
                {s.num}
              </span>
              <span
                className="text-[11px] font-semibold leading-tight"
                style={{
                  color:
                    activeStep === i
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.25)",
                }}
              >
                {s.label}
              </span>
              {/* active underline */}
              {activeStep === i && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #06b6d4, transparent)",
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── STEPS ── */}
      <div className="relative max-w-6xl mx-auto px-6 pb-12">
        <div className="space-y-0">
          {STEPS.map((s, i) => {
            const StepComp = s.component;
            const isActive = activeStep === i;
            const isEven = i % 2 === 0;

            return (
              <div
                key={i}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className="relative"
              >
                {/* Thin connector line between steps */}
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                    style={{
                      top: "100%",
                      width: 1,
                      height: 48,
                      background:
                        "linear-gradient(180deg, rgba(6,182,212,0.15), transparent)",
                      zIndex: 10,
                    }}
                  />
                )}

                <div
                  className="grid md:grid-cols-2 gap-0 py-16"
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {/* ── Left or Right: Text side ── */}
                  <div
                    className={`flex flex-col justify-center px-4 md:px-10 py-6 ${isEven ? "md:order-1" : "md:order-2"}`}
                  >
                    {/* Step tag */}
                    <div className="flex items-center gap-3 mb-6">
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                        style={{
                          background: isActive
                            ? "rgba(6,182,212,0.12)"
                            : "rgba(255,255,255,0.04)",
                          color: isActive ? "#06b6d4" : "rgba(255,255,255,0.2)",
                          border: isActive
                            ? "1px solid rgba(6,182,212,0.2)"
                            : "1px solid rgba(255,255,255,0.06)",
                          transition: "all 0.4s ease",
                        }}
                      >
                        {s.tag}
                      </span>
                      <div
                        className="h-px flex-1"
                        style={{
                          background: isActive
                            ? "linear-gradient(90deg, rgba(6,182,212,0.3), transparent)"
                            : "linear-gradient(90deg, rgba(255,255,255,0.05), transparent)",
                          transition: "all 0.6s ease",
                        }}
                      />
                    </div>

                    {/* Step number */}
                    <div
                      className="text-[80px] font-black leading-none mb-2 select-none"
                      style={{
                        color: isActive
                          ? "rgba(6,182,212,0.08)"
                          : "rgba(255,255,255,0.03)",
                        transition: "color 0.5s ease",
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: "-0.05em",
                      }}
                    >
                      {s.num}
                    </div>

                    {/* Headline */}
                    <h3
                      className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-5 whitespace-pre-line"
                      style={{
                        color: isActive ? "#fff" : "rgba(255,255,255,0.35)",
                        transition: "color 0.5s ease",
                      }}
                    >
                      {s.headline}
                    </h3>

                    {/* Body */}
                    <p
                      className="text-sm leading-relaxed font-mono max-w-sm"
                      style={{
                        color: isActive
                          ? "rgba(255,255,255,0.55)"
                          : "rgba(255,255,255,0.2)",
                        transition: "color 0.5s ease",
                      }}
                    >
                      {s.body}
                    </p>

                    {/* Step dot progress */}
                    <div className="flex gap-2 mt-8">
                      {STEPS.map((_, di) => (
                        <div
                          key={di}
                          className="rounded-full transition-all duration-400"
                          style={{
                            width: di === i ? 20 : 6,
                            height: 6,
                            background:
                              di === i
                                ? "#06b6d4"
                                : di < i
                                  ? "rgba(6,182,212,0.3)"
                                  : "rgba(255,255,255,0.08)",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ── Right or Left: Visual side ── */}
                  <div
                    className={`px-4 md:px-10 py-6 flex items-center ${isEven ? "md:order-2" : "md:order-1"}`}
                    style={{
                      opacity: isActive ? 1 : 0.3,
                      transform: isActive ? "scale(1)" : "scale(0.97)",
                      transition: "opacity 0.6s ease, transform 0.6s ease",
                    }}
                  >
                    <div className="w-full">
                      <StepComp active={isActive} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FOOTER CTA ── */}
      <div
        className="relative mx-6 mb-16 rounded-2xl overflow-hidden"
        style={{
          maxWidth: "calc(100% - 48px)",
          marginLeft: "auto",
          marginRight: "auto",
          background:
            "linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(6,182,212,0.02) 100%)",
          border: "1px solid rgba(6,182,212,0.15)",
        }}
      >
        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.08) 0%, transparent 60%)",
          }}
        />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 px-10 py-12">
          <div>
            <p className="text-2xl font-black text-white tracking-tight">
              Ready to see your data differently?
            </p>
            <p
              className="font-mono text-sm mt-1"
              style={{ color: "rgba(6,182,212,0.5)" }}
            >
              Join 12,000+ teams already using GraphAI.
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link
              href="/dashboard"
              className="px-7 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                color: "#000",
                boxShadow: "0 0 32px rgba(6,182,212,0.3)",
              }}
            >
              Start for free →
            </Link>
            <button
              className="px-7 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              Watch demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
