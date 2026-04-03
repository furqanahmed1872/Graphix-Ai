"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = ["PRODUCT", "DOCS", "RESOURCES ▾", "ABOUT ▾"];

export default function Navbar() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setReady(true)),
    );
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <nav
      className="relative z-20 flex items-center justify-between h-14 px-4 md:px-11 border-b border-x border-white/20 transition-all duration-700"
      style={{
        opacity: ready ? 1 : 0,
        transform: ready ? "translateY(0)" : "translateY(-14px)",
      }}
    >
      <div className="border-2 border-white px-2.5 py-0.5 text-white text-lg tracking-tight shrink-0">
        Graphix
      </div>

      <div className="hidden md:flex items-center gap-9">
        {NAV_LINKS.map((label) => (
          <a
            key={label}
            href="#"
            className="text-white hover:text-white transition-colors duration-150 no-underline tracking-wider text-xs"
          >
            {label}
          </a>
        ))}
      </div>

      <Link
        href="/signin"
        className="group relative min-h-[40px] hover:cursor-pointer rounded-xs w-40 overflow-hidden bg-white text-black shadow-2xl transition-all before:absolute before:left-0 before:top-0 before:h-0 before:w-1/4 before:bg-cyan-600 before:duration-500 after:absolute after:bottom-0 after:right-0 after:h-0 after:w-1/4 after:bg-cyan-600 after:duration-500 hover:text-white hover:before:h-full hover:after:h-full"
      >
        <span className="top-0 flex h-full w-full items-center justify-center before:absolute before:bottom-0 before:left-1/4 before:z-0 before:h-0 before:w-1/4 before:bg-cyan-600 before:duration-500 after:absolute after:right-1/4 after:top-0 after:z-0 after:h-0 after:w-1/4 after:bg-cyan-600 after:duration-500 hover:text-white group-hover:before:h-full group-hover:after:h-full" />
        <span className="absolute bottom-0 left-0 right-0 top-0 z-10 flex h-full w-full items-center justify-center group-hover:text-white">
          Sign In / Sign Up
        </span>
      </Link>
    </nav>
  );
}
