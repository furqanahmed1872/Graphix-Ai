"use client";

import { useEffect, useRef } from "react";

/**
 * Hero field — a radial chord graph drawn on canvas.
 *
 * Points sit on a circle; every point sends a hairline through the centre,
 * plus a scattering of chords between points. It rotates slowly and the
 * chords fade in and out on their own cycles, so the figure is never
 * static but never demands attention either.
 *
 * Honours prefers-reduced-motion by drawing a single static frame.
 */

const N = 128;

export default function GraphField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;
    let R = 0;

    // One curved spoke per rim node, all converging on the centre. The
    // earlier version drew rim-to-rim chords, which crossed each other into
    // a flat grey mesh with no focal point.
    let seed = 17;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const spokes = Array.from({ length: N }, () => ({
      // How far round the curve bends on its way in — this is what makes
      // the whole figure read as a slow vortex rather than a starburst.
      swirl: 0.1 + rnd() * 0.26,
      // Control-point distance from centre, as a fraction of R.
      bow: 0.34 + rnd() * 0.34,
      phase: rnd() * Math.PI * 2,
      speed: 0.22 + rnd() * 0.42,
      base: 0.07 + rnd() * 0.11,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = cv.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(w, h) * 0.47;
    };

    const draw = (time: number) => {
      const t = time / 1000;
      const rot = reduced ? 0 : t * 0.022;
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;

      for (let i = 0; i < N; i++) {
        const sp = spokes[i];
        const a = (i / N) * Math.PI * 2 + rot;
        const px = cx + Math.cos(a) * R;
        const py = cy + Math.sin(a) * R;
        // Strands stop short of the ring, so the dots stay a separate mark.
        const sx = cx + Math.cos(a) * R * 0.94;
        const sy = cy + Math.sin(a) * R * 0.94;

        // Control point sits between rim and centre, rotated round by the
        // swirl amount, which bends the spoke into a shallow arc.
        const ca = a + sp.swirl;
        const qx = cx + Math.cos(ca) * R * sp.bow;
        const qy = cy + Math.sin(ca) * R * sp.bow;

        const pulse = reduced ? 0.5 : (Math.sin(t * sp.speed + sp.phase) + 1) / 2;
        const alpha = sp.base + pulse * 0.2;

        ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(qx, qy, cx, cy);
        ctx.stroke();

        // Rim dot.
        ctx.fillStyle = `rgba(255,255,255,${(0.82 + pulse * 0.18).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tight convergent core.
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.06, "rgba(255,255,255,0.5)");
      g.addColorStop(0.3, "rgba(255,255,255,0.1)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.2, 0, Math.PI * 2);
      ctx.fill();

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(0);
    });
    ro.observe(cv);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="gxl-field"
    />
  );
}

/* ── Card line-art ────────────────────────────────────────────
   Hairline plates that sit in the top of each product card. All
   chart-shaped rather than generic circuitry, since that is what
   this product makes.                                           */

const artProps = {
  className: "gxl-art",
  viewBox: "0 0 320 220",
  fill: "none",
  stroke: "rgba(255,255,255,0.8)",
  strokeWidth: 1,
  vectorEffect: "non-scaling-stroke" as const,
  "aria-hidden": true,
};

export function ArtBars() {
  const bars = [40, 92, 66, 128, 104, 156];
  return (
    <svg {...artProps}>
      <path d="M34 186H286" />
      <path d="M34 186V44" />
      {bars.map((v, i) => (
        <rect key={i} x={56 + i * 38} y={186 - v} width={22} height={v} />
      ))}
      {[44, 80, 116, 152].map((y) => (
        <path key={y} d={`M34 ${y}H286`} stroke="rgba(255,255,255,0.28)" />
      ))}
    </svg>
  );
}

export function ArtLine() {
  return (
    <svg {...artProps}>
      <path d="M34 186H286" />
      <path d="M34 186V40" />
      <path d="M46 158 L86 132 L126 142 L166 96 L206 108 L246 58 L278 44" />
      <path
        d="M46 172 L86 164 L126 150 L166 140 L206 122 L246 112 L278 96"
        stroke="rgba(255,255,255,0.5)"
      />
      {[46, 86, 126, 166, 206, 246, 278].map((x, i) => (
        <circle key={x} cx={x} cy={[158, 132, 142, 96, 108, 58, 44][i]} r="3" fill="rgba(255,255,255,0.8)" stroke="none" />
      ))}
    </svg>
  );
}

export function ArtScatter() {
  const pts: [number, number][] = [
    [60, 160], [84, 138], [104, 150], [124, 116], [146, 128], [166, 96],
    [186, 110], [206, 74], [228, 88], [250, 56], [72, 172], [138, 158],
    [196, 132], [258, 100],
  ];
  return (
    <svg {...artProps}>
      <path d="M34 186H286" />
      <path d="M34 186V40" />
      <path d="M50 176 L272 52" strokeDasharray="5 4" stroke="rgba(255,255,255,0.65)" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4.5" />
      ))}
    </svg>
  );
}

export function ArtGrid() {
  return (
    <svg {...artProps}>
      {Array.from({ length: 7 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => (
          <rect
            key={`${r}-${c}`}
            x={34 + c * 25}
            y={34 + r * 22}
            width={25}
            height={22}
            stroke={`rgba(255,255,255,${0.12 + ((r * 10 + c) % 7) * 0.08})`}
          />
        )),
      )}
    </svg>
  );
}

export function ArtSurface() {
  const rows = Array.from({ length: 9 }, (_, r) => r);
  return (
    <svg {...artProps}>
      {rows.map((r) => {
        const y = 60 + r * 14;
        const amp = 26 - r * 2;
        let d = `M30 ${y}`;
        for (let x = 0; x <= 260; x += 20) {
          const yy = y - Math.sin((x / 260) * Math.PI * 2 + r * 0.5) * amp * 0.5;
          d += ` L${30 + x} ${yy.toFixed(1)}`;
        }
        return <path key={r} d={d} stroke={`rgba(255,255,255,${0.16 + r * 0.05})`} />;
      })}
    </svg>
  );
}

export function ArtFlow() {
  return (
    <svg {...artProps}>
      <rect x="34" y="46" width="58" height="30" />
      <rect x="34" y="96" width="58" height="30" />
      <rect x="34" y="146" width="58" height="30" />
      <rect x="228" y="72" width="58" height="30" />
      <rect x="228" y="128" width="58" height="30" />
      <rect x="140" y="96" width="40" height="30" />
      <path d="M92 61 H116 V111 H140" />
      <path d="M92 111 H140" />
      <path d="M92 161 H116 V111 H140" />
      <path d="M180 111 H204 V87 H228" />
      <path d="M180 111 H204 V143 H228" />
    </svg>
  );
}

/* Rounded trace paths used as a background motif on the blue bands. */
export function TraceField() {
  return (
    <svg
      className="gxl-art"
      viewBox="0 0 1200 520"
      fill="none"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="1"
      vectorEffect="non-scaling-stroke"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <path d="M-20 470 H300 a24 24 0 0 0 24-24 V236 a24 24 0 0 1 24-24 H900 a24 24 0 0 0 24-24 V-20" />
      <path d="M-20 400 H240 a24 24 0 0 0 24-24 V300 a24 24 0 0 1 24-24 H840 a24 24 0 0 0 24-24 V-20" />
      <path d="M-20 330 H180 a24 24 0 0 0 24-24 V364 a24 24 0 0 1 24-24 H780 a24 24 0 0 0 24-24 V-20"
        stroke="rgba(255,255,255,0.16)" />
      <path d="M1220 460 H1000 a24 24 0 0 1-24-24 V300 a24 24 0 0 0-24-24 H700"
        stroke="rgba(255,255,255,0.16)" />
    </svg>
  );
}
