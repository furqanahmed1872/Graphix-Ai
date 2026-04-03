import RouteGuard from "@/components/RouteGuard";
import GraphApp from "@/components/main-app/GraphApp";

export const metadata = { title: "App — Graphix" };

export default function AppPage() {
  return (
    <RouteGuard>
      <GraphApp />
    </RouteGuard>
  );
}
