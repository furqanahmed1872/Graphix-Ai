// ── Local edit resolver ───────────────────────────────────────
//
// Most chart edits are not language problems, they are field assignments.
// "make it blue" only ever means colors=["#..."]. Sending that to an LLM
// costs tokens, adds a second of latency and can come back wrong.
//
// This resolves the common cases against the spec directly, for zero tokens.
//
// PRECISION RULE: every meaningful word in the request must be consumed by a
// matcher. If anything is left over, we return null and the caller falls
// through to the model. A wrong local edit is far worse than a slow one.

const COLOR_WORDS = {
  blue: "#4A7DE8", red: "#E8503F", green: "#4F9E3F", yellow: "#E8D44A",
  orange: "#F08A3C", purple: "#8A6FD1", pink: "#E86A9B", teal: "#3FA9A0",
  cyan: "#3FB8C4", magenta: "#D44AC4", grey: "#8A8A82", gray: "#8A8A82",
  black: "#1A1A16", white: "#F2F1EC", brown: "#8A6A4A", lime: "#9BE564",
  navy: "#2A3F7A", gold: "#D4A93C", silver: "#B8B8B0", violet: "#8A6FD1",
};

const CHART_WORDS = {
  bar: "bar", bars: "bar", column: "bar", columns: "bar",
  line: "line", lines: "line", trend: "line",
  scatter: "scatter", points: "scatter", dots: "scatter", bubble: "scatter",
  area: "area", filled: "area",
  pie: "pie", donut: "donut", doughnut: "donut",
  histogram: "histogram", distribution: "histogram",
  box: "box", boxplot: "box",
};

/* Words that carry no instruction and can be ignored when deciding whether
   the whole request was understood. */
const FILLER = new Set([
  "make", "it", "the", "a", "an", "to", "into", "please", "can", "you",
  "change", "set", "turn", "switch", "convert", "chart", "graph", "this",
  "that", "them", "all", "and", "with", "as", "use", "using", "just",
  "now", "instead", "of", "be", "become", "look", "show", "me", "my",
  "i", "want", "would", "like", "could", "should", "put", "give", "add",
  "colour", "color", "colors", "colours", "in", "on", "by", "for", "is",
  "are", "please", "thanks", "ok", "okay", "do", "does", "let", "s",
  // Title phrasing: we anchor on the LAST keyword, so any earlier ones
  // ("rename the title to X" leaves "rename") are just wording.
  "rename", "title", "titled", "call", "called", "name", "named",
  "heading", "header",
]);

const HEX_RE = /#[0-9a-f]{6}\b/gi;

/**
 * @returns {{spec: object, changed: string[]} | null}
 *   A patched spec plus a human summary, or null to defer to the model.
 */
