import { Link } from "@tanstack/react-router";
import { Section, Headline, Lede, Reveal } from "./primitives";
import { WordmarkMark } from "./Wordmark";

export function InvestorCTA() {
  return (
    <section className="relative overflow-hidden bg-black py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden="true">
        <WordmarkMark className="absolute -right-16 -top-16 h-80 w-80 text-primary md:h-[28rem] md:w-[28rem]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        <Reveal>
          <Headline className="text-foreground">Investor materials available on request.</Headline>
        </Reveal>
        <Reveal delay={80}>
          <Lede className="mt-6 max-w-2xl text-foreground/70">
            We are currently raising our seed round. If you are interested in the future of
            autonomous systems infrastructure, we would love to talk.
          </Lede>
        </Reveal>
        <Reveal delay={140}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(255,122,26,0.35)]"
            >
              Talk to the team
            </Link>
            <a
              href="mailto:sofiia@sulcus.dev"
              className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
            >
              Email sofiia@sulcus.dev
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
