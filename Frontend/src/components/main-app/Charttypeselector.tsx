"use client";

import { useState, useRef, useEffect, MouseEvent } from "react";

interface ChartSubtype {
  label: string;
  prompt: string | null;
}
interface ChartGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  subtypes: ChartSubtype[];
  noAiChoice?: boolean;
}
interface SelectedChart {
  groupLabel: string;
  subLabel: string;
  prompt: string | null;
  group?: string;
}
interface ChartTypeSelectorProps {
  onSelect: (selection: SelectedChart | null) => void;
}

const Icons = {
  line: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 17 9 11 13 15 21 7" />
    </svg>
  ),
  bar: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="7" width="4" height="14" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  ),
  pie: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  ),
  statistical: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="3" x2="12" y2="21" />
      <path d="M8 7h8M9 12h6M10 17h4" />
    </svg>
  ),
  histogram: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="9" width="4" height="12" rx="1" />
      <rect x="7" y="5" width="4" height="16" rx="1" />
      <rect x="12" y="3" width="4" height="18" rx="1" />
      <rect x="17" y="7" width="4" height="14" rx="1" />
    </svg>
  ),
  filled: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 18 Q8 6 12 10 Q16 14 21 4" />
      <path d="M3 18 Q8 14 12 16 Q16 18 21 12" />
    </svg>
  ),
  contour: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="12" rx="9" ry="4" />
      <ellipse cx="12" cy="12" rx="6" ry="2.5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  ),
  scientific: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 3H5l7 18 7-18h-4" />
      <line x1="5" y1="9" x2="19" y2="9" />
    </svg>
  ),
  financial: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 7 8 2 14 8 21 3" />
      <polyline points="3 17 8 12 14 18 21 13" />
    </svg>
  ),
  threeD: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
};

