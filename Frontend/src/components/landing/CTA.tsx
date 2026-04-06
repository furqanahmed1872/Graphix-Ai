"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const HOLD_FRAMES = 220;
const MORPH_FRAMES = 100;
type ChartMode = "pie" | "errorline" | "contour";
const CYCLE: ChartMode[] = ["pie", "errorline", "contour"];
const PIE_VALS = [0.32, 0.22, 0.18, 0.15, 0.13];
const LINE_N = 20;
const LINE_X = Array.from({ length: LINE_N }, (_, i) => i / (LINE_N - 1));
const LINE_Y = LINE_X.map(
  (x) => 0.3 + 0.5 * Math.sin(x * Math.PI * 1.8) + Math.random() * 0.05,
);
const ERROR_HI = LINE_Y.map((y, i) => y + 0.08 + Math.sin(i * 0.9) * 0.05);
const ERROR_LO = LINE_Y.map((y, i) => y - 0.08 - Math.sin(i * 0.9) * 0.05);
const CONT_W = 12,
  CONT_H = 10;
function contourZ(cx: number, cy: number) {
  const nx = cx / (CONT_W - 1),
    ny = cy / (CONT_H - 1);
  return (
    0.5 +
    0.4 * Math.sin(nx * Math.PI * 2.2) * Math.cos(ny * Math.PI * 1.8) +
    0.15 * Math.sin(nx * 6) * Math.sin(ny * 5)
  );
}

const PIE_COLORS = [
  new THREE.Color(0x06b6d4),
  new THREE.Color(0xa855f7),
  new THREE.Color(0x10b981),
  new THREE.Color(0xf59e0b),
  new THREE.Color(0xef4444),
];
const ERR_LINE = new THREE.Color(0x06b6d4);
const ERR_BAND = new THREE.Color(0x06b6d4);
const ERR_DOTS = new THREE.Color(0xa855f7);
const CONT_STOPS: [number, THREE.Color][] = [
  [0, new THREE.Color(0x1e3a5f)],
  [0.25, new THREE.Color(0x06b6d4)],
  [0.5, new THREE.Color(0x10b981)],
  [0.75, new THREE.Color(0xf59e0b)],
  [1, new THREE.Color(0xef4444)],
];
const ISO_COLORS = [
  new THREE.Color(0x38bdf8),
  new THREE.Color(0x34d399),
  new THREE.Color(0xfbbf24),
  new THREE.Color(0xf87171),
  new THREE.Color(0xe879f9),
];

