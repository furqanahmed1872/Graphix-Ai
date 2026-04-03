"use client";

import { useEffect, useRef } from "react";

export default function GraphPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const series = [
      {
        baseRatio: 0.4,
        trendRatio: 0.1,
        offset: (i: number) =>
          Math.sin(i * 0.06 + t * 0.008) * 18 +
          Math.sin(i * 0.1 + t * 0.009) * 10,
        stroke: "rgba(255,255,255,0.90)",
        lw: 2.2,
        fillTop: "rgba(255,255,255,0.06)",
        fillBot: "rgba(255,255,255,0.00)",
        glow: true,
        dashed: false,
      },
      {
        baseRatio: 0.58,
        trendRatio: 0.1,
        offset: (i: number) =>
          Math.sin(i * 0.1 + t * 0.009) * 8 +
          Math.sin(i * 0.18 + t * 0.01) * 12,
        stroke: "rgba(255,255,255,0.30)",
        lw: 1,
        fillTop: "rgba(255,255,255,0.025)",
        fillBot: "rgba(255,255,255,0.00)",
        glow: false,
        dashed: false,
      },
      {
        baseRatio: 0.74,
        trendRatio: 0.1,
        offset: (i: number) =>
          Math.sin(i * 0.04 + t * 0.01) * 10 +
          Math.sin(i * 0.15 + t * 0.015) * 16,
        stroke: "rgba(255,255,255,0.12)",
        lw: 1.0,
        fillTop: null,
        fillBot: null,
        glow: false,
        dashed: true,
      },
    ];

    const buildPoints = (
      w: number,
      h: number,
      baseRatio: number,
      trendRatio: number,
      offset: (i: number) => number,
      count = 80,
    ) =>
      Array.from({ length: count }, (_, i) => ({
        x: (i / (count - 1)) * w,
        y: h * baseRatio - (i / (count - 1)) * h * trendRatio + offset(i),
      }));

    const drawGrid = (w: number, h: number) => {
      ctx.save();
      // Horizontal lines only — clean
      for (let i = 1; i <= 5; i++) {
        const y = (h / 6) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // Vertical lines
      for (let i = 1; i <= 8; i++) {
        const x = (w / 9) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawLine = (
      pts: { x: number; y: number }[],
      stroke: string,
      lw: number,
      fillTop: string | null,
      fillBot: string | null,
      glow: boolean,
      dashed: boolean,
      h: number,
    ) => {
      if (pts.length < 2) return;

      // Area fill
      if (fillTop && fillBot) {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, fillTop);
        grad.addColorStop(1, fillBot);
        ctx.beginPath();
        ctx.moveTo(pts[0].x, h);
        ctx.lineTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const cpx = (pts[i - 1].x + pts[i].x) / 2;
          ctx.bezierCurveTo(
            cpx,
            pts[i - 1].y,
            cpx,
            pts[i].y,
            pts[i].x,
            pts[i].y,
          );
        }
        ctx.lineTo(pts[pts.length - 1].x, h);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Soft glow pass
      if (glow) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const cpx = (pts[i - 1].x + pts[i].x) / 2;
          ctx.bezierCurveTo(
            cpx,
            pts[i - 1].y,
            cpx,
            pts[i].y,
            pts[i].x,
            pts[i].y,
          );
        }
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.lineWidth = lw + 12;
        ctx.filter = "blur(8px)";
        ctx.stroke();
        ctx.filter = "none";
        ctx.restore();
      }

      // Main line
      ctx.save();
      if (dashed) ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const cpx = (pts[i - 1].x + pts[i].x) / 2;
        ctx.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
      }
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    };

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      t++;

      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = "#090b0e";
      ctx.fillRect(0, 0, w, h);

      // Vignette
      const vig = ctx.createRadialGradient(
        w / 2,
        h / 2,
        h * 0.1,
        w / 2,
        h / 2,
        h * 0.85,
      );
      vig.addColorStop(0, "transparent");
      vig.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      drawGrid(w, h);

      series.forEach((s) => {
        const pts = buildPoints(w, h, s.baseRatio, s.trendRatio, s.offset);
        drawLine(
          pts,
          s.stroke,
          s.lw,
          s.fillTop,
          s.fillBot,
          s.glow,
          s.dashed,
          h,
        );
      });

      animFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 bg-[#090b0e]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
