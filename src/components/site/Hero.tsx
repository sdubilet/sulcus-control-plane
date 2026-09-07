import { useEffect, useRef, useState } from "react";
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
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(80% 70% at 0% 40%, rgba(0,0,0,0.85) 0%, transparent 60%), linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 55%)",
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-32 md:pt-40">
        <Reveal>
          <p className="label-mono text-primary">SULCUS · CONTROL LAYER</p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Runtime control for AI agents.
          </h1>
        </Reveal>
        <Reveal delay={140}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/75 md:text-xl">
            Sulcus provides the infrastructure to supervise, coordinate, observe, and control AI-agent
            systems in production.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(255,122,26,0.35)]"
            >
              Talk to the team
            </Link>
            <a
              href="#architecture"
              className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
            >
              Explore the Architecture
            </a>
          </div>
        </Reveal>
      </div>

      <div className="pointer-events-none absolute bottom-[40%] left-6 z-10 hidden items-center gap-3 md:flex">
        <span className="label-mono text-foreground/60">request boundary</span>
        <span className="h-px w-16 bg-foreground/30" />
      </div>

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