function setOp(group: THREE.Group, op: number) {
  group.visible = op > 0.001;
  group.traverse((o) => {
    if ((o as THREE.Mesh).material) {
      const mat = (o as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = op * (mat.userData.baseOp ?? 1);
    }
  });
}

function ThreeCubeFooter() {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect((): (() => void) => {
    const el = mountRef.current;
    if (!el) return () => {};
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      34,
      el.clientWidth / el.clientHeight,
      0.1,
      500,
    );
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    let isOrbit = false,
      ox = 0,
      oy = 0,
      rotY = 0.3,
      rotX = 0.15,
      velY = 0,
      velX = 0,
      autoSpin = 0;
    const DAMPING = 0.88;
    const onMD = (e: MouseEvent) => {
      isOrbit = true;
      ox = e.clientX;
      oy = e.clientY;
      velY = velX = 0;
      renderer.domElement.style.cursor = "grabbing";
    };
    const onMM = (e: MouseEvent) => {
      if (!isOrbit) return;
      velY = (e.clientX - ox) * 0.007;
      velX = (e.clientY - oy) * 0.007;
      rotY += velY;
      rotX = Math.max(-1.1, Math.min(1.1, rotX + velX));
      ox = e.clientX;
      oy = e.clientY;
    };
    const onMU = () => {
      isOrbit = false;
      renderer.domElement.style.cursor = "grab";
    };
    renderer.domElement.addEventListener("mousedown", onMD);
    window.addEventListener("mousemove", onMM);
    window.addEventListener("mouseup", onMU);
    renderer.domElement.style.cursor = "grab";

    const root = new THREE.Group();
    scene.add(root);
    const chartGroup = new THREE.Group();
    root.add(chartGroup);
    const CW = 7,
      CH = 5;

    // Cage
    const cageEdges = [
      [
        [-CW / 2, -CH / 2, 0],
        [CW / 2, -CH / 2, 0],
      ],
      [
        [-CW / 2, CH / 2, 0],
        [CW / 2, CH / 2, 0],
      ],
      [
        [-CW / 2, -CH / 2, 0],
        [-CW / 2, CH / 2, 0],
      ],
      [
        [CW / 2, -CH / 2, 0],
        [CW / 2, CH / 2, 0],
      ],
    ];
    cageEdges.forEach(([a, b]) => {
      chartGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(...(a as [number, number, number])),
            new THREE.Vector3(...(b as [number, number, number])),
          ]),
          new THREE.LineBasicMaterial({
            color: 0x333344,
            transparent: true,
            opacity: 0.5,
          }),
        ),
      );
    });

    const mapX = (x: number) => (x - 0.5) * CW;
    const mapY = (y: number) => (y - 0.5) * CH;

    // PIE group
    const pieGroup = new THREE.Group();
    chartGroup.add(pieGroup);
    let startAngle = 0;
    PIE_VALS.forEach((v, i) => {
      const endAngle = startAngle + v * Math.PI * 2;
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.absarc(0, 0, 2.2, startAngle, endAngle, false);
      shape.lineTo(0, 0);
      const geo = new THREE.ShapeGeometry(shape, 32);
      const mat = new THREE.MeshBasicMaterial({
        color: PIE_COLORS[i],
        transparent: true,
        opacity: 0.88,
        side: THREE.DoubleSide,
      });
      mat.userData.baseOp = 0.88;
      pieGroup.add(new THREE.Mesh(geo, mat));
      startAngle = endAngle;
    });

    // ERROR LINE group
    const errGroup = new THREE.Group();
    chartGroup.add(errGroup);
    errGroup.visible = false;
    const bandPts: THREE.Vector3[] = [
      ...LINE_X.map((x, i) => new THREE.Vector3(mapX(x), mapY(ERROR_HI[i]), 0)),
      ...[...LINE_X]
        .reverse()
        .map(
          (x, i) =>
            new THREE.Vector3(mapX(x), mapY(ERROR_LO[LINE_N - 1 - i]), 0),
        ),
    ];
    const bandShape = new THREE.Shape(
      bandPts.map((p) => new THREE.Vector2(p.x, p.y)),
    );
    const bandMat = new THREE.MeshBasicMaterial({
      color: ERR_BAND,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    bandMat.userData.baseOp = 0.15;
    errGroup.add(new THREE.Mesh(new THREE.ShapeGeometry(bandShape), bandMat));
    const lineCurve = new THREE.CatmullRomCurve3(
      LINE_X.map((x, i) => new THREE.Vector3(mapX(x), mapY(LINE_Y[i]), 0)),
    );
    const lineMat = new THREE.MeshBasicMaterial({
      color: ERR_LINE,
      transparent: true,
      opacity: 0.95,
    });
    lineMat.userData.baseOp = 0.95;
    errGroup.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(lineCurve, 80, 0.055, 8, false),
        lineMat,
      ),
    );
    LINE_X.forEach((x, i) => {
      const dotMat = new THREE.MeshBasicMaterial({
        color: ERR_DOTS,
        transparent: true,
        opacity: 0.92,
      });
      dotMat.userData.baseOp = 0.92;
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 10, 10),
        dotMat,
      );
      dot.position.set(mapX(x), mapY(LINE_Y[i]), 0.05);
      errGroup.add(dot);
    });

    // CONTOUR group
    const contGroup = new THREE.Group();
    chartGroup.add(contGroup);
    contGroup.visible = false;
    for (let cy = 0; cy < CONT_H - 1; cy++) {
      for (let cx = 0; cx < CONT_W - 1; cx++) {
        const zAvg =
          (contourZ(cx, cy) +
            contourZ(cx + 1, cy) +
            contourZ(cx, cy + 1) +
            contourZ(cx + 1, cy + 1)) /
          4;
        const col = new THREE.Color();
        let ci = 0;
        while (ci < CONT_STOPS.length - 2 && zAvg > CONT_STOPS[ci + 1][0]) ci++;
        const [t0, c0] = CONT_STOPS[ci],
          [t1, c1] = CONT_STOPS[ci + 1];
        col.lerpColors(
          c0,
          c1,
          Math.max(0, Math.min(1, (zAvg - t0) / (t1 - t0))),
        );
        const cellW = CW / (CONT_W - 1),
          cellH = CH / (CONT_H - 1);
        const cellMat = new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.82,
          side: THREE.DoubleSide,
        });
        cellMat.userData.baseOp = 0.82;
        const cell = new THREE.Mesh(
          new THREE.PlaneGeometry(cellW * 0.92, cellH * 0.92),
          cellMat,
        );
        cell.position.set(
          (cx / (CONT_W - 1) - 0.5) * CW + cellW / 2,
          (cy / (CONT_H - 1) - 0.5) * CH + cellH / 2,
          0,
        );
        contGroup.add(cell);
      }
    }

    const showPie = (op: number) => setOp(pieGroup, op);
    const showErr = (op: number) => setOp(errGroup, op);
    const showContour = (op: number) => setOp(contGroup, op);

    root.scale.setScalar(0.01);
    let entryFrame = 0;
    const ENTRY_FRAMES = 90;
    showPie(1);
    showErr(0);
    showContour(0);
    let modeIdx = 0,
      phase: "hold" | "morph" = "hold",
      timer = 0,
      rafId: number;

    const animate = () => {
      timer++;
      if (entryFrame < ENTRY_FRAMES) {
        entryFrame++;
        root.scale.setScalar(
          0.01 + easeInOut(entryFrame / ENTRY_FRAMES) * 0.99,
        );
      }
      if (!isOrbit) {
        velY *= DAMPING;
        velX *= DAMPING;
        rotY += velY;
        rotX = Math.max(-1.1, Math.min(1.1, rotX + velX));
        if (Math.abs(velY) + Math.abs(velX) < 0.0005) autoSpin += 0.003;
      } else autoSpin = rotY;
      root.rotation.y = isOrbit ? rotY : autoSpin;
      root.rotation.x = rotX;
      if (phase === "hold" && timer >= HOLD_FRAMES) {
        phase = "morph";
        timer = 0;
      }
      if (phase === "morph") {
        const t = Math.min(timer / MORPH_FRAMES, 1),
          e = easeInOut(t);
        const cur = CYCLE[modeIdx % 3],
          nxt = CYCLE[(modeIdx + 1) % 3];
        const fade = (m: ChartMode, op: number) => {
          if (m === "pie") showPie(op);
          else if (m === "errorline") showErr(op);
          else showContour(op);
        };
        fade(cur, 1 - e);
        fade(nxt, e);
        if (t >= 1) {
          phase = "hold";
          timer = 0;
          modeIdx++;
        }
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    const onResize = () => {
      if (!el) return;
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(rafId);
      renderer.domElement.removeEventListener("mousedown", onMD);
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("mouseup", onMU);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);
  return <div ref={mountRef} className="w-full h-full" />;
}

// ─── CountUp ──────────────────────────────────────────────────────────────────
function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        let start: number | null = null;
        const step = (ts: number) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / 1400, 1);
          setVal(Math.round(easeInOut(p) * target));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

