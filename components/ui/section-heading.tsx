import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  /** Two-digit index shown in the mono eyebrow, e.g. "01" */
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** id for the <h2>, so the parent <section> can use aria-labelledby */
  id?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  id,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      <p className="font-mono text-eyebrow uppercase text-brand">
        {index && <span className="text-muted-foreground">[{index}] </span>}
        {eyebrow}
      </p>
      <h2 id={id} className="text-display-xl font-semibold">
        {title}
      </h2>
      {description && <p className="text-lead text-muted-foreground">{description}</p>}
    </div>
  );
}
