import { Section, Headline, Lede, Reveal } from "./primitives";
import { SystemArchitecture } from "./SystemArchitecture";

export function Approach() {
  return (
    <Section id="approach" index="03" label="Our approach">
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
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
        </div>
        <div className="lg:pt-4">
          <Reveal delay={120}>
            <p className="text-base leading-relaxed md:text-lg">
              Agents can act independently. But once multiple agents work asynchronously, autonomy
              becomes a systems problem.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              Sulcus provides the global context, coordination, and control required to make
              autonomous agents operate as one system.
            </p>
          </Reveal>
        </div>
      </div>

      <Reveal delay={120} className="mt-14">
        <SystemArchitecture />
      </Reveal>

      <Reveal delay={160}>
        <p className="mt-6 font-mono text-xs tracking-[0.18em] text-muted-foreground">
          <span className="text-primary">AGENTS EXECUTE.</span> SULCUS ORCHESTRATES.
          <span className="mt-2 block normal-case tracking-normal">
            Individual agents are autonomous. The system is coordinated.
          </span>
        </p>
      </Reveal>
    </Section>
  );
}