const CLOSING_WORDS = "The last chart tool you'll ever need.".split(" ");

// ─── CtaSection ──────────────────────────────────────────────────────────────
export default function CTA() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setReady(true)),
    );
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <>
      <style>{`
        .cta-root [data-anim]                       { opacity: 0; }
        .cta-root.cta-ready [data-anim="bar"]       { animation: ctaFD .5s  ease  0.0s  forwards; }
        .cta-root.cta-ready [data-anim="cube"]      { animation: ctaSI .85s cubic-bezier(.22,1,.36,1) .3s forwards; }
        .cta-root.cta-ready [data-anim="sub"]       { animation: ctaFU .6s  ease  0.72s forwards; }
        .cta-root.cta-ready [data-anim="stats"]     { animation: ctaFU .6s  ease  0.80s forwards; }
        .cta-root.cta-ready [data-anim="cta"]       { animation: ctaFU .6s  ease  0.90s forwards; }
        .cta-root.cta-ready [data-anim="legal"]     { animation: ctaFU .5s  ease  1.0s  forwards; }
        ${CLOSING_WORDS.map((_, i) => `.cta-root.cta-ready [data-anim="word-${i}"] { animation: ctaW .55s cubic-bezier(.22,1,.36,1) ${0.08 + i * 0.08}s forwards; }`).join("")}
        @keyframes ctaFD { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ctaFU { from{opacity:0;transform:translateY(16px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes ctaW  { from{opacity:0;transform:translateY(22px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes ctaSI { from{opacity:0;transform:scale(0.93) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes ctaBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        .cta-cursor { display:inline-block; width:3px; height:0.85em; background:#0891b2; margin-left:3px; vertical-align:text-bottom; animation:ctaBlink 1.1s step-end infinite; }
        .cta-btn { background:#0891b2; color:#fff; padding:12px 28px; font-size:13px; letter-spacing:0.15em; font-weight:700; border:none; cursor:pointer; transition:filter .15s,transform .15s; text-transform:uppercase; }
        .cta-btn:hover { filter:brightness(1.25); transform:translateY(-1px); }
        .cta-ghost { background:transparent; color:#fff; padding:12px 28px; font-size:13px; letter-spacing:0.15em; border:1px solid rgba(255,255,255,0.35); cursor:pointer; transition:background .15s,color .15s; text-transform:uppercase; }
        .cta-ghost:hover { background:#fff; color:#111; }
        .cta-stat-val { font-size:2.2rem; font-weight:800; letter-spacing:-0.04em; line-height:1; }
        .cta-stat-label { font-size:10px; letter-spacing:0.18em; color:#888899; margin-top:4px; }
        .cta-grid-bg { position:absolute; inset:0; pointer-events:none; background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px); background-size:40px 40px; }

        /* ── RESPONSIVE ── */
        .cta-flex-row { display: flex; flex-wrap: wrap; }
        .cta-cube-col { flex: 0 0 52%; height: min(560px, 65vh); overflow: visible; min-width: 280px; }
        .cta-copy-col { flex: 1; min-width: 280px; position: relative; padding: 48px 44px 48px 32px; display: flex; flex-direction: column; justify-content: center; }
        .cta-stats-row { display: flex; gap: 28px; margin-bottom: 36px; flex-wrap: wrap; }

        @media (max-width: 767px) {
          .cta-cube-col { display: none !important; }
          .cta-copy-col { flex: none !important; width: 100% !important; padding: 40px 20px 48px !important; min-width: unset !important; }
          .cta-stats-row { gap: 20px !important; }
          .cta-stat-val { font-size: 1.8rem !important; }
          .cta-btn, .cta-ghost { width: 100%; text-align: center; justify-content: center; }
          [data-anim="cta"] { display: flex !important; flex-direction: column !important; gap: 10px !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .cta-cube-col { flex: 0 0 44% !important; height: min(420px, 55vh) !important; }
          .cta-copy-col { padding: 40px 28px 40px 24px !important; }
        }
      `}</style>

      <div
        className={`cta-root${ready ? " cta-ready" : ""}`}
        style={{ background: "white", color: "black", fontFamily: "monospace" }}
      >
        <div className="cta-flex-row">
          {/* LEFT: 3D cube */}
          <div data-anim="cube" className="cta-cube-col">
            <ThreeCubeFooter />
          </div>

          {/* RIGHT: CTA copy */}
          <div className="cta-copy-col">
            <div className="cta-grid-bg" />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div data-anim="bar" style={{ background: "white" }} />

              <h2
                style={{
                  fontSize: "clamp(2rem,4vw,3.5rem)",
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: "-0.04em",
                  marginBottom: 20,
                  color: "black",
                }}
              >
                {CLOSING_WORDS.map((word, i) => (
                  <span
                    key={i}
                    data-anim={`word-${i}`}
                    style={{ display: "inline-block", marginRight: "0.28em" }}
                  >
                    {word === "last" ? (
                      <span style={{ color: "#06b6d4" }}>{word}</span>
                    ) : (
                      word
                    )}
                  </span>
                ))}
                <span className="cta-cursor" />
              </h2>

              <p
                data-anim="sub"
                style={{
                  color: "#666",
                  lineHeight: 1.7,
                  marginBottom: 32,
                  maxWidth: 380,
                  fontSize: 15,
                }}
              >
                You've seen what Graphix can do. Now make it yours — free during
                beta, no card required, cancel whenever you want (you won't).
              </p>

              <div data-anim="stats" className="cta-stats-row">
                {[
                  {
                    val: 70,
                    suffix: "+",
                    label: "CHART TYPES",
                    color: "black",
                  },
                  {
                    val: 12847,
                    suffix: "",
                    label: "CHARTS TODAY",
                    color: "black",
                  },
                  {
                    val: null,
                    suffix: "",
                    label: "COST · BETA",
                    color: "#06b6d4",
                    override: "$0",
                  },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="cta-stat-val" style={{ color: s.color }}>
                      {s.override ?? (
                        <CountUp target={s.val!} suffix={s.suffix} />
                      )}
                    </div>
                    <div className="cta-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <div
                data-anim="cta"
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Link
                  className="bg-cyan-600 text-white font-bold px-6 py-3 hover:bg-cyan-700 cursor-pointer text-sm tracking-widest uppercase"
                  href="/dashboard"
                >
                  Try Now
                </Link>
                <Link
                  className="font-bold px-6 py-3 border border-black hover:bg-black hover:text-white transition-colors text-sm tracking-widest uppercase"
                  href="/about"
                >
                  About Us
                </Link>
              </div>

              <p
                data-anim="legal"
                style={{
                  marginTop: 20,
                  fontSize: 10,
                  color: "#444455",
                  letterSpacing: "0.14em",
                }}
              >
                FREE BETA · NO CREDIT CARD · SSL ENCRYPTED · GDPR COMPLIANT
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
