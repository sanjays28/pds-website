"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { tokens } from "@/lib/tokens";

/**
 * CursorTrail — WMS motion **M14** ("Cursor comet: visitor = rider").
 * Ported from proven-coming-soon.html's `#trail` canvas: a fading green
 * streak follows the mouse across the whole page — desktop, fine-pointer
 * only, matching the registry's own fallback ("fine-pointer only; RM:
 * off"), so it's skipped entirely (not just dimmed) under reduced motion
 * and on touch devices.
 *
 * One addition over the reference implementation: the RAF loop here also
 * pauses on `document.hidden` (the source's version ran unconditionally
 * forever) — cheap to add and consistent with every other animated piece
 * in this build.
 */
export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isFinePointer) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const [r, g, b] = hexToRgb(tokens.color.green);
    let width = 0;
    let height = 0;
    let points: Array<{ x: number; y: number; life: number }> = [];
    let raf = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      const dpr = window.devicePixelRatio || 1;
      points.push({ x: e.clientX * dpr, y: e.clientY * dpr, life: 1 });
      if (points.length > 26) points.shift();
    };
    window.addEventListener("mousemove", onMouseMove);

    const onVisibilityChange = () => {
      if (document.hidden && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!document.hidden && !raf) {
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    function loop() {
      ctx!.clearRect(0, 0, width, height);
      const dpr = window.devicePixelRatio || 1;
      for (let i = 1; i < points.length; i++) {
        const p = points[i];
        const q = points[i - 1];
        p.life -= 0.045;
        if (p.life <= 0) continue;
        ctx!.strokeStyle = `rgba(${r},${g},${b},${p.life * 0.5})`;
        ctx!.lineWidth = 2 * dpr * p.life;
        ctx!.lineCap = "round";
        ctx!.beginPath();
        ctx!.moveTo(q.x, q.y);
        ctx!.lineTo(p.x, p.y);
        ctx!.stroke();
      }
      points = points.filter((p) => p.life > 0);
      raf = document.hidden ? 0 : requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="cursor-trail" aria-hidden="true" />;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return [108, 192, 74]; // brand green fallback
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}
