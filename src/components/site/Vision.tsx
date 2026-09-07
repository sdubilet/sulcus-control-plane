import { Section, Headline, Lede, Reveal } from "./primitives";
import { WordmarkMark } from "./Wordmark";

export function Vision() {
  return (
    <Section id="vision" index="15" label="Vision">
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-surface/60 to-surface-2/40 px-6 py-20 md:px-12 md:py-28">
        <div className="pointer-events-none absolute right-0 top-0 opacity-[0.06]" aria-hidden="true">
          <WordmarkMark className="h-64 w-64 text-primary md:h-96 md:w-96" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <Reveal>
            <Headline>Control is the foundation of autonomy at scale.</Headline>
          </Reveal>
          <Reveal delay={80}>
            <Lede className="mt-6">
              The future of computing includes autonomous systems operating continuously on behalf of
              organizations. Sulcus is building the infrastructure layer that makes that future
              safe, inspectable, and governable.
            </Lede>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-8 border-l-2 border-primary pl-5 text-base leading-relaxed md:text-lg">
              We believe the most important infrastructure for the agent era will be the layer that
              controls what agents can do.
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
