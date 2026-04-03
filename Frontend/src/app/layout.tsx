import type { Metadata } from "next";
import "./globals.css";
import AppBootstrapper from "@/components/AppBootstrapper";

export const metadata: Metadata = {
  title: "Graphix — AI Data Visualization",
  description: "Turn your data into beautiful charts with AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#111212]">
        {/*
          AppBootstrapper wraps everything.
          - If user is authenticated, it calls /bootstrap once and shows a
            splash screen until all data is loaded into Zustand.
          - Then children (pages) render with full data available.
        */}
        <AppBootstrapper>{children}</AppBootstrapper>
      </body>
    </html>
  );
}
