"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
};

/**
 * Fades + lifts content in once it scrolls into view.
 * Don't wrap above-the-fold content (it would delay LCP).
 * Reduced-motion users get an instant fade via <MotionConfig reducedMotion="user">.
 */
export function Reveal({ delay = 0, children, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
