import { Section, Headline, Lede, Reveal } from "./primitives";

const team = [
  { name: "Sofiia", role: "Co-founder / CEO", note: "Strategy, product, and go-to-market." },
  { name: "Elariz", role: "Co-founder / CTO", note: "Architecture, runtime, and engineering." },
  { name: "Milan", role: "Co-founder / Engineering", note: "Systems and platform development." },
];

export function Team() {
  return (
    <Section id="team" index="16" label="Team">
      <Reveal>
        <Headline>Builders, not bystanders.</Headline>
      </Reveal>
      <Reveal delay={80}>
        <Lede className="mt-6">
          Sulcus is being built by a small team with deep conviction about the infrastructure
          required for autonomous systems.
        </Lede>
      </Reveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((m, i) => (
          <Reveal key={m.name} delay={i * 80}>
            <div className="panel tech-frame p-7">
              <span className="label-mono text-primary">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 text-xl font-semibold">{m.name}</h3>
              <p className="mt-2 text-sm text-primary">{m.role}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{m.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
