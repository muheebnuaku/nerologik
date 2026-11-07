import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

/** Top-of-page header for inner pages. Extends its background under the floating nav. */
export function PageHeader({ eyebrow, title, description, children, className }: PageHeaderProps) {
  return (
    <section
      className={cn(
        "relative isolate -mt-(--spacing-nav) overflow-hidden border-b border-border pt-(--spacing-nav)",
        className,
      )}
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="bg-grid mask-hero absolute inset-0" />
        <div className="absolute -top-48 right-[-10%] size-112 rounded-full bg-brand-glow opacity-50 blur-glow" />
      </div>
      <div className="container-page flex flex-col items-start gap-4 pt-8 pb-8 sm:pt-12 sm:pb-12">
        <p className="font-mono text-eyebrow uppercase text-brand">{eyebrow}</p>
        <h1 className="max-w-4xl text-display-xl font-semibold">{title}</h1>
        {description && <p className="max-w-2xl text-lead text-muted-foreground">{description}</p>}
        {children}
      </div>
    </section>
  );
}
