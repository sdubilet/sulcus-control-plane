import { createFileRoute } from "@tanstack/react-router";
import { Navigation } from "@/components/site/Navigation";
import { Footer } from "@/components/site/Footer";
import { WordmarkMark } from "@/components/site/Wordmark";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — Sulcus" },
      { name: "description", content: "Get in touch with the Sulcus team." },
      { property: "og:title", content: "Contact — Sulcus" },
      { property: "og:description", content: "Get in touch with the Sulcus team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://sulcus.dev/contact" }],
  }),
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-0 opacity-[0.04]" aria-hidden="true">
          <WordmarkMark className="h-72 w-72 text-primary md:h-96 md:w-96" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24 pt-32 md:pt-40">
          <p className="label-mono text-primary">CONTACT</p>
          <h1 className="mt-6 max-w-2xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Talk to the team.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            We are currently raising our seed round and talking to investors, design partners, and
            engineering leaders building autonomous systems.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Sofiia", role: "Co-founder / CEO", email: "sofiia@sulcus.dev" },
              { name: "Elariz", role: "Co-founder / CTO", email: "elariz@sulcus.dev" },
              { name: "Milan", role: "Co-founder / Engineering", email: "milan@sulcus.dev" },
            ].map((p) => (
              <a
                key={p.email}
                href={`mailto:${p.email}`}
                className="group panel tech-frame p-7 transition-all hover:border-primary/60"
              >
                <h2 className="text-xl font-semibold">{p.name}</h2>
                <p className="mt-1 text-sm text-primary">{p.role}</p>
                <p className="mt-5 break-words font-mono text-sm text-foreground transition-colors group-hover:text-primary">
                  {p.email}
                </p>
              </a>
            ))}
          </div>

          <div className="mt-16 border-t border-border pt-10">
            <p className="label-mono text-primary">GENERAL</p>
            <a
              href="mailto:milan@sulcus.dev"
              className="mt-3 inline-block font-mono text-lg text-foreground transition-colors hover:text-primary"
            >
              milan@sulcus.dev
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
