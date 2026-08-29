/**
 * Graphix chart palette.
 *
 * The UI chrome is monochrome + one accent (see the tokens in globals.css);
 * colour is spent only on data. These are the hues data is allowed to use,
 * tuned to sit with --gx-accent (#E8FF5A) rather than against it.
 *
 * Two variants because the page has two grounds: the warm black used almost
 * everywhere, and the paper (#F4F2EA) used by the closing CTA. A series colour
 * that reads on one is invisible on the other.
 */

/* ── Categorical series, warm-black ground ─────────────────── */
export const SERIES_DARK = [
  "#E8FF5A", // acid      — primary, matches the site accent
  "#FF8A5B", // coral
  "#6ED4C8", // seafoam
  "#B8A6F2", // periwinkle
  "#FF6B8A", // rose
  "#9BE564", // leaf
] as const;

/* ── Same hues, darkened to read on paper ──────────────────── */
export const SERIES_PAPER = [
  "#7A8C1F", // olive
  "#C4562A", // burnt coral
  "#2E8478", // deep seafoam
  "#6A55C4", // deep periwinkle
  "#C43D5C", // deep rose
  "#4F7A22", // deep leaf
] as const;

/* ── Sequential ramps for surfaces / heatmaps / contours ───── */
export const RAMP_DARK: [number, string][] = [
  [0.0, "#14150F"],
  [0.25, "#33451F"],
  [0.5, "#5E7A2C"],
  [0.75, "#9DBE3C"],
  [1.0, "#E8FF5A"],
];

export const RAMP_PAPER: [number, string][] = [
  [0.0, "#E7E4D2"],
  [0.25, "#B9C48A"],
  [0.5, "#8AA34A"],
  [0.75, "#5C7A28"],
  [1.0, "#33450F"],
];

/* ── Chart chrome (axes, gridlines, ticks) ─────────────────── */
export const CHROME_DARK = {
  axis: "rgba(242,241,236,0.42)",
  grid: "rgba(242,241,236,0.08)",
  cage: "rgba(242,241,236,0.28)",
  tick: "rgba(242,241,236,0.40)",
};

export const CHROME_PAPER = {
  axis: "rgba(26,26,22,0.42)",
  grid: "rgba(26,26,22,0.10)",
  cage: "rgba(26,26,22,0.26)",
  tick: "rgba(26,26,22,0.45)",
};

export const CHART_FONT = {
  family: "'DM Mono', ui-monospace, monospace",
  size: 12,
};

/** Plotly colorscale form: [[0, hex], ...] */
export const toColorscale = (ramp: [number, string][]) =>
  ramp.map(([t, c]) => [t, c] as [number, string]);

/** 0xRRGGBB ints, for three.js `new THREE.Color(...)`. */
export const hexInt = (c: string) => parseInt(c.replace("#", ""), 16);
