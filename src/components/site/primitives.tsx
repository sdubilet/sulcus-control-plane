import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useInView<HTMLDivElement>(0.12);
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function useInView<T extends HTMLElement>(threshold = 0.1) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}


export function Headline({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl", className)}>
      {children}
    </h2>
  );
}

export function Lede({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg", className)}>
      {children}
    </p>
  );
}

export function Section({
  id,
  index,
  label,
  className,
  children,
}: {
  id?: string;
  index?: string;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("relative border-t border-border", className)}>
      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
        {(index || label) && (
          <div className="relative mb-10 flex items-center gap-3">
            {index && <span className="label-mono relative z-10 text-primary">{index}</span>}
            {index && label && <span className="h-px w-8 bg-border-strong" />}
            {label && <span className="label-mono relative z-10">{label}</span>}
            {index && (
              <span
                className="pointer-events-none absolute -left-6 top-1/2 -translate-y-1/2 font-mono text-[10rem] font-bold leading-none text-foreground/[0.03] md:-left-10 md:text-[14rem]"
                aria-hidden="true"
              >
                {index}
              </span>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
