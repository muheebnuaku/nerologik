"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      {/* reducedMotion="user" makes every Framer Motion animation respect prefers-reduced-motion */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}
