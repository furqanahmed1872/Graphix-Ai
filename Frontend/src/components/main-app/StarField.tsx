// components/StarField.tsx
"use client";

export default function StarField() {
  return (
    <>
      <style jsx global>{`
        .sf-base {
          position: fixed;
          inset: 0;
          z-index: -2;
          background: #09090f;
          pointer-events: none;
        }

        /* Very subtle radial glow — single, centered, restrained */
        .sf-glow {
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            radial-gradient(
              ellipse 80% 60% at 50% 0%,
              rgba(6, 182, 212, 0.045) 0%,
              transparent 70%
            ),
            radial-gradient(
              ellipse 60% 40% at 80% 100%,
              rgba(99, 102, 241, 0.03) 0%,
              transparent 60%
            );
        }

        /* Fine dot grid for texture */
        .sf-grid {
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background-image: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.022) 1px,
            transparent 1px
          );
          background-size: 28px 28px;
        }
      `}</style>

      <div className="sf-base" />
      <div className="sf-grid" />
      <div className="sf-glow" />
    </>
  );
}
