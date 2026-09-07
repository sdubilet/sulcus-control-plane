import { Section, Headline, Lede, Reveal } from "./primitives";
import { OrchestrationTheatre } from "./OrchestrationTheatre";

export function Coordination() {
  return (
    <Section id="coordination" index="04" label="Architecture">
      <Reveal>
        <Headline>Autonomy requires coordination.</Headline>
      </Reveal>
      <Reveal delay={80}>
        <Lede className="mt-6">
          As agent systems become multi-agent and asynchronous, execution becomes a systems problem.
          Sulcus gives you a control layer that understands what every agent is doing, how their work
          connects, and what should happen next.
        </Lede>
      </Reveal>

      <Reveal delay={120} className="mt-12">
        <OrchestrationTheatre />
      </Reveal>

      <Reveal delay={160}>
        <p className="mt-6 font-mono text-xs tracking-[0.18em] text-muted-foreground">
          <span className="text-primary">AGENTS EXECUTE.</span> SULCUS ORCHESTRATES.
        </p>
      </Reveal>
    </Section>
  );
}
