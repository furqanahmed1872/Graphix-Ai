"use client";

/**
 * AppBootstrapper
 *
 * Wraps the entire app. On mount:
 *   1. If user has a stored token → call /bootstrap (loads all data into Zustand)
 *   2. Shows a loading splash screen UNTIL bootstrap completes
 *   3. Children (the actual app) only render once data is ready
 *
 * This means every component always has user/charts/templates ready in Zustand
 * on first render — no "loading" states scattered across the app.
 */

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/appStore";

interface Props {
  children: React.ReactNode;
}

export default function AppBootstrapper({ children }: Props) {
  const { isAuthenticated, isBootstrapped, isBootstrapping, bootstrapError, bootstrap, logout } =
    useAppStore();

  const bootstrapped = useRef(false);

  useEffect(() => {
    // Only run bootstrap once per mount, and only if authenticated
    if (isAuthenticated && !isBootstrapped && !isBootstrapping && !bootstrapped.current) {
      bootstrapped.current = true;
      bootstrap();
    }
  }, [isAuthenticated, isBootstrapped, isBootstrapping, bootstrap]);

  // Not logged in — just render children (they'll hit the route guard)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Logged in but bootstrap still loading — show splash
  if (!isBootstrapped) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#09090f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          zIndex: 9999,
        }}
      >
        {/* Logo / brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#00d4c8" fillOpacity="0.15" />
            <path d="M8 22L14 10L20 18L24 13" stroke="#00d4c8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="24" cy="13" r="2" fill="#00d4c8" />
          </svg>
          <span style={{ color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Graphix
          </span>
        </div>

        {bootstrapError ? (
          // Error state
          <div style={{ textAlign: "center", maxWidth: 320 }}>
            <p style={{ color: "#f87171", fontSize: 14, marginBottom: 16 }}>
              {bootstrapError}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => bootstrap()}
                style={{
                  background: "#00d4c8",
                  color: "#09090f",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 20px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
              <button
                onClick={() => logout()}
                style={{
                  background: "transparent",
                  color: "#6b7280",
                  border: "1px solid #3a3f47",
                  borderRadius: 6,
                  padding: "8px 20px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          // Loading spinner + message
          <div style={{ textAlign: "center" }}>
            <LoadingSpinner />
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 16 }}>
              {isBootstrapping ? "Loading your workspace…" : "Initializing…"}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Bootstrap complete — render the app
  return <>{children}</>;
}

function LoadingSpinner() {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        border: "2.5px solid rgba(0,212,200,0.15)",
        borderTop: "2.5px solid #00d4c8",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        margin: "0 auto",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
