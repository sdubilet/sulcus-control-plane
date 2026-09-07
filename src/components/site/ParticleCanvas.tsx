import { useEffect, useRef, useState } from "react";

const COUNT = 900;
const THRESHOLD = 0.6;

type Particle = {
  x: number;
  y: number;
  z: number;
  vy: number;
  vx: number;
  size: number;
  state: "falling" | "hover" | "denied" | "passed";
  hoverPhase: number;
  life: number;
  scatterAngle: number;
  scatterSpeed: number;
};

function createParticle(w: number, h: number): Particle {
  const z = Math.random();
  return {
    x: Math.random() * w,
    y: Math.random() * h * 0.8,
    z,
    vy: 0.4 + Math.random() * 0.8 + z * 0.7,
    vx: (Math.random() - 0.5) * 0.25,
    size: 0.6 + z * 1.6,
    state: "falling",
    hoverPhase: Math.random() * Math.PI * 2,
    life: 1,
    scatterAngle: Math.random() * Math.PI,
    scatterSpeed: 0.8 + Math.random() * 1.2,
  };
}

export function ParticleCanvas({ scrollProgress }: { scrollProgress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | undefined>(undefined);
  const dprRef = useRef(1);
  const scrollRef = useRef(scrollProgress);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const onChange = () => setPrefersReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (prefersReduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dprRef.current = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dprRef.current);
      canvas.height = Math.floor(rect.height * dprRef.current);
    };
    resize();
    window.addEventListener("resize", resize);

    const w0 = () => canvas.width / dprRef.current;
    const h0 = () => canvas.height / dprRef.current;

    if (particlesRef.current.length === 0) {
      const w = w0();
      const h = h0();
      particlesRef.current = Array.from({ length: COUNT }, () => createParticle(w, h)).sort(
        (a, b) => b.z - a.z,
      );
    }

    let last = performance.now();
    const step = (t: number) => {
      const dt = Math.min((t - last) / 16.67, 2);
      last = t;
      const w = w0();
      const h = h0();
      const lineY = h * THRESHOLD;
      const sp = scrollRef.current;

      ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
      ctx.clearRect(0, 0, w, h);

      for (const p of particlesRef.current) {
        updateParticle(p, w, h, lineY, dt);
        drawParticle(ctx, p, w, h, lineY, sp);
      }

      ctx.save();
      ctx.globalAlpha = 0.55 - sp * 0.45;
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(w, lineY);
      ctx.stroke();
      ctx.restore();

      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReduced]);

  if (prefersReduced) {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.08) 0%, transparent 50%), linear-gradient(to bottom, #000 0%, #0a0a0a 100%)",
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 1 - scrollProgress * 0.85 }}
    />
  );
}

function updateParticle(p: Particle, w: number, h: number, lineY: number, dt: number) {
  if (p.state === "falling") {
    p.y += p.vy * dt;
    p.x += p.vx * dt;
    if (p.y >= lineY) {
      const r = Math.random();
      if (r < 0.78) {
        p.state = "passed";
      } else if (r < 0.94) {
        p.state = "hover";
        p.hoverPhase = Math.random() * Math.PI * 2;
      } else {
        p.state = "denied";
        p.scatterAngle = Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
        p.scatterSpeed = 0.8 + Math.random() * 1.2;
        p.life = 1;
      }
    }
  } else if (p.state === "passed") {
    p.y += p.vy * dt;
    p.x += p.vx * dt;
    if (p.y > h + 4) {
      Object.assign(p, createParticle(w, h));
      p.y = -4;
    }
  } else if (p.state === "hover") {
    p.hoverPhase += 0.04 * dt;
    p.y = lineY - 6 - Math.sin(p.hoverPhase) * 3;
    p.x += Math.cos(p.hoverPhase) * 0.15 * dt;
  } else if (p.state === "denied") {
    p.x += Math.cos(p.scatterAngle) * p.scatterSpeed * dt;
    p.y += Math.sin(p.scatterAngle) * p.scatterSpeed * dt;
    p.life -= 0.04 * dt;
    if (p.life <= 0) {
      Object.assign(p, createParticle(w, h));
      p.y = -4;
    }
  }

  if (p.x < -4) p.x = w + 4;
  if (p.x > w + 4) p.x = -4;
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  p: Particle,
  w: number,
  h: number,
  lineY: number,
  scrollProgress: number,
) {
  const depth = p.z;
  const blur = depth < 0.35 ? 1.2 : depth < 0.7 ? 0.5 : 0;
  const alphaBase = 0.25 + depth * 0.55;

  let alpha = alphaBase;
  if (p.state === "hover") alpha = 0.55 + Math.sin(p.hoverPhase) * 0.2;
  if (p.state === "denied") alpha *= p.life;

  const yPart = (p.y - lineY) / (h - lineY);
  const partFactor = Math.max(0, Math.min(1, yPart * 1.8)) * scrollProgress;
  alpha *= 1 - partFactor * 0.85;

  const size = p.size * (1 - partFactor * 0.4);

  ctx.save();
  ctx.globalAlpha = alpha;
  if (blur > 0) {
    ctx.filter = `blur(${blur}px)`;
  }
  ctx.fillStyle = "#F2F0EB";
  ctx.beginPath();
  ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
