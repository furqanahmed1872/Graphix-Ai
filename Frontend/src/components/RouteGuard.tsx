"use client";

/**
 * RouteGuard
 *
 * Wrap any page component with this to require authentication.
 * If user is not logged in (no token in Zustand), redirect to /signin.
 *
 * Usage in page.tsx:
 *   export default function DashboardPage() {
 *     return <RouteGuard><DashboardContent /></RouteGuard>;
 *   }
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";

interface Props {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function RouteGuard({
  children,
  redirectTo = "/signin",
}: Props) {
  const router = useRouter();
  const { isAuthenticated, isBootstrapped, isBootstrapping, _hasHydrated } =
    useAppStore();

  useEffect(() => {
    // ✅ KEY FIX: Only redirect AFTER Zustand has read from localStorage
    if (_hasHydrated && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [_hasHydrated, isAuthenticated, router, redirectTo]);

  // ✅ While localStorage is being read, show nothing (not a redirect)
  if (!_hasHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isBootstrapped && isBootstrapping) {
    return null;
  }

  return <>{children}</>;
}
