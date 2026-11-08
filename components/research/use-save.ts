"use client";

import { useState, useTransition } from "react";

import type { Result } from "@/app/research/actions";

/** Runs a server action and keeps its latest result for inline feedback. */
export function useSave() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<Result | null>(null);
  const run = (fn: () => Promise<Result>, after?: (r: Result) => void) =>
    start(async () => {
      const r = await fn();
      setResult(r);
      after?.(r);
    });
  return { pending, result, run, clear: () => setResult(null) };
}
