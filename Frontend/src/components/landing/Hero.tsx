"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Navbar from "../NavBar";
import Link from "next/link";

type ChartMode = "bar" | "line" | "scatter";
interface BarPair {
  a: THREE.Mesh;
  b: THREE.Mesh;
}

const DATA_A = [
  0.55, 0.62, 0.48, 0.71, 0.58, 0.82, 0.67, 0.74, 0.6, 0.88, 0.72, 0.65, 0.78,
  0.53, 0.69, 0.91,
];
const DATA_B = [
  0.3, 0.44, 0.38, 0.52, 0.41, 0.6, 0.5, 0.55, 0.45, 0.68, 0.57, 0.48, 0.63,
  0.35, 0.51, 0.72,
];
const N = DATA_A.length;
const HOLD = 300;
const MORPH = 150;
const CYCLE: ChartMode[] = ["bar", "line", "scatter"];
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

const C = {
  barA: new THREE.Color(0x44ee99),
  barB: new THREE.Color(0x55ddee),
  lineA: new THREE.Color(0xee33bb),
  lineB: new THREE.Color(0xffaa33),
  scatterA: new THREE.Color(0x44ee99),
  scatterB: new THREE.Color(0xff5577),
  axis: new THREE.Color(0x888899),
  grid: new THREE.Color(0x444455),
  cage: new THREE.Color(0xbbbbcc),
};

// ─── ThreeCube ───────────────────────────────────────────────────────────────

