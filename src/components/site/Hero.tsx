import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "./primitives";
import { ParticleHead } from "./ParticleHead";
import { HairlineRings } from "./Motifs";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [fade, setFade] = useState(0);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    let raf = 0;
    const onScroll = () => {
      const rect = hero.getBoundingClientRect();
      const scrolled = Math.max(0, -rect.top);
      const p = Math.min(1, scrolled / (rect.height * 0.85));
      progressRef.current = p;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setFade(p));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-black"
    >
      <ParticleHead progressRef={progressRef} />

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(75% 70% at 0% 45%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 40%, transparent 68%), linear-gradient(to right, rgba(0,0,0,0.78) 0%, transparent 58%)",
        }}
      />

      <div className="pointer-events-none absolute left-6 top-24 z-10 hidden md:block">
        <p className="label-mono text-foreground/55">
          python agent runtime · 1.0 Release Candidate
        </p>
      </div>

      <div className="pointer-events-none absolute right-[-6rem] top-1/2 z-[1] hidden -translate-y-1/2 text-foreground/40 lg:block">
        <HairlineRings className="h-[520px] w-[520px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-32 md:pt-40">
        <Reveal>
          <p className="label-mono text-primary">SULCUS · CONTROL LAYER</p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Runtime control for autonomous agents.
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
              href="#developers"
              className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
            >
              Try the Code
            </a>
            <a
              href="https://github.com/ElarizT/Sulcus#readme"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
            >
              Read the docs
            </a>
            <a
              href="https://github.com/ElarizT/Sulcus"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
            >
              GitHub
            </a>
          </div>
        </Reveal>
      </div>

      <div className="pointer-events-none absolute bottom-[18%] left-6 z-10 hidden items-center gap-3 md:flex">
        <span className="label-mono text-foreground/60">decision boundary</span>
        <span className="h-px w-16 bg-foreground/30" />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-56"
        style={{
          background: "linear-gradient(to top, var(--background) 0%, transparent 100%)",
          opacity: Math.min(1, fade * 1.6),
        }}
      />
    </section>
  );
}
