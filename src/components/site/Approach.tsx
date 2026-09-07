import { Section, Headline, Lede, Reveal } from "./primitives";

const layers = [
  { t: "Execution", b: "Agent runtimes, frameworks, and tool calls." },
  { t: "Supervision", b: "Policy enforcement, observation, and intervention." },
  { t: "Control", b: "Governance, coordination, and system-level decision authority." },
];

export function Approach() {
  return (
    <Section id="approach" index="03" label="Our approach">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Reveal>
            <Headline>A control plane for agent execution.</Headline>
          </Reveal>
          <Reveal delay={80}>
            <Lede className="mt-6">
              Sulcus is designed as a layer between agent decision-making and the real world. It does
              not replace frameworks. It supervises them.
            </Lede>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-8 text-base leading-relaxed md:text-lg">
              We think of it as the difference between a car that drives and a traffic system that
              makes driving safe at scale.
            </p>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <div className="panel tech-frame relative overflow-hidden p-8">
            <span className="pointer-events-none absolute right-5 top-5 font-mono text-[10px] text-muted-foreground">layer_03</span>
            <div className="space-y-4">
              {layers.map((l, i) => (
                <div
                  key={l.t}
                  className="relative rounded-sm border px-5 py-5"
                  style={{
                    borderColor: i === 1 ? "rgba(255,122,26,0.45)" : "var(--border)",
                    background: i === 1 ? "rgba(255,122,26,0.06)" : "var(--surface-2)",
                    boxShadow: i === 1 ? "var(--glow-signal)" : undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="label-mono w-6 text-primary">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="text-base font-semibold">{l.t}</h3>
                  </div>
                  <p className="mt-2 pl-9 text-sm text-muted-foreground">{l.b}</p>
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08]" aria-hidden="true">
              <div className="h-64 w-64 rounded-full border border-primary" />
              <div className="absolute inset-0 m-auto h-48 w-48 rounded-full border border-primary" />
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
