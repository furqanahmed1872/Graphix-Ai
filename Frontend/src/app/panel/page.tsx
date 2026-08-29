import DataChartEditor from "./ExelChartEditor";
import RouteGuard from "@/components/RouteGuard";

export const metadata = {
  title: "Excel Editor — Graphix",
  description:
    "A spreadsheet and a live chart in one split view. Edit on the left, the chart redraws on the right.",
};

export default function Panel() {
  return (
    <RouteGuard>
      {/* The editor manages its own full-height layout; the old wrapper used
          `grid items-center justify-center`, which centred a fixed-height
          child and left dead bands above and below it. */}
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: "var(--gx-bg)",
        }}
      >
        <DataChartEditor />
      </div>
    </RouteGuard>
  );
}
