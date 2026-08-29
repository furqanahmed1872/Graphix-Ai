"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SERIES_PAPER, RAMP_PAPER, hexInt } from "@/lib/chartTheme";

// ─── Colors ───────────────────────────────────────────────────────────────────
/* This cube sits on the paper ground, so it uses the darkened series. */
const GREY_AXIS = new THREE.Color(0x1a1a16).lerp(new THREE.Color(0xf4f2ea), 0.58);
const GREY_GRID = new THREE.Color(0x1a1a16).lerp(new THREE.Color(0xf4f2ea), 0.86);
const GREY_CAGE = new THREE.Color(0x1a1a16).lerp(new THREE.Color(0xf4f2ea), 0.72);

const PIE_C = SERIES_PAPER.map((c) => new THREE.Color(hexInt(c)));
const ERR_LINE = new THREE.Color(hexInt(SERIES_PAPER[0]));
const ERR_BAND = new THREE.Color(hexInt(SERIES_PAPER[0]));
const ERR_BARS = new THREE.Color(hexInt(SERIES_PAPER[1]));
const ERR_DOTS = new THREE.Color(hexInt(SERIES_PAPER[2]));
const CONT_STOPS: [number, THREE.Color][] = RAMP_PAPER.map(
  ([t, c]) => [t, new THREE.Color(hexInt(c))] as [number, THREE.Color],
);
const ISO_COLORS = RAMP_PAPER.slice(1).map(([, c]) => new THREE.Color(hexInt(c)));

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