function ThreeCube() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect((): (() => void) => {
    const el = mountRef.current;
    if (!el) return () => {};

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
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
      rotY = 0,
      rotX = 0,
      velY = 0,
      velX = 0,
      autoSpin = 0;
    const DAMPING = 0.88;

    const onMD = (e: MouseEvent) => {
      isOrbit = true;
      ox = e.clientX;
      oy = e.clientY;
      velY = 0;
      velX = 0;
      renderer.domElement.style.cursor = "grabbing";
    };
    const onMM = (e: MouseEvent) => {
      if (!isOrbit) return;
      const dy = (e.clientX - ox) * 0.007,
        dx = (e.clientY - oy) * 0.007;
      velY = dy;
      velX = dx;
      rotY += dy;
      rotX += dx;
      rotX = Math.max(-1.1, Math.min(1.1, rotX));
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

    // ── Cage ─────────────────────────────────────────────────────────────────
    const CAGE = 3.2,
      DIVS = 10;
    const cageGroup = new THREE.Group();
    root.add(cageGroup);
    const cageMat = new THREE.LineBasicMaterial({
      color: C.cage,
      transparent: true,
      opacity: 0.28,
    });
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

    // ── Chart group ───────────────────────────────────────────────────────────
    const chartGroup = new THREE.Group();
    root.add(chartGroup);
    const CW = CAGE * 1.5,
      CH = CAGE * 1.4,
      CD = CAGE * 0.35;
    const X0 = -CW / 2,
      Y0 = -CAGE * 0.85,
      Z0 = 0.0;
    const step = CW / (N - 1);
    const px = (i: number) => X0 + i * step;
    const py = (v: number) => Y0 + v * CH;

    const axisMat = new THREE.LineBasicMaterial({
      color: C.axis,
      transparent: true,
      opacity: 0.8,
    });
    chartGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(X0 - 0.1, Y0, Z0),
          new THREE.Vector3(X0 + CW + 0.1, Y0, Z0),
        ]),
        axisMat,
      ),
    );
    chartGroup.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(X0, Y0 - 0.1, Z0),
          new THREE.Vector3(X0, Y0 + CH + 0.15, Z0),
        ]),
        axisMat,
      ),
    );

    const gridMat = new THREE.LineBasicMaterial({
      color: C.grid,
      transparent: true,
      opacity: 0.5,
    });
    for (let g = 1; g <= 5; g++) {
      const gy = Y0 + (g / 5) * CH;
      chartGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(X0, gy, Z0),
            new THREE.Vector3(X0 + CW, gy, Z0),
          ]),
          gridMat.clone(),
        ),
      );
      chartGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(X0 - 0.12, gy, Z0),
            new THREE.Vector3(X0, gy, Z0),
          ]),
          axisMat,
        ),
      );
    }
    for (let i = 0; i < N; i += 2)
      chartGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(px(i), Y0, Z0),
            new THREE.Vector3(px(i), Y0 - 0.12, Z0),
          ]),
          axisMat,
        ),
      );

    // ── Bars ──────────────────────────────────────────────────────────────────
    const barW = step * 0.28;
    const mkEdge = (geo: THREE.BoxGeometry, col: THREE.Color) =>
      new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.5,
        }),
      );

    const bars: BarPair[] = DATA_A.map(() => {
      const gA = new THREE.BoxGeometry(barW, 1, CD);
      const mA = new THREE.Mesh(
        gA,
        new THREE.MeshBasicMaterial({
          color: C.barA,
          transparent: true,
          opacity: 0.92,
        }),
      );
      mA.add(mkEdge(gA, C.barA));
      chartGroup.add(mA);
      const gB = new THREE.BoxGeometry(barW, 1, CD * 0.6);
      const mB = new THREE.Mesh(
        gB,
        new THREE.MeshBasicMaterial({
          color: C.barB,
          transparent: true,
          opacity: 0.88,
        }),
      );
      mB.add(mkEdge(gB, C.barB));
      chartGroup.add(mB);
      return { a: mA, b: mB };
    });

    // ── Line chart ────────────────────────────────────────────────────────────
    let tubeMeshA: THREE.Mesh | null = null,
      tubeMeshB: THREE.Mesh | null = null;
    let areaA: THREE.Mesh | null = null,
      areaB: THREE.Mesh | null = null;
    const dotGeo = new THREE.SphereGeometry(0.085, 10, 10);

    const lineDotA: THREE.Mesh[] = DATA_A.map(() => {
      const m = new THREE.Mesh(
        dotGeo,
        new THREE.MeshBasicMaterial({
          color: C.lineA,
          transparent: true,
          opacity: 0,
        }),
      );
      m.visible = false;
      chartGroup.add(m);
      return m;
    });
    const lineDotB: THREE.Mesh[] = DATA_B.map(() => {
      const m = new THREE.Mesh(
        dotGeo,
        new THREE.MeshBasicMaterial({
          color: C.lineB,
          transparent: true,
          opacity: 0,
        }),
      );
      m.visible = false;
      chartGroup.add(m);
      return m;
    });

    const buildTube = (data: number[], color: THREE.Color): THREE.Mesh => {
      const curve = new THREE.CatmullRomCurve3(
        data.map((v, i) => new THREE.Vector3(px(i), py(v), Z0)),
      );
      const m = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 80, 0.065, 8, false),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 }),
      );
      m.visible = false;
      return m;
    };
    const buildArea = (data: number[], color: THREE.Color): THREE.Mesh => {
      const shape = new THREE.Shape();
      shape.moveTo(px(0), Y0);
      data.forEach((v, i) => shape.lineTo(px(i), py(v)));
      shape.lineTo(px(N - 1), Y0);
      shape.closePath();
      const m = new THREE.Mesh(
        new THREE.ShapeGeometry(shape),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
        }),
      );
      m.visible = false;
      return m;
    };
    const rebuildLines = () => {
      [tubeMeshA, tubeMeshB, areaA, areaB].forEach((m) => {
        if (m) {
          chartGroup.remove(m);
          m.geometry.dispose();
        }
      });
      tubeMeshA = buildTube(DATA_A, C.lineA);
      chartGroup.add(tubeMeshA);
      tubeMeshB = buildTube(DATA_B, C.lineB);
      chartGroup.add(tubeMeshB);
      areaA = buildArea(DATA_A, C.lineA);
      areaA.position.z = Z0 - 0.02;
      chartGroup.add(areaA);
      areaB = buildArea(DATA_B, C.lineB);
      areaB.position.z = Z0 + 0.02;
      chartGroup.add(areaB);
    };
    rebuildLines();
    DATA_A.forEach((v, i) => {
      lineDotA[i].position.set(px(i), py(v), Z0 + 0.08);
      lineDotB[i].position.set(px(i), py(DATA_B[i]), Z0 - 0.08);
    });

    // ── Scatter ───────────────────────────────────────────────────────────────
    const scatA: THREE.Mesh[] = DATA_A.map((v, i) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.08 + v * 0.08, 12, 12),
        new THREE.MeshBasicMaterial({
          color: C.scatterA,
          transparent: true,
          opacity: 0,
        }),
      );
      m.visible = false;
      m.position.set(px(i), py(v), Z0 + 0.05);
      chartGroup.add(m);
      return m;
    });
    const scatB: THREE.Mesh[] = DATA_B.map((v, i) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.07 + v * 0.07, 12, 12),
        new THREE.MeshBasicMaterial({
          color: C.scatterB,
          transparent: true,
          opacity: 0,
        }),
      );
      m.visible = false;
      m.position.set(px(i), py(v), Z0 - 0.05);
      chartGroup.add(m);
      return m;
    });
    const halos: THREE.Mesh[] = DATA_A.map((v, i) => {
      const m = new THREE.Mesh(
        new THREE.RingGeometry(0.12 + v * 0.08, 0.16 + v * 0.08, 16),
        new THREE.MeshBasicMaterial({
          color: C.scatterA,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
        }),
      );
      m.visible = false;
      m.position.set(px(i), py(v), Z0 + 0.05);
      chartGroup.add(m);
      return m;
    });
    const dropLines: THREE.Line[] = DATA_A.map((v, i) => {
      const l = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(px(i), Y0, Z0 + 0.05),
          new THREE.Vector3(px(i), py(v), Z0 + 0.05),
        ]),
        new THREE.LineBasicMaterial({
          color: C.scatterA,
          transparent: true,
          opacity: 0,
        }),
      );
      l.visible = false;
      chartGroup.add(l);
      return l;
    });

    // ── Legend ────────────────────────────────────────────────────────────────
    const mkLegend = (color: THREE.Color, y: number) => {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.22, 0.06),
        new THREE.MeshBasicMaterial({ color }),
      );
      m.position.set(X0 + CW + 0.5, y, Z0);
      chartGroup.add(m);
    };
    mkLegend(C.barA, Y0 + CH * 0.62);
    mkLegend(C.barB, Y0 + CH * 0.52);

    // ── Visibility helpers ────────────────────────────────────────────────────
    const setMeshVis = (meshes: THREE.Object3D[], o: number, baseO: number) => {
      const show = o > 0.001;
      meshes.forEach((m) => {
        m.visible = show;
        const mat = (m as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = o * baseO;
      });
    };
    const setBar = (o: number) => {
      const show = o > 0.001;
      bars.forEach((p) => {
        p.a.visible = show;
        p.b.visible = show;
        (p.a.material as THREE.MeshBasicMaterial).opacity = o * 0.92;
        (p.b.material as THREE.MeshBasicMaterial).opacity = o * 0.88;
        p.a.children.forEach((c) => {
          c.visible = show;
        });
        p.b.children.forEach((c) => {
          c.visible = show;
        });
      });
    };
    const setLine = (o: number) => {
      const show = o > 0.001;
      [tubeMeshA, tubeMeshB, areaA, areaB].forEach((m) => {
        if (!m) return;
        m.visible = show;
        (m.material as THREE.MeshBasicMaterial).opacity =
          m === tubeMeshA
            ? o * 0.95
            : m === tubeMeshB
              ? o * 0.85
              : m === areaA
                ? o * 0.12
                : o * 0.1;
      });
      setMeshVis(lineDotA, o, 0.9);
      setMeshVis(lineDotB, o, 0.8);
    };
    const setScatter = (o: number) => {
      setMeshVis(scatA, o, 0.95);
      setMeshVis(scatB, o, 0.85);
      setMeshVis(halos, o, 0.35);
      const show = o > 0.001;
      dropLines.forEach((l) => {
        l.visible = show;
        (l.material as THREE.LineBasicMaterial).opacity = o * 0.4;
      });
    };
    const updateBars = (frac: number) => {
      DATA_A.forEach((vA, i) => {
        const hA = vA * CH * frac;
        bars[i].a.scale.y = Math.max(0.001, hA);
        bars[i].a.position.set(
          px(i) - barW * 0.3,
          Y0 + hA / 2,
          Z0 + (CD / 2) * 0.6,
        );
        const hB = DATA_B[i] * CH * frac;
        bars[i].b.scale.y = Math.max(0.001, hB);
        bars[i].b.position.set(
          px(i) + barW * 0.3,
          Y0 + hB / 2,
          Z0 - CD * 0.3 * 0.6,
        );
      });
    };

    // ── Entry + state ─────────────────────────────────────────────────────────
    root.scale.setScalar(0.01);
    const ENTRY_FRAMES = 90;
    let entryFrame = 0;
    setBar(1);
    setLine(0);
    setScatter(0);
    updateBars(1);

    let haloPhase = 0,
      timer = 0,
      modeIdx = 0;
    let phase: "hold" | "morph" = "hold";
    let rafId: number;
    const AUTO_SPEED = 0.003;

    const animate = () => {
      haloPhase += 0.03;
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
        if (Math.abs(velY) + Math.abs(velX) < 0.0005) autoSpin += AUTO_SPEED;
      } else {
        autoSpin = 0;
      }

      root.rotation.y = rotY + autoSpin;
      root.rotation.x = rotX;
      halos.forEach((h, i) =>
        h.scale.setScalar(1 + Math.sin(haloPhase + i * 0.6) * 0.18),
      );

      const cur = CYCLE[modeIdx],
        nxt = CYCLE[(modeIdx + 1) % CYCLE.length];
      if (phase === "hold") {
        if (cur === "bar") updateBars(1);
        if (timer >= HOLD) {
          phase = "morph";
          timer = 0;
        }
      } else {
        const t = easeInOut(timer / MORPH);
        if (cur === "bar" && nxt === "line") {
          updateBars(1 - t);
          setBar(1 - t);
          setLine(t);
          setScatter(0);
        } else if (cur === "line" && nxt === "scatter") {
          setBar(0);
          setLine(1 - t);
          setScatter(t);
        } else if (cur === "scatter" && nxt === "bar") {
          updateBars(t);
          setBar(t);
          setLine(0);
          setScatter(1 - t);
        }
        if (timer >= MORPH) {
          modeIdx = (modeIdx + 1) % CYCLE.length;
          phase = "hold";
          timer = 0;
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

// ─── Hero ────────────────────────────────────────────────────────────────────

const WORDS = "Where natural language meets stunning visualization.".split(" ");

export default function Hero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setReady(true)),
    );
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={`gx-hero${ready ? " gx-ready" : ""}`}>
      <Navbar />

      <div className="flex flex-col md:flex-row py-12 md:pt-16 justify-between px-4 md:px-8 gap-6">
        {/* LEFT — text */}
        <div className="w-full md:w-1/2 shrink-0 relative">
          <div className="gx-grid-bg" />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              data-anim="accent-bar"
              className="h-px mt-14"
              style={{ width: "220px" }}
            />
            <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight md:leading-[1.05] tracking-tighter mb-5">
              {WORDS.map((word, i) => (
                <span
                  key={i}
                  data-anim={`word-${i}`}
                  style={{ display: "inline-block", marginRight: "0.28em" }}
                >
                  {word}
                </span>
              ))}
            </h1>
            <p
              data-anim="subtext"
              className="text-[#666] leading-relaxed mb-8 max-w-[420px]"
            >
              Describe the insight you need. Upload your CSV if you want. Graph
              AI handles the rest — intelligent chart selection, smart styling,
              instant beauty.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-cyan-600 hover:invert text-white px-7 py-3 text-sm tracking-[0.15em] transition-colors duration-150 no-underline leading-none"
            >
              TRY NOW
            </Link>
          </div>
        </div>

        {/* RIGHT — 3D cube */}
        <div
          data-anim="cube"
          className="shrink-0 relative w-full md:w-auto"
          style={{
            flex: "0 0 52%",
            height: "min(560px, 65vh)",
            overflow: "visible",
          }}
        >
          <ThreeCube />
        </div>
      </div>
    </div>
  );
}
