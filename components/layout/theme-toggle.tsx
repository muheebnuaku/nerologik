"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle light and dark theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Icons swap via the .dark class, so there is no hydration flash */}
      <Sun className="hidden size-[1.125rem] dark:block" />
      <Moon className="size-[1.125rem] dark:hidden" />
    </Button>
  );
}
