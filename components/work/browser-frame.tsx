import { cn } from "@/lib/utils";

/** Minimal browser chrome around a screenshot or mockup. */
export function BrowserFrame({
  url,
  children,
  className,
}: {
  url: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/20",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border px-3 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        <span className="flex-1 truncate rounded-md bg-muted px-3 py-1 text-center font-mono text-[0.6875rem] text-muted-foreground">
          {url}
        </span>
      </div>
      {children}
    </div>
  );
}

/** Phone bezel; children should fill the screen. */
export function PhoneFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[1.6rem] bg-device p-1.5 shadow-2xl shadow-black/40 ring-1 ring-white/10",
        className,
      )}
    >
      <div className="relative aspect-[390/800] overflow-hidden rounded-[1.2rem]">{children}</div>
    </div>
  );
}

export function displayHost(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}
