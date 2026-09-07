import { Section, Headline, Lede, Reveal } from "./primitives";
import { ControlSurface } from "./ControlSurface";

export function Approach() {
  return (
    <Section id="approach" index="03" label="Our approach">
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <Reveal>
            <Headline>Autonomy without losing control.</Headline>
          </Reveal>
        </div>
        <div className="lg:pt-3">
          <Reveal delay={80}>
            <Lede>
              Agents don't need a human watching every action. They need a system that makes their
              actions visible, bounded, and controllable.
            </Lede>
          </Reveal>
        </div>
      </div>

      <Reveal delay={120} className="mt-14">
        <ControlSurface />
      </Reveal>

      <Reveal delay={160}>
        <p className="mt-8 font-mono text-xs tracking-[0.18em] text-muted-foreground">
          <span className="text-primary">SEE EVERYTHING.</span> CONTROL WHAT MATTERS.
          <span className="mt-2 block normal-case tracking-normal">
            Let agents run autonomously. Step in only when it matters.
          </span>
        </p>
      </Reveal>
    </Section>
  );
}
