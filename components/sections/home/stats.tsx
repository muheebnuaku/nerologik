import { Counter } from "@/components/motion/counter";
import { stats } from "@/lib/content/home";

export function Stats() {
  return (
    <section aria-labelledby="stats-heading" className="border-y border-border">
      <h2 id="stats-heading" className="sr-only">
        Results
      </h2>
      <div className="container-page">
        {/* 1px gaps over a border-coloured background draw the dividers at every breakpoint */}
        <dl className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-2 bg-background px-4 py-6 sm:px-8 sm:py-8"
            >
              <dt className="order-2 text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="order-1 font-display text-display-xl font-semibold">
                <Counter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
