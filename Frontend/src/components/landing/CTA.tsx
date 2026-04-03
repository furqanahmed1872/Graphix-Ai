"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ─── Colors ───────────────────────────────────────────────────────────────────
const GREY_AXIS = new THREE.Color(0x888899);
const GREY_GRID = new THREE.Color(0x444455);
const GREY_CAGE = new THREE.Color(0xaaaabb);

const PIE_C = [
  new THREE.Color(0x4e79a7),
  new THREE.Color(0xf28e2b),
  new THREE.Color(0xe15759),
  new THREE.Color(0x76b7b2),
  new THREE.Color(0x59a14f),
];
const ERR_LINE = new THREE.Color(0x4e79a7);
const ERR_BAND = new THREE.Color(0x4e79a7);
const ERR_BARS = new THREE.Color(0xf28e2b);
const ERR_DOTS = new THREE.Color(0xe15759);
const CONT_STOPS: [number, THREE.Color][] = [
  [0.0, new THREE.Color(0x440154)],
  [0.25, new THREE.Color(0x3b528b)],
  [0.5, new THREE.Color(0x21918c)],
  [0.75, new THREE.Color(0x5ec962)],
  [1.0, new THREE.Color(0xfde725)],
];
const ISO_COLORS = [
  new THREE.Color(0x3b528b),
  new THREE.Color(0x21918c),
  new THREE.Color(0x5ec962),
  new THREE.Color(0xfde725),
  new THREE.Color(0xff7f0e),
];

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
            color: new THREE.Color(0x111111),
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

// ─── Count-up stat ────────────────────────────────────────────────────────────
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
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

// ─── Closing headline words ───────────────────────────────────────────────────
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
      `}</style>

      <div
        className={`cta-root${ready ? " cta-ready" : ""}`}
        style={{ background: "white", color: "black", fontFamily: "monospace" }}
      >
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {/* LEFT: 3D cube */}
          <div
            data-anim="cube"
            style={{
              flex: "0 0 52%",
              height: "min(560px, 65vh)",
              overflow: "visible",
              minWidth: 280,
            }}
          >
            <ThreeCubeFooter />
          </div>

          {/* RIGHT: CTA copy */}
          <div
            style={{
              flex: 1,
              minWidth: 280,
              position: "relative",
              padding: "48px 44px 48px 32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div className="cta-grid-bg" />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                data-anim="bar"
                style={{
                  background: "white",
                }}
              />

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

              <div
                data-anim="stats"
                style={{
                  display: "flex",
                  gap: 28,
                  marginBottom: 36,
                  flexWrap: "wrap",
                }}
              >
                {[
                  { val: 70, suffix: "+", label: "CHART TYPES", color: "black" },
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
                  className="bg-cyan-600 text-2 text-white rounded-lg font-bold px-3 py-2 hover:bg-cyan-700 hover:cursor-pointer"
                  href="/dashboard"
                >
                  Try Now
                </Link>
                <Link
                  className="text-2 font-bold px-3 py-2 border border-white hover:bg-white hover:cursor-pointer hover:text-gray-900 transition-colors"
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
