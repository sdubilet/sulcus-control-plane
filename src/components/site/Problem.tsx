import { Section, Headline, Lede, Reveal } from "./primitives";
import { cn } from "@/lib/utils";

const cards = [
  { title: "No one owns the runtime", body: "Agents are handed off to frameworks or infrastructure that was not built for autonomous decision-making." },
  { title: "Visibility is not control", body: "Observability tells you what happened. It does not let you stop, redirect, or govern what is happening." },
  { title: "Coordination is ad hoc", body: "Multi-agent systems are stitched together with custom code rather than a shared control model." },
  { title: "Failures are hard to replay", body: "When an autonomous system makes a bad decision, reconstructing why is expensive and slow." },
];

export function Problem() {
  return (
    <Section id="problem" index="02" label="The problem">
      <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <Reveal>
            <Headline>Autonomy without control is a liability.</Headline>
          </Reveal>
          <Reveal delay={80}>
            <Lede className="mt-6">
              Companies are racing to deploy agents that can act on their own. The missing layer is
              the infrastructure that decides whether those actions should happen at all.
            </Lede>
          </Reveal>
          <Reveal delay={140}>
            <div className="mt-8 border-l-2 border-primary pl-5 text-base leading-relaxed md:text-lg">
              Without runtime supervision, every autonomous action is a potential incident.
            </div>
          </Reveal>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 80}>
              <div className="panel tech-frame h-full p-6">
                <span className="label-mono text-primary">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-5 text-base font-semibold">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
