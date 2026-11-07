import { cn } from "@/lib/utils";

/**
 * Nerologik mark: four nodes joined into an "N" — neural network meets logic path.
 * Strokes use currentColor, nodes use the brand token, so it adapts to both themes.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-7", className)}
    >
      <path
        d="M8 24V8l16 16V8"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="3" className="fill-brand" />
      <circle cx="8" cy="24" r="3" className="fill-brand" />
      <circle cx="24" cy="8" r="3" className="fill-brand" />
      <circle cx="24" cy="24" r="3" className="fill-brand" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-lg font-semibold tracking-tight">
        Nero<span className="text-brand">logik</span>
      </span>
    </span>
  );
}
