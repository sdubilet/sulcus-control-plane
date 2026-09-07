import { Section, Headline, Lede, Reveal } from "./primitives";
import { ContourField } from "./Motifs";

export function Vision() {
  return (
    <Section id="vision" index="15" label="Vision">
      <div className="relative overflow-hidden rounded-xl border border-border bg-black px-6 py-20 md:px-12 md:py-28">
        <div
          className="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2 opacity-[0.55] md:right-[-4rem]"
          aria-hidden="true"
        >
          <ContourField className="h-[420px] w-[420px] md:h-[560px] md:w-[560px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.6)_55%,transparent_100%)]" />
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
            <p className="mt-10 max-w-2xl border-l-2 border-primary pl-6 text-2xl font-semibold leading-snug tracking-tight md:text-3xl">
              We believe the most important infrastructure for the agent era will be the layer that
              controls what agents can do.
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
