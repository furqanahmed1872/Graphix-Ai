import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Disable static generation caching so file changes always take effect
  // This stops the issue where responsive CSS disappears after reload
  experimental: {
    staleTimes: {
      dynamic: 0,
      // Next.js requires >= 30 for the static client cache; 30 is the minimum.
      static: 30,
    },
  },

  // Force fresh headers — no browser caching of HTML in dev
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