export function resolveLocalEdit(request, currentSpec, columns = []) {
  if (!currentSpec || typeof request !== "string") return null;

  const text = request.toLowerCase().trim();
  if (!text || text.length > 160) return null; // long asks are usually real questions

  // A question is a request for reasoning, never a field assignment.
  if (/[?]|^(why|what|how|which|who|when|explain|tell|describe)\b/.test(text)) {
    return null;
  }

  const spec = { ...currentSpec };
  const changed = [];
  const consumed = new Set();

  const consume = (...words) => words.forEach((w) => consumed.add(w));

  /* -- title, FIRST --
     A title is free text and always trails the keyword, so it has to be
     lifted out before anything else runs. Otherwise "name the chart Monthly
     Trend" reads "Trend" as a chart-type instruction and silently converts
     the chart to a line. */
  let scanSource = request;
  const TITLE_KW = /\b(title|titled|call|called|name|named|rename|heading|header)\b/gi;
  let lastKw = null;
  let kwMatch;
  while ((kwMatch = TITLE_KW.exec(request)) !== null) lastKw = kwMatch;
  if (lastKw) {
    const tail = request
      .slice(lastKw.index + lastKw[0].length)
      .replace(/^(?:\s+(?:it|to|as|the|this|chart|graph|is|be)\b|\s*[:=])+/i, "")
      .trim()
      .replace(/^["'\u201C\u2018]+|["'\u201D\u2019]+$/g, "")
      .trim();
    if (tail.length >= 2 && tail.length <= 80) {
      spec.title = tail;
      changed.push(`title -> "${spec.title}"`);
      // everything from the keyword onward was the title, not instructions
      scanSource = request.slice(0, lastKw.index);
    }
  }

  /* -- explicit hex colours -- */
  const hexes = scanSource.match(HEX_RE);
  if (hexes && hexes.length) {
    spec.colors = hexes.map((h) => h.toLowerCase());
    changed.push(`colours -> ${spec.colors.join(", ")}`);
    hexes.forEach((h) => consume(h.toLowerCase()));
  }

  const scan = scanSource.toLowerCase();
  const words = scan.split(/[^a-z0-9#.]+/).filter(Boolean);

  /* ── named colours ── */
  if (!hexes) {
    const found = words.filter((w) => COLOR_WORDS[w]);
    if (found.length) {
      spec.colors = found.map((w) => COLOR_WORDS[w]);
      changed.push(`colours -> ${found.join(", ")}`);
      consume(...found);
    }
  }

  /* ── chart type ── */
  for (const w of words) {
    if (CHART_WORDS[w]) {
      // "bar" inside "sort bar by value" is still a type change; safe enough.
      spec.chartType = CHART_WORDS[w];
      changed.push(`chart type -> ${spec.chartType}`);
      consume(w);
      break;
    }
  }

  /* ── orientation ── */
  if (/\bhorizontal(ly)?\b|\bsideways\b/.test(scan)) {
    spec.orientation = "h";
    changed.push("orientation -> horizontal");
    consume("horizontal", "horizontally", "sideways");
  } else if (/\bvertical(ly)?\b/.test(scan)) {
    spec.orientation = "v";
    changed.push("orientation -> vertical");
    consume("vertical", "vertically");
  } else if (/\bflip\b|\brotate\b|\bswap axes\b/.test(scan)) {
    spec.orientation = spec.orientation === "h" ? "v" : "h";
    changed.push(`orientation -> ${spec.orientation === "h" ? "horizontal" : "vertical"}`);
    consume("flip", "rotate", "swap", "axes");
  }

  /* ── stacking ── */
  if (/\b(un|not )?stack(ed|ing)?\b|\bgroup(ed)?\b|\bside by side\b/.test(scan)) {
    const un = /\bun ?stack|\bnot stack|\bgroup(ed)?\b|\bside by side\b/.test(scan);
    spec.stacked = !un;
    changed.push(un ? "grouped" : "stacked");
    consume("stack", "stacked", "stacking", "unstack", "unstacked",
            "group", "grouped", "side", "not", "un");
  }

  /* ── legend ── */
  if (/\blegend\b/.test(scan)) {
    const hide = /\b(hide|remove|no|without|drop|kill|off)\b/.test(scan);
    spec.showLegend = !hide;
    changed.push(hide ? "legend hidden" : "legend shown");
    consume("legend", "hide", "remove", "no", "without", "drop", "kill",
            "off", "display");
  }

  /* ── sort ── */
  const desc = /\b(desc(ending)?|highest|biggest|largest|top|most|high to low)\b/.test(scan);
  const asc = /\b(asc(ending)?|lowest|smallest|least|bottom|low to high)\b/.test(scan);
  if (/\bsort(ed)?\b|\border(ed)?\b|\brank(ed)?\b/.test(scan) || desc || asc) {
    if (desc || asc) {
      spec.sort = { by: "y", dir: desc ? "desc" : "asc" };
      changed.push(`sorted ${desc ? "high to low" : "low to high"}`);
    }
    consume("sort", "sorted", "order", "ordered", "rank", "ranked",
            "desc", "descending", "asc", "ascending", "highest", "lowest",
            "biggest", "smallest", "largest", "least", "most", "value",
            "values", "high", "low", "bottom", "first");
  }

  /* ── top N / limit ── */
  const nMatch = scan.match(/\b(?:top|first|only|limit|just)\s+(\d{1,4})\b/) ||
                 scan.match(/\b(\d{1,4})\s+(?:only|max|maximum)\b/);
  if (nMatch) {
    spec.limit = parseInt(nMatch[1], 10);
    if (!spec.sort) spec.sort = { by: "y", dir: "desc" };
    changed.push(`limited to ${spec.limit}`);
    consume("top", "first", "only", "limit", "just", "max", "maximum", nMatch[1]);
  }

  if (!changed.length) return null;

  /* ── precision guard ────────────────────────────────────────
     Anything meaningful left unexplained means we misread the request.
     Defer to the model rather than guess. */
  const leftover = words.filter(
    (w) => !consumed.has(w) && !FILLER.has(w) && isNaN(Number(w)) && w.length > 1,
  );
  // Column names mentioned by the user imply a data change we don't handle.
  const colWords = new Set(
    columns.flatMap((c) => c.toLowerCase().split(/[^a-z0-9]+/)).filter(Boolean),
  );
  if (leftover.some((w) => colWords.has(w))) return null;
  if (leftover.length) return null;

  return { spec, changed };
}

export { COLOR_WORDS, CHART_WORDS };
