// components/InputBar.tsx
"use client";

import { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import ChartTypeSelector from "./Charttypeselector";
import { autoDetectChartHint, csvToPlotly } from "./Csvprocessor";

interface SelectedChart {
  groupLabel: string;
  subLabel: string;
  prompt: string | null;
}

interface InputBarProps {
  onSend: (
    prompt: string,
    fileContent: string,
    fileName: string,
    prebuiltConfig?: any,
  ) => void;
  isLoading: boolean;
}

export default function InputBar({ onSend, isLoading }: InputBarProps) {
  const [input, setInput] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");

  // --- Persistent user selection from the chart type selector ---
  // This NEVER gets overwritten by CSV detection. Only the user can change it.
  const [chartType, setChartType] = useState<SelectedChart | null>(null);

  // --- CSV-only state ---
  // These only exist while a CSV is attached and the auto-detect banner is showing.
  const [detectedHint, setDetectedHint] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const [focused, setFocused] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // When a file is attached, detect chart type for the banner — but NEVER touch chartType
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
    } catch (err) {
      console.error("Failed to read file:", err);
    }
  };

  // Clears file + CSV detection state. Does NOT touch chartType.
  const clearFile = () => {
    setFileContent("");
    setFileName("");
    setDetectedHint(null);
    setBannerDismissed(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  // After send: clear input and file. chartType stays persistent.
  const afterSend = () => {
    setInput("");
    clearFile();
  };

  const send = () => {
    if (!input.trim() || isLoading) return;

    if (fileContent) {
      // --- CSV path ---

      // Banner is showing and user hasn't dismissed it → use CSV fast-path
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

      // Banner was dismissed (or no hint detected) → send to AI
      // Use the persistent chartType from the selector if set
      let fp = input.trim();
      if (chartType)
        fp += chartType.prompt
          ? ` — make this  a  new "${chartType.prompt}"`
          : ` — make this  a new ${chartType.groupLabel} chart `;
      onSend(fp, fileContent, fileName);
      afterSend();
      return;
    }

    // --- No file path — always use persistent chartType ---
    let fp = input.trim();
    if (chartType)
      fp += chartType.prompt
        ? ` — make this  a  new "${chartType.prompt}"`
        : ` — make this  a new ${chartType.groupLabel} chart `;
    onSend(fp, "", "");
    afterSend();
  };

  const canSend = !!input.trim() && !isLoading;

  // Banner shows only when: file attached + hint detected + not dismissed
  const showBanner = !!fileContent && !!detectedHint && !bannerDismissed;

  // Placeholder reflects context clearly
  const getPlaceholder = () => {
    if (showBanner) return `Title for your ${detectedHint} chart…`;
    if (chartType)
      return `${chartType.subLabel === "AI Choice" ? chartType.groupLabel : chartType.subLabel}…`;
    return 'e.g. "Monthly sales Q1–Q4"';
  };

  return (
    <>
      <style>{`
        .ib-row {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .ib-row.ib-focused {
          border-color: rgba(6,182,212,0.35);
          box-shadow: 0 0 0 3px rgba(6,182,212,0.05);
        }
        .ib-input-field {
          color: rgba(255,255,255,0.82);
          background: transparent;
          border: none;
          outline: none;
          caret-color: #06b6d4;
        }
        .ib-input-field::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>

      <div
        className="flex-shrink-0 px-3 sm:px-4 md:px-6 pt-2 pb-3"
        style={{
          background: "rgba(9,9,15,0.9)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        }}
      >
        <div className="max-w-[820px] mx-auto flex flex-col gap-1.5 my-1">
          {/* CSV auto-detect banner */}
          {showBanner && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
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
          <div
            className={`ib-row flex items-center gap-1.5 rounded-xl px-2.5 py-2 ${focused ? "ib-focused" : ""}`}
          >
            {/* Attach */}
            <label
              htmlFor="ib-file-upload"
              className="cursor-pointer flex items-center justify-center w-7 h-7 rounded-lg transition-all flex-shrink-0"
              style={{ color: "rgba(255,255,255,0.28)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "rgba(255,255,255,0.65)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "rgba(255,255,255,0.28)")
              }
              title="Attach CSV or JSON"
            >
              <input
                id="ib-file-upload"
                ref={fileRef}
                type="file"
                accept=".csv,.json,text/csv,text/plain,application/json"
                onChange={handleFile}
                className="hidden"
              />
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </label>

            {/* Chart type selector — only the user can change this */}
            <ChartTypeSelector
              onSelect={(ct) => {
                setChartType(ct);
              }}
            />

            {/* Divider */}
            <div
              className="w-px h-4 flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.07)" }}
            />

            {/* File pill */}
            {fileName && (
              <div
                className="flex items-center gap-1 text-[10px] rounded px-1.5 py-0.5 max-w-[72px] sm:max-w-[96px] flex-shrink-0"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.38)",
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
                  style={{ color: "rgba(255,255,255,0.22)", flexShrink: 0 }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.55)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.22)")
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
              className="ib-input-field flex-1 text-[13px] min-w-0"
              style={{ letterSpacing: "-0.01em" }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
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
                background: canSend ? "#06b6d4" : "rgba(255,255,255,0.05)",
                color: canSend ? "#000" : "rgba(255,255,255,0.18)",
                boxShadow: canSend ? "0 0 14px rgba(6,182,212,0.25)" : "none",
                cursor: canSend ? "pointer" : "default",
              }}
            >
              {isLoading ? (
                <svg
                  className="animate-spin"
                  width="10"
                  height="10"
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
                  width="10"
                  height="10"
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
        </div>
      </div>
    </>
  );
}
