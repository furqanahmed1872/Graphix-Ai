"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/appStore";

function CallbackScreen({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#090b0e",
        color: "rgba(255,255,255,0.4)",
        fontSize: 14,
        fontFamily: "monospace",
      }}
    >
      {label}
    </div>
  );
}

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken, bootstrap } = useAppStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error || !token) {
      router.replace("/signin?error=oauth_failed");
      return;
    }

    // Set cookie for Next.js middleware
    document.cookie = `graphix_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;

    // Hydrate Zustand + bootstrap all user data
    setToken(token);
    bootstrap().then(() => {
      router.replace("/dashboard");
    });
  }, []);

  return <CallbackScreen label="Signing you in…" />;
}

export default function AuthCallbackPage() {
  // useSearchParams() needs a Suspense boundary, otherwise the whole route
  // opts out of static prerendering and `next build` fails.
  return (
    <Suspense fallback={<CallbackScreen label="Signing you in…" />}>
      <AuthCallback />
    </Suspense>
  );
}