const CHART_GROUPS: ChartGroup[] = [
  {
    id: "line-scatter",
    label: "Line & Scatter",
    icon: Icons.line,
    color: "#3b82f6",
    description: "Trends, correlations, time series",
    noAiChoice: true,
    subtypes: [
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
    icon: Icons.bar,
    color: "#10b981",
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
      { label: "Colored & Styled Bar", prompt: "Colored and Styled Bar Chart" },
      { label: "Relative Barmode", prompt: "Bar Chart with Relative Barmode" },
    ],
  },
  {
    id: "pie-bubble",
    label: "Pie & Bubble",
    icon: Icons.pie,
    color: "#ec4899",
    description: "Proportions, distributions, sizes",
    noAiChoice: true,
    subtypes: [
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
    icon: Icons.statistical,
    color: "#f59e0b",
    description: "Distributions, errors, outliers",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Symmetric Error Bars", prompt: "Basic Symmetric Error Bars" },
      { label: "Bar with Error Bars", prompt: "Bar Chart with Error Bars" },
      { label: "Horizontal Error Bars", prompt: "Horizontal Error Bars" },
      { label: "Asymmetric Error Bars", prompt: "Asymmetric Error Bars" },
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
    icon: Icons.histogram,
    color: "#8b5cf6",
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
    icon: Icons.filled,
    color: "#ef4444",
    description: "Confidence bands, filled areas",
    noAiChoice: true,
    subtypes: [
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
    icon: Icons.contour,
    color: "#06b6d4",
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
    icon: Icons.scientific,
    color: "#4ade80",
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
    icon: Icons.financial,
    color: "#f97316",
    description: "Candlestick, waterfall, funnel, time series",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "Basic Waterfall", prompt: "Basic Waterfall Chart" },
      {
        label: "Multi-Category Waterfall",
        prompt: "Multi Category Waterfall Chart",
      },
      { label: "Simple Candlestick", prompt: "Simple Candlestick Chart" },
      {
        label: "Candlestick No Slider",
        prompt: "Candlestick Chart without Rangeslider",
      },
      {
        label: "Candlestick + Annotations",
        prompt: "Customise Candlestick Chart with Shapes and Annotations",
      },
      { label: "Basic Funnel", prompt: "Basic Funnel Plot" },
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
    icon: Icons.threeD,
    color: "#a855f7",
    description: "Three-dimensional visualizations",
    subtypes: [
      { label: "AI Choice", prompt: null },
      { label: "3D Scatter", prompt: "3D Scatter Plot" },
      { label: "Basic Ribbon Plot", prompt: "Basic Ribbon Plot" },
      {
        label: "Topographical Surface",
        prompt: "Topographical 3D Surface Plot",
      },
      { label: "Multiple 3D Surfaces", prompt: "Multiple 3D Surface Plots" },
      { label: "3D Mesh Plot", prompt: "Simple 3D Mesh Plot" },
      { label: "3D Line Chart", prompt: "3D line chart" },
      { label: "3D Line Plot", prompt: "3D Line Plot" },
      { label: "3D Line + Markers", prompt: "3D Line + Markers Plot" },
      { label: "3D Line Spiral", prompt: "3D Line Spiral Plot" },
      { label: "3D Random Walk", prompt: "3D Random Walk Plot" },
    ],
  },
];

export default function ChartTypeSelector({
  onSelect,
}: ChartTypeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<ChartGroup | null>(null);
  const [hoveredGroup, setHoveredGroup] = useState<ChartGroup | null>(null);
  const [selected, setSelected] = useState<SelectedChart | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const handler = (e: globalThis.MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveGroup(null);
        setHoveredGroup(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (isMobile && open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, open]);

  const handleSubSelect = (group: ChartGroup, sub: ChartSubtype) => {
    const sel: SelectedChart =
      sub.prompt === null
        ? { groupLabel: group.label, subLabel: "AI Choice", prompt: null }
        : { groupLabel: group.label, subLabel: sub.label, prompt: sub.prompt };
    setSelected(sel);
    onSelect(sel);
    setOpen(false);
    setActiveGroup(null);
    setHoveredGroup(null);
  };

  const clearSelection = (e: MouseEvent) => {
    e.stopPropagation();
    setSelected(null);
    onSelect(null);
  };

  const displayGroup = hoveredGroup || activeGroup;
  const selectedGroup = CHART_GROUPS.find(
    (g) => g.label === selected?.groupLabel,
  );

  return (
    <div ref={ref} className="relative inline-block flex-shrink-0">
      <style>{`
        @keyframes cts-up {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cts-slideup {
          from { opacity: 0; transform: translateY(100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cts-fadein {
          from { opacity: 0; transform: translateX(-3px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .cts-no-sb::-webkit-scrollbar { display: none; }
        .cts-no-sb { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Trigger */}
      <button
        onClick={() => {
          setOpen((p) => !p);
          setActiveGroup(null);
          setHoveredGroup(null);
        }}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap text-xs font-medium"
        style={
          selected
            ? {
                background: "rgba(6,182,212,0.1)",
                border: "1px solid rgba(6,182,212,0.25)",
                color: "#22d3ee",
              }
            : {
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.45)",
              }
        }
        onMouseEnter={(e) => {
          if (!selected) {
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(255,255,255,0.16)";
            (e.currentTarget as HTMLElement).style.color =
              "rgba(255,255,255,0.7)";
          }
        }}
        onMouseLeave={(e) => {
          if (!selected) {
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(255,255,255,0.09)";
            (e.currentTarget as HTMLElement).style.color =
              "rgba(255,255,255,0.45)";
          }
        }}
      >
        {selected ? (
          <>
            <span style={{ color: selectedGroup?.color || "#22d3ee" }}>
              {selectedGroup?.icon}
            </span>
            <span
              className="max-w-[60px] sm:max-w-[90px] truncate"
              style={{ fontSize: 11 }}
            >
              {selected.subLabel === "AI Choice"
                ? selected.groupLabel
                : selected.subLabel}
            </span>
            <span
              onClick={clearSelection}
              style={{ marginLeft: 2, opacity: 0.6 }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = "1")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = "0.6")
              }
            >
              ✕
            </span>
          </>
        ) : (
          <>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="12" width="4" height="9" rx="1" />
              <rect x="10" y="7" width="4" height="14" rx="1" />
              <rect x="17" y="3" width="4" height="18" rx="1" />
            </svg>
            <span>Chart Type</span>
            <svg
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.4 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </>
        )}
      </button>

      {/* MOBILE bottom sheet */}
      {open && isMobile && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => {
              setOpen(false);
              setActiveGroup(null);
            }}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-[9999] rounded-t-2xl flex flex-col"
            style={{
              animation: "cts-slideup 0.25s cubic-bezier(0.16,1,0.3,1) both",
              maxHeight: "80vh",
              background: "#0e0e14",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.12)" }}
              />
            </div>
            <div
              className="px-4 py-2.5 flex items-center justify-between flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span
                className="text-sm font-bold"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                Chart Type
              </span>
              <button
                onClick={() => {
                  setOpen(false);
                  setActiveGroup(null);
                }}
                style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}
              >
                ✕
              </button>
            </div>
            {activeGroup ? (
              <div className="flex flex-col flex-1 min-h-0">
                <div
                  className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <button
                    onClick={() => setActiveGroup(null)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <span style={{ color: activeGroup.color }}>
                    {activeGroup.icon}
                  </span>
                  <div>
                    <div
                      className="text-xs font-semibold"
                      style={{ color: "rgba(255,255,255,0.75)" }}
                    >
                      {activeGroup.label}
                    </div>
                    <div
                      className="text-[10px]"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      {activeGroup.description}
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto cts-no-sb px-3 py-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    {activeGroup.subtypes.map((sub, i) => (
                      <button
                        key={i}
                        onClick={() => handleSubSelect(activeGroup, sub)}
                        className={`text-left px-3 py-2.5 rounded-xl text-xs transition-all ${sub.prompt === null ? "col-span-2" : ""}`}
                        style={
                          sub.prompt === null
                            ? {
                                background: "rgba(6,182,212,0.07)",
                                border: "1px solid rgba(6,182,212,0.18)",
                                color: "#22d3ee",
                                fontWeight: 600,
                              }
                            : {
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.06)",
                                color: "rgba(255,255,255,0.5)",
                              }
                        }
                      >
                        {sub.prompt === null ? (
                          <div className="flex items-center gap-2">
                            <span style={{ color: "#06b6d4" }}>✦</span>Let AI
                            choose
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className="w-1 h-1 rounded-full flex-shrink-0"
                              style={{ background: "rgba(255,255,255,0.2)" }}
                            />
                            {sub.label}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto cts-no-sb px-3 py-2">
                <div className="grid grid-cols-2 gap-1.5">
                  {CHART_GROUPS.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setActiveGroup(group)}
                      className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-left transition-all"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "rgba(255,255,255,0.07)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "rgba(255,255,255,0.03)")
                      }
                    >
                      <span style={{ color: group.color, flexShrink: 0 }}>
                        {group.icon}
                      </span>
                      <div className="min-w-0">
                        <div
                          className="text-xs font-semibold truncate"
                          style={{ color: "rgba(255,255,255,0.65)" }}
                        >
                          {group.label}
                        </div>
                        <div
                          className="text-[10px]"
                          style={{ color: "rgba(255,255,255,0.25)" }}
                        >
                          {
                            group.subtypes.filter((s) => s.prompt !== null)
                              .length
                          }{" "}
                          types
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ height: "max(0px, env(safe-area-inset-bottom))" }} />
          </div>
        </>
      )}

      {/* DESKTOP popup */}
      {open && !isMobile && (
        <div
          className="absolute bottom-full left-0 z-[9999] rounded-2xl overflow-hidden"
          style={{
            width: 560,
            maxWidth: "calc(100vw - 2rem)",
            animation: "cts-up 0.15s cubic-bezier(0.16,1,0.3,1) both",
            marginBottom: 6,
            background: "#0e0e14",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-2.5 flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Select Chart Type
            </span>
            <span
              className="text-[10px]"
              style={{
                color: "rgba(255,255,255,0.2)",
                fontFamily: "monospace",
              }}
            >
              {CHART_GROUPS.length} categories ·{" "}
              {CHART_GROUPS.reduce(
                (s, g) =>
                  s + g.subtypes.filter((st) => st.prompt !== null).length,
                0,
              )}{" "}
              types
            </span>
          </div>

          <div className="flex" style={{ height: 300 }}>
            {/* Left: groups */}
            <div
              className="flex-shrink-0 overflow-y-auto cts-no-sb py-1.5"
              style={{
                width: 180,
                borderRight: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {CHART_GROUPS.map((group) => {
                const isActive =
                  activeGroup?.id === group.id || hoveredGroup?.id === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() =>
                      setActiveGroup(
                        activeGroup?.id === group.id ? null : group,
                      )
                    }
                    onMouseEnter={() => setHoveredGroup(group)}
                    onMouseLeave={() => setHoveredGroup(null)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left transition-all duration-100"
                    style={{
                      borderLeft: `2px solid ${isActive ? group.color : "transparent"}`,
                      background: isActive
                        ? "rgba(255,255,255,0.05)"
                        : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        style={{
                          color: isActive
                            ? group.color
                            : "rgba(255,255,255,0.25)",
                          flexShrink: 0,
                        }}
                      >
                        {group.icon}
                      </span>
                      <div>
                        <div
                          className="text-xs font-medium"
                          style={{
                            color: isActive
                              ? "rgba(255,255,255,0.85)"
                              : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {group.label}
                        </div>
                        <div
                          className="text-[9px]"
                          style={{
                            color: "rgba(255,255,255,0.18)",
                            fontFamily: "monospace",
                          }}
                        >
                          {
                            group.subtypes.filter((s) => s.prompt !== null)
                              .length
                          }{" "}
                          types
                        </div>
                      </div>
                    </div>
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "rgba(255,255,255,0.15)", flexShrink: 0 }}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                );
              })}
            </div>

            {/* Right: subtypes */}
            <div className="flex-1 overflow-y-auto cts-no-sb p-2.5">
              {!displayGroup ? (
                <div className="h-full flex flex-col items-center justify-center gap-2">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    style={{ color: "rgba(255,255,255,0.1)" }}
                  >
                    <rect x="3" y="12" width="4" height="9" rx="1" />
                    <rect x="10" y="7" width="4" height="14" rx="1" />
                    <rect x="17" y="3" width="4" height="18" rx="1" />
                  </svg>
                  <span
                    className="text-xs text-center leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                  >
                    Hover a category
                    <br />
                    to preview types
                  </span>
                </div>
              ) : (
                <div style={{ animation: "cts-fadein 0.12s ease both" }}>
                  <div
                    className="px-1 pb-2 mb-1 flex items-center gap-2"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span style={{ color: displayGroup.color }}>
                      {displayGroup.icon}
                    </span>
                    <div>
                      <div
                        className="text-xs font-semibold"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {displayGroup.label}
                      </div>
                      <div
                        className="text-[10px]"
                        style={{ color: "rgba(255,255,255,0.28)" }}
                      >
                        {displayGroup.description}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {displayGroup.subtypes.map((sub, i) => (
                      <button
                        key={i}
                        onClick={() => handleSubSelect(displayGroup, sub)}
                        className={`text-left px-2.5 py-2 rounded-lg transition-all duration-100 text-xs ${sub.prompt === null ? "col-span-2" : ""}`}
                        style={
                          sub.prompt === null
                            ? {
                                background: "rgba(6,182,212,0.07)",
                                border: "1px solid rgba(6,182,212,0.16)",
                                color: "#22d3ee",
                                fontWeight: 500,
                              }
                            : {
                                background: "rgba(255,255,255,0.025)",
                                border: "1px solid transparent",
                                color: "rgba(255,255,255,0.45)",
                              }
                        }
                        onMouseEnter={(e) => {
                          if (sub.prompt !== null) {
                            (e.currentTarget as HTMLElement).style.background =
                              "rgba(255,255,255,0.07)";
                            (e.currentTarget as HTMLElement).style.borderColor =
                              "rgba(255,255,255,0.08)";
                            (e.currentTarget as HTMLElement).style.color =
                              "rgba(255,255,255,0.8)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (sub.prompt !== null) {
                            (e.currentTarget as HTMLElement).style.background =
                              "rgba(255,255,255,0.025)";
                            (e.currentTarget as HTMLElement).style.borderColor =
                              "transparent";
                            (e.currentTarget as HTMLElement).style.color =
                              "rgba(255,255,255,0.45)";
                          }
                        }}
                      >
                        {sub.prompt === null ? (
                          <div className="flex items-center gap-2">
                            <span style={{ color: "#06b6d4" }}>✦</span>Let AI
                            choose the best {displayGroup.label}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className="w-1 h-1 rounded-full flex-shrink-0"
                              style={{ background: "rgba(255,255,255,0.18)" }}
                            />
                            {sub.label}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-4 py-2 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span
              className="text-[10px]"
              style={{
                color: "rgba(255,255,255,0.18)",
                fontFamily: "monospace",
              }}
            >
              hover category → pick type → AI generates it
            </span>
            <button
              onClick={() => {
                setOpen(false);
                setActiveGroup(null);
                setHoveredGroup(null);
              }}
              className="text-[10px] transition-opacity hover:opacity-80"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              close ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
