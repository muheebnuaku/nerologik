"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const CONFIG = {
  /** nodes per px² of canvas */
  density: 1 / 11000,
  maxNodes: 90,
  linkDistance: 150,
  speed: 0.22,
  nodeRadius: 1.5,
  lineAlpha: 0.32,
  nodeAlpha: 0.75,
  maxDpr: 2,
} as const;

type Node = { x: number; y: number; vx: number; vy: number };

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const n = parseInt(clean.length === 3 ? clean.replace(/./g, "$&$&") : clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Lightweight canvas "neural network" background.
 * - Colour follows the --brand token (re-reads on theme change)
 * - Pauses when offscreen or the tab is hidden
 * - Renders a single static frame for prefers-reduced-motion
 */
export function NodeNetwork({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let rgb: [number, number, number] = [20, 241, 198];
    let frame = 0;
    let running = false;
    let onScreen = false;

    const readColor = () => {
      const value = getComputedStyle(document.documentElement).getPropertyValue("--brand").trim();
      if (value.startsWith("#")) rgb = hexToRgb(value);
    };

    const draw = () => {
      const [r, g, b] = rgb;
      const maxD2 = CONFIG.linkDistance ** 2;
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const bNode = nodes[j];
          const dx = a.x - bNode.x;
          const dy = a.y - bNode.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxD2) {
            const alpha = (1 - Math.sqrt(d2) / CONFIG.linkDistance) * CONFIG.lineAlpha;
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(bNode.x, bNode.y);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = `rgba(${r},${g},${b},${CONFIG.nodeAlpha})`;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, CONFIG.nodeRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }
      draw();
      frame = requestAnimationFrame(step);
    };

    const start = () => {
      if (running || reduceMotion || !onScreen || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(step);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(CONFIG.maxNodes, Math.round(width * height * CONFIG.density));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * CONFIG.speed * 2,
        vy: (Math.random() - 0.5) * CONFIG.speed * 2,
      }));
      draw();
    };

    readColor();
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    intersectionObserver.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      readColor();
      draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn("size-full", className)} />;
}