// ─── Three.js cube ────────────────────────────────────────────────────────────
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
      oy = 0;
    let rotY = 0.3,
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

    const CAGE = 3.2,
      DIVS = 10;
    const cageMat = new THREE.LineBasicMaterial({
      color: GREY_CAGE,
      transparent: true,
      opacity: 0.22,
    });
    const cageGroup = new THREE.Group();
    root.add(cageGroup);
    const addLine = (
      x1: number,
      y1: number,
      z1: number,
      x2: number,
      y2: number,
      z2: number,
    ) =>
      cageGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x1, y1, z1),
            new THREE.Vector3(x2, y2, z2),
          ]),
          cageMat,
        ),
      );
    for (let i = 0; i <= DIVS; i++) {
      const t = -CAGE + ((CAGE * 2) / DIVS) * i;
      addLine(-CAGE, t, CAGE, CAGE, t, CAGE);
      addLine(t, -CAGE, CAGE, t, CAGE, CAGE);
      addLine(-CAGE, t, -CAGE, CAGE, t, -CAGE);
      addLine(t, -CAGE, -CAGE, t, CAGE, -CAGE);
      addLine(-CAGE, t, -CAGE, -CAGE, t, CAGE);
      addLine(-CAGE, -CAGE, t, -CAGE, CAGE, t);
      addLine(CAGE, t, -CAGE, CAGE, t, CAGE);
      addLine(CAGE, -CAGE, t, CAGE, CAGE, t);
      addLine(-CAGE, CAGE, t, CAGE, CAGE, t);
      addLine(t, CAGE, -CAGE, t, CAGE, CAGE);
      addLine(-CAGE, -CAGE, t, CAGE, -CAGE, t);
      addLine(t, -CAGE, -CAGE, t, -CAGE, CAGE);
    }

    const chartGroup = new THREE.Group();
    root.add(chartGroup);
    const CW = CAGE * 1.6,
      CH = CAGE * 1.5;
    const CX = 0,
      CY = 0;

    const setOp = (obj: THREE.Object3D, op: number) => {
      obj.visible = op > 0.001;
      obj.traverse((child) => {
        const m = (child as THREE.Mesh).material as THREE.Material;
        if (m && "opacity" in m) (m as any).opacity = op;
      });
    };

    // PIE
    const pieGroup = new THREE.Group();
    chartGroup.add(pieGroup);
    const PIE_R = CAGE * 1.0,
      PIE_THICK = 0.18;
    let cumAngle = 0;
    PIE_VALS.forEach((val, i) => {
      const startA = cumAngle - Math.PI / 2;
      const endA = cumAngle + val * Math.PI * 2 - Math.PI / 2;
      cumAngle += val * Math.PI * 2;
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      const segs = Math.max(16, Math.round(val * 64));
      for (let s = 0; s <= segs; s++) {
        const a = startA + (s / segs) * (endA - startA);
        shape.lineTo(Math.cos(a) * PIE_R, Math.sin(a) * PIE_R);
      }
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: PIE_THICK,
        bevelEnabled: false,
      });
      const mat = new THREE.MeshBasicMaterial({
        color: PIE_C[i],
        transparent: true,
        opacity: 0.88,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(CX, CY, -PIE_THICK / 2);
      const midA = (startA + endA) / 2;
      mesh.position.x += Math.cos(midA) * 0.08;
      mesh.position.y += Math.sin(midA) * 0.08;
      pieGroup.add(mesh);
      pieGroup.add(
        new THREE.LineSegments(
          new THREE.EdgesGeometry(geo),
          new THREE.LineBasicMaterial({
            color: new THREE.Color(0x1a1a16),
            transparent: true,
            opacity: 0.3,
          }),
        ),
      );
    });
    cumAngle = 0;
    PIE_VALS.forEach((val) => {
      const midA = cumAngle + val * Math.PI - Math.PI / 2;
      cumAngle += val * Math.PI * 2;
      pieGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(
              Math.cos(midA) * PIE_R * 0.85,
              Math.sin(midA) * PIE_R * 0.85,
              PIE_THICK,
            ),
            new THREE.Vector3(
              Math.cos(midA) * (PIE_R + 0.35),
              Math.sin(midA) * (PIE_R + 0.35),
              PIE_THICK,
            ),
          ]),
          new THREE.LineBasicMaterial({
            color: GREY_AXIS,
            transparent: true,
            opacity: 0.6,
          }),
        ),
      );
    });

    // ERROR LINE
    const errGroup = new THREE.Group();
    chartGroup.add(errGroup);
    errGroup.visible = false;
    const mapX = (x: number) => (x - 0.5) * CW;
    const mapY = (y: number) => (y - 0.5) * CH;
    const axisMat = new THREE.LineBasicMaterial({
      color: GREY_AXIS,
      transparent: true,
      opacity: 0.75,
    });
    errGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(mapX(0), mapY(0), 0),
          new THREE.Vector3(mapX(1.05), mapY(0), 0),
        ]),
        axisMat,
      ),
    );
    errGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(mapX(0), mapY(0), 0),
          new THREE.Vector3(mapX(0), mapY(1.1), 0),
        ]),
        axisMat,
      ),
    );
    const gridMat = new THREE.LineBasicMaterial({
      color: GREY_GRID,
      transparent: true,
      opacity: 0.4,
    });
    for (let g = 1; g <= 4; g++)
      errGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(mapX(0), mapY(g / 4), 0),
            new THREE.Vector3(mapX(1), mapY(g / 4), 0),
          ]),
          gridMat.clone(),
        ),
      );
    const bandShape = new THREE.Shape();
    bandShape.moveTo(mapX(LINE_X[0]), mapY(ERROR_HI[0]));
    LINE_X.forEach((x, i) => bandShape.lineTo(mapX(x), mapY(ERROR_HI[i])));
    [...LINE_X].reverse().forEach((x, i) => {
      const ri = LINE_X.length - 1 - i;
      bandShape.lineTo(mapX(x), mapY(ERROR_LO[ri]));
    });
    bandShape.closePath();
    errGroup.add(
      new THREE.Mesh(
        new THREE.ShapeGeometry(bandShape),
        new THREE.MeshBasicMaterial({
          color: ERR_BAND,
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide,
        }),
      ),
    );
    LINE_X.forEach((x, i) => {
      const errMat = new THREE.LineBasicMaterial({
        color: ERR_BARS,
        transparent: true,
        opacity: 0.75,
      });
      errGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(mapX(x), mapY(ERROR_LO[i]), 0),
            new THREE.Vector3(mapX(x), mapY(ERROR_HI[i]), 0),
          ]),
          errMat,
        ),
      );
      const capW = 0.06;
      [ERROR_HI[i], ERROR_LO[i]].forEach((y) =>
        errGroup.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(mapX(x) - capW, mapY(y), 0),
              new THREE.Vector3(mapX(x) + capW, mapY(y), 0),
            ]),
            errMat.clone(),
          ),
        ),
      );
    });
    const lineCurve = new THREE.CatmullRomCurve3(
      LINE_X.map((x, i) => new THREE.Vector3(mapX(x), mapY(LINE_Y[i]), 0)),
    );
    errGroup.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(lineCurve, 80, 0.055, 8, false),
        new THREE.MeshBasicMaterial({
          color: ERR_LINE,
          transparent: true,
          opacity: 0.95,
        }),
      ),
    );
    LINE_X.forEach((x, i) => {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 10, 10),
        new THREE.MeshBasicMaterial({
          color: ERR_DOTS,
          transparent: true,
          opacity: 0.92,
        }),
      );
      dot.position.set(mapX(x), mapY(LINE_Y[i]), 0.05);
      errGroup.add(dot);
    });

    // CONTOUR
    const contGroup = new THREE.Group();
    chartGroup.add(contGroup);
    contGroup.visible = false;
    const mapCX = (cx: number) => (cx / (CONT_W - 1) - 0.5) * CW;
    const mapCY = (cy: number) => (cy / (CONT_H - 1) - 0.5) * CH;
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
        const cell = new THREE.Mesh(
          new THREE.PlaneGeometry(cellW * 0.92, cellH * 0.92),
          new THREE.MeshBasicMaterial({
            color: col,
            transparent: true,
            opacity: 0.82,
            side: THREE.DoubleSide,
          }),
        );
        cell.position.set(mapCX(cx) + cellW / 2, mapCY(cy) + cellH / 2, 0);
        contGroup.add(cell);
      }
    }
    [0.25, 0.4, 0.55, 0.7, 0.85].forEach((level, li) => {
      const points: THREE.Vector3[] = [];
      for (let cy = 0; cy < CONT_H - 1; cy++) {
        for (let cx = 0; cx < CONT_W - 1; cx++) {
          const corners = [
            { x: cx, y: cy, z: contourZ(cx, cy) },
            { x: cx + 1, y: cy, z: contourZ(cx + 1, cy) },
            { x: cx + 1, y: cy + 1, z: contourZ(cx + 1, cy + 1) },
            { x: cx, y: cy + 1, z: contourZ(cx, cy + 1) },
          ];
          const crossings: THREE.Vector3[] = [];
          [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 0],
          ].forEach(([a, b]) => {
            const ca = corners[a],
              cb = corners[b];
            if ((ca.z - level) * (cb.z - level) < 0) {
              const t = (level - ca.z) / (cb.z - ca.z);
              crossings.push(
                new THREE.Vector3(
                  mapCX(ca.x + t * (cb.x - ca.x)),
                  mapCY(ca.y + t * (cb.y - ca.y)),
                  0.05,
                ),
              );
            }
          });
          if (crossings.length >= 2) points.push(crossings[0], crossings[1]);
        }
      }
      if (points.length > 0)
        contGroup.add(
          new THREE.LineSegments(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({
              color: ISO_COLORS[li],
              transparent: true,
              opacity: 0.9,
            }),
          ),
        );
    });

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
        rotX += velX;
        rotX = Math.max(-1.1, Math.min(1.1, rotX));
        if (Math.abs(velY) + Math.abs(velX) < 0.0005) autoSpin += 0.003;
      } else {
        autoSpin = 0;
      }
      root.rotation.y = rotY + autoSpin;
      root.rotation.x = rotX;
      const cur = CYCLE[modeIdx],
        nxt = CYCLE[(modeIdx + 1) % CYCLE.length];
      if (phase === "hold") {
        if (timer >= HOLD_FRAMES) {
          phase = "morph";
          timer = 0;
        }
      } else {
        const t = easeInOut(timer / MORPH_FRAMES),
          tIn = easeOut(t),
          tOut = easeOut(1 - t);
        if (cur === "pie") showPie(tOut);
        if (cur === "errorline") showErr(tOut);
        if (cur === "contour") showContour(tOut);
        if (nxt === "pie") showPie(tIn);
        if (nxt === "errorline") showErr(tIn);
        if (nxt === "contour") showContour(tIn);
        if (timer >= MORPH_FRAMES) {
          modeIdx = (modeIdx + 1) % CYCLE.length;
          phase = "hold";
          timer = 0;
          showPie(0);
          showErr(0);
          showContour(0);
          if (CYCLE[modeIdx] === "pie") showPie(1);
          if (CYCLE[modeIdx] === "errorline") showErr(1);
          if (CYCLE[modeIdx] === "contour") showContour(1);
        }
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    const onResize = () => {
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

const CLOSING_WORDS = "Start with your first spreadsheet.".split(" ");
/* the one word set in italic serif */
const CTA_ACCENT_WORD = "first";

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
        .cta-btn { background:var(--gx-accent-ink); color:var(--gx-accent); padding:13px 26px; font-size:14px; letter-spacing:0; font-weight:500; border:none; cursor:pointer; transition:opacity .15s; text-decoration:none; display:inline-flex; align-items:center; }
        .cta-btn:hover { opacity:0.85; }
        .cta-ghost { background:transparent; color:#1A1A16; padding:13px 26px; font-size:14px; letter-spacing:0; font-weight:400; border:1px solid rgba(26,26,22,0.22); cursor:pointer; transition:border-color .15s; text-decoration:none; display:inline-flex; align-items:center; }
        .cta-ghost:hover { border-color:rgba(26,26,22,0.55); }
        .cta-stat-val { font-family:var(--gx-display); font-size:2.6rem; font-weight:400; letter-spacing:-0.015em; line-height:1; }
        .cta-stat-label { font-family:var(--gx-mono); font-size:12px; letter-spacing:0; color:#6E6E64; margin-top:6px; }
        .cta-grid-bg { position:absolute; inset:0; pointer-events:none; background-image:linear-gradient(rgba(26,26,22,0.045) 1px,transparent 1px),linear-gradient(90deg,rgba(26,26,22,0.045) 1px,transparent 1px); background-size:40px 40px; }

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
        style={{
          background: "#F4F2EA",
          color: "#1A1A16",
          fontFamily: "var(--gx-sans)",
        }}
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
              <div
                data-anim="bar"
                style={{
                  height: 1,
                  width: 64,
                  background: "var(--gx-accent-ink)",
                  marginBottom: 30,
                }}
              />

              <h2
                style={{
                  fontFamily: "var(--gx-display)",
                  fontSize: "clamp(2.2rem,4.2vw,3.8rem)",
                  fontWeight: 400,
                  lineHeight: 1.06,
                  letterSpacing: "-0.015em",
                  marginBottom: 22,
                  color: "#1A1A16",
                }}
              >
                {CLOSING_WORDS.map((word, i) => (
                  <span
                    key={i}
                    data-anim={`word-${i}`}
                    style={{ display: "inline-block", marginRight: "0.28em" }}
                  >
                    {word === CTA_ACCENT_WORD ? (
                      <span style={{ fontStyle: "italic" }}>{word}</span>
                    ) : (
                      word
                    )}
                  </span>
                ))}
              </h2>

              <p
                data-anim="sub"
                style={{
                  color: "#5C5C52",
                  lineHeight: 1.6,
                  marginBottom: 36,
                  maxWidth: 400,
                  fontSize: 16,
                }}
              >
                Free while Graphix is in beta. No card, no seat minimum.
              </p>

              <div data-anim="stats" className="cta-stats-row">
                {[
                  {
                    val: 140,
                    suffix: "+",
                    label: "chart types",
                    color: "#1A1A16",
                  },
                  {
                    val: 16,
                    suffix: "",
                    label: "chart categories",
                    color: "#1A1A16",
                  },
                  {
                    val: null,
                    suffix: "",
                    label: "cost during beta",
                    color: "#1A1A16",
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
                <Link className="cta-btn" href="/dashboard">
                  Start for free
                </Link>
                <Link className="cta-ghost" href="/about">
                  About us
                </Link>
              </div>

              <p
                data-anim="legal"
                style={{
                  marginTop: 22,
                  fontFamily: "var(--gx-mono)",
                  fontSize: 12,
                  color: "#8A8A7C",
                  letterSpacing: 0,
                }}
              >
                No credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
