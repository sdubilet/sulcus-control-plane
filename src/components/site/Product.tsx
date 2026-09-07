import { Section, Headline, Lede, Reveal } from "./primitives";
import { MetaballMark } from "./Motifs";

const caps = [
  { n: "01", t: "Observe", b: "Understand every agent, action, tool call, state transition, and event." },
  { n: "02", t: "Govern", b: "Define policies and boundaries around autonomous execution." },
  { n: "03", t: "Coordinate", b: "Manage interactions between agents and concurrent workflows." },
  { n: "04", t: "Intervene", b: "Pause, inspect, redirect, or terminate execution." },
  { n: "05", t: "Replay", b: "Reconstruct execution histories to understand failures and decisions." },
  { n: "06", t: "Scale", b: "Operate increasingly complex autonomous systems without losing system-level control." },
];

export function Product() {
  return (
    <Section id="product" index="05" label="Product">
      <Reveal>
        <Headline>Infrastructure for autonomous execution.</Headline>
      </Reveal>
      <Reveal delay={80}>
        <Lede className="mt-6">A progression of capabilities, from visibility to system-level control.</Lede>
      </Reveal>

      <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {caps.map((c, i) => (
          <Reveal key={c.n} delay={i * 60} className="bg-background">
            <article className="group relative h-full overflow-hidden bg-surface/50 p-7 transition-colors hover:bg-surface-2/70">
              <div className="dot-matrix pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-40" />
              <div className="relative z-10 flex items-start justify-between">
                <span className="label-mono text-primary">{c.n}</span>
                <MetaballMark
                  variant={i}
                  className="h-10 w-10 text-foreground/40 transition-all duration-500 group-hover:scale-110 group-hover:text-primary/80"
                />
              </div>
              <h3 className="relative z-10 mt-5 text-xl font-semibold">{c.t}</h3>
              <p className="relative z-10 mt-3 text-sm leading-relaxed text-muted-foreground">{c.b}</p>
              <div className="mt-6 h-px w-8 bg-border-strong transition-all duration-500 group-hover:w-full group-hover:bg-primary/60" />
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
