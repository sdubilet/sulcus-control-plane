import { Section, Headline, Lede, Reveal } from "./primitives";
import { ControlPlaneSchematic } from "./ControlPlaneSchematic";


export function Architecture() {
  return (
    <Section id="architecture" index="04" label="Architecture">
      <Reveal>
        <Headline>One control surface. Many runtimes.</Headline>
      </Reveal>
      <Reveal delay={80}>
        <Lede className="mt-6">
          Sulcus is designed to wrap existing agent runtimes and frameworks, applying supervision
          without requiring teams to rebuild their systems.
        </Lede>
      </Reveal>

      <div className="mt-14">
        <Reveal>
          <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
            One control layer for every agent.
          </h3>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            Agents execute. Agents collaborate. Sulcus observes, validates, reasons, and controls.
          </p>
        </Reveal>
        <Reveal delay={80} className="mt-6">
          <ControlPlaneSchematic />
        </Reveal>
      </div>

    </Section>
  );
}
