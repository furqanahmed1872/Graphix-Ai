import { useEffect, useState, useRef, ChangeEvent } from "react";
import ChartTypeSelector from "./Charttypeselector";
import { autoDetectChartHint, csvToPlotly } from "./Csvprocessor";

const words = [
  "bar charts",
  "heatmaps",
  "pie charts",
  "scatter plots",
  "dashboards",
];

interface SelectedChart {
  groupLabel: string;
  subLabel: string;
  prompt: string | null;
}

interface WaveHeroProps {
  onSend: (
    prompt: string,
    fileContent: string,
    fileName: string,
    prebuiltConfig?: any,
  ) => void;
  isLoading: boolean;
}

export default function WaveHero({ onSend, isLoading }: WaveHeroProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");

  // Persistent user chart type — never overwritten by CSV detection
  const [chartType, setChartType] = useState<SelectedChart | null>(null);

  // CSV-only state
  const [detectedHint, setDetectedHint] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setVisible(true);
      }, 300);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await file.text();
      setFileContent(text);
      setBannerDismissed(false);
      const hint = autoDetectChartHint(text);
      setDetectedHint(hint !== "auto" ? hint : null);
      // Never touch chartType here
    } catch (err) {
      console.error("Failed to read file:", err);
    }
  };

  const clearFile = () => {
    setFileContent("");
    setFileName("");
    setDetectedHint(null);
    setBannerDismissed(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const afterSend = () => {
    setInput("");
    clearFile();
  };

  const send = () => {
    if (!input.trim() || isLoading) return;

    if (fileContent) {
      // CSV fast-path: banner visible and not dismissed
      if (detectedHint && !bannerDismissed) {
        const config = csvToPlotly(
          fileContent,
          detectedHint as any,
          input.trim(),
        );
        onSend(input.trim(), fileContent, fileName, config);
        afterSend();
        return;
      }

      // Banner dismissed → send to AI with persistent chartType
      let fp = input.trim();
      if (chartType)
        fp += chartType.prompt
          ? ` — make this as a "${chartType.prompt}"`
          : ` — make this as a ${chartType.groupLabel} chart (choose the best subtype)`;
      onSend(fp, fileContent, fileName);
      afterSend();
      return;
    }

    // No file — always use persistent chartType
    let fp = input.trim();
    if (chartType)
      fp += chartType.prompt
        ? ` — make this as a "${chartType.prompt}"`
        : ` — make this as a ${chartType.groupLabel} chart (choose the best subtype)`;
    onSend(fp, "", "");
    afterSend();
  };

  const canSend = !!input.trim() && !isLoading;
  const showBanner = !!fileContent && !!detectedHint && !bannerDismissed;

  const getPlaceholder = () => {
    if (showBanner) return `Title for your ${detectedHint} chart…`;
    if (chartType)
      return `${chartType.subLabel === "AI Choice" ? chartType.groupLabel : chartType.subLabel}…`;
    return 'e.g. "Monthly sales Q1–Q4 2024"';
  };

  return (
    <>
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-fade-1 { animation: heroFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .hero-fade-2 { animation: heroFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .hero-fade-3 { animation: heroFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
        .hero-word {
          display: inline-block;
          transition: opacity 0.28s ease, transform 0.28s ease;
        }
        .hero-word-hidden { opacity: 0; transform: translateY(4px); }
        .hero-word-visible { opacity: 1; transform: translateY(0); }

        .hero-input-row {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .hero-input-row:focus-within {
          border-color: rgba(6,182,212,0.4);
          box-shadow: 0 0 0 3px rgba(6,182,212,0.06), 0 4px 24px rgba(0,0,0,0.3);
        }
        .hero-text-input::placeholder { color: rgba(255,255,255,0.2); }
        .hero-text-input { color: rgba(255,255,255,0.85); caret-color: #06b6d4; }
        .hero-text-input:focus { outline: none; }

        .chip {
          font-size: 11px;
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.04);
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.14s ease;
          flex-shrink: 0;
        }
        .chip:hover {
          border-color: rgba(6,182,212,0.35);
          color: rgba(6,182,212,0.85);
          background: rgba(6,182,212,0.06);
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6 gap-8 sm:gap-10 py-10">
        {/* Logo + Wordmark */}
        <div className="hero-fade-1 flex flex-col items-center gap-3">
          <div
            className="flex items-center justify-center rounded-2xl"
            style={{
              width: 52,
              height: 52,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 0 32px rgba(6,182,212,0.08)",
            }}
          >
            <img
              src="/logo.png"
              alt=""
              style={{ height: 28, filter: "brightness(0) invert(1)" }}
            />
          </div>

          <div className="text-center">
            <h1
              style={{
                fontSize: "clamp(48px, 8vw, 80px)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "#ffffff",
                lineHeight: 1,
                margin: 0,
              }}
            >
              Graphix
            </h1>
            <p
              style={{
                marginTop: 10,
                fontSize: 14,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "-0.01em",
              }}
            >
              Turn your data into{" "}
              <span
                className={`hero-word ${visible ? "hero-word-visible" : "hero-word-hidden"}`}
                style={{ color: "#22d3ee" }}
              >
                {words[index]}
              </span>
            </p>
          </div>
        </div>

        {/* Input section */}
        <div className="hero-fade-2 w-full" style={{ maxWidth: 600 }}>
          {/* CSV banner */}
          {showBanner && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-2"
              style={{
                background: "rgba(6,182,212,0.07)",
                border: "1px solid rgba(6,182,212,0.2)",
                color: "rgba(34,211,238,0.9)",
              }}
            >
              <span style={{ fontSize: 10 }}>✦</span>
              <span>
                Detected <strong>{detectedHint}</strong> — will render without
                AI
              </span>
              <button
                onClick={() => setBannerDismissed(true)}
                className="ml-auto transition-opacity hover:opacity-70"
              >
                ✕
              </button>
            </div>
          )}

          {/* Input row */}
          <div className="hero-input-row flex items-center gap-2 rounded-xl px-3 py-2.5">
            {/* Attach */}
            <label
              htmlFor="hero-file-upload"
              className="cursor-pointer flex items-center justify-center w-7 h-7 rounded-lg transition-all flex-shrink-0"
              style={{ color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "rgba(255,255,255,0.7)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "rgba(255,255,255,0.3)")
              }
              title="Attach CSV or JSON"
            >
              <input
                id="hero-file-upload"
                ref={fileRef}
                type="file"
                accept=".csv,.json,text/csv,text/plain,application/json"
                onChange={handleFile}
                className="hidden"
              />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </label>

            {/* Chart type selector — user-controlled only */}
            <ChartTypeSelector onSelect={(ct) => setChartType(ct)} />

            {/* Divider */}
            <div
              className="w-px h-4 flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />

            {/* File pill */}
            {fileName && (
              <div
                className="flex items-center gap-1 text-[10px] rounded px-1.5 py-0.5 max-w-[80px] flex-shrink-0"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "monospace",
                }}
              >
                {showBanner && (
                  <span
                    style={{
                      color: "#22d3ee",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {detectedHint}
                  </span>
                )}
                <span className="truncate">{fileName}</span>
                <button
                  onClick={clearFile}
                  style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.6)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.25)")
                  }
                >
                  <svg
                    width="7"
                    height="7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}

            {/* Text input */}
            <input
              className="hero-text-input flex-1 bg-transparent border-none min-w-0 text-sm"
              style={{ fontSize: 13, letterSpacing: "-0.01em" }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={getPlaceholder()}
              disabled={isLoading}
            />

            {/* Send */}
            <button
              onClick={send}
              disabled={!canSend}
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: canSend ? "#06b6d4" : "rgba(255,255,255,0.06)",
                color: canSend ? "#000" : "rgba(255,255,255,0.2)",
                boxShadow: canSend ? "0 0 16px rgba(6,182,212,0.3)" : "none",
                cursor: canSend ? "pointer" : "default",
              }}
            >
              {isLoading ? (
                <svg
                  className="animate-spin"
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              )}
            </button>
          </div>

          {/* Suggestion chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1 sm:justify-center">
            {[
              "Monthly revenue Q1–Q4",
              "User growth by region",
              "Sales vs forecast",
              "Top 10 products",
            ].map((s) => (
              <button key={s} onClick={() => setInput(s)} className="chip">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
