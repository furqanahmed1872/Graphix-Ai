
import DataChartEditor from "./ExelChartEditor";
import RouteGuard from "@/components/RouteGuard";
export const metadata = { title: "Excel Editor — Graphix" };
export default function Panel() {
  return (
    <RouteGuard>
      <div className="w-full h-screen grid items-center justify-center">
   
        <DataChartEditor />
      </div>
    </RouteGuard>
  );
}
  
