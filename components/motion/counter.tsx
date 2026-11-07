"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

type CounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

/**
 * Counts up when scrolled into view. The server renders the final value
 * (good for SEO and no-JS); it resets to zero on mount, offscreen, then animates.
 */
export function Counter({ value, prefix = "", suffix = "", decimals = 0 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-48px" });
  const reduceMotion = useReducedMotion();

  const format = (n: number) =>
    `${prefix}${n.toLocaleString("en", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;

  // Only count up if the number starts below the fold; if it's already visible
  // on load, keep the final value (never flash or get stuck on zero).
  const shouldAnimate = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (reduceMotion || !el) return;
    if (el.getBoundingClientRect().top > window.innerHeight) {
      shouldAnimate.current = true;
      el.textContent = format(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!inView || !el) return;
    if (reduceMotion || !shouldAnimate.current) {
      el.textContent = format(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = format(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduceMotion, value]);

  return (
    <>
      <span className="sr-only">{format(value)}</span>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {format(value)}
      </span>
    </>
  );
}
