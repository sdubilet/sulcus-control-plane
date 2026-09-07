import { useEffect, useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "./primitives";
import { ParticleCanvas } from "./ParticleCanvas";

export function Hero() {
  const [progress, setProgress] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onScroll = () => {
      const rect = hero.getBoundingClientRect();
      const heroHeight = rect.height;
      const scrolled = Math.max(0, -rect.top);
      const p = Math.min(1, scrolled / (heroHeight * 0.65));
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-black"
    >
      <ParticleCanvas scrollProgress={progress} />

      {/* subtle vignette / gradient behind text for legibility */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(80% 70% at 0% 40%, rgba(0,0,0,0.85) 0%, transparent 60%), linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-32 md:pt-40">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-black/40 px-3 py-1 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary anim-pulse-node" />
            <span className="label-mono">AI agent infrastructure · control &amp; supervision</span>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="mt-8 max-w-4xl text-balance text-4xl font-semibold leading-[1.02] md:text-7xl">
            Runtime control for <span className="text-primary text-glow">AI agents</span>.
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Sulcus provides the infrastructure to supervise, coordinate, observe, and control
            AI-agent systems in production.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#architecture"
              className="rounded-sm border border-primary bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_-6px_color-mix(in_oklab,var(--signal)_55%,transparent)]"
            >
              Explore the Architecture
            </a>
            <Link
              to="/contact"
              className="rounded-sm border border-border-strong bg-black/40 px-5 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:border-primary hover:text-primary"
            >
              Talk to the Team
            </Link>
          </div>
        </Reveal>
      </div>

      {/* threshold annotation */}
      <div className="pointer-events-none absolute bottom-[40%] left-6 z-10 hidden items-center gap-3 md:flex">
        <span className="label-mono text-foreground/60">request boundary</span>
        <span className="h-px w-16 bg-foreground/30" />
      </div>

      {/* scroll handoff: next section emerges from black */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-48"
        style={{
          background: "linear-gradient(to top, var(--background) 0%, transparent 100%)",
          opacity: Math.min(1, progress * 1.5),
        }}
      />
    </section>
  );
}
