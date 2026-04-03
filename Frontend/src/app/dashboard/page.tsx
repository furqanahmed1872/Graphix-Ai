import RouteGuard from "@/components/RouteGuard";
import DashboardContent from "@/components/dashboard/DashboardContent";

export const metadata = { title: "Dashboard — Graphix" };

export default function DashboardPage() {
  return (
    <RouteGuard>
      <DashboardContent />
    </RouteGuard>
  );
}
