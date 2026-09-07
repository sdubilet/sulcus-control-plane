import { useEffect, useRef, useState } from "react";

const COUNT = 2200;
const THRESHOLD = 0.6;

export function ParticleCanvas({ scrollProgress }: { scrollProgress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>();
  const dprRef = useRef(1);

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

    const W = () => canvas.width / dprRef.current;
    const H = () => canvas.height / dprRef.current;

    if (particlesRef.current.length === 0) {
      particlesRef.current = Array.from({ length: COUNT }, () => createParticle(W(), H()));
    }

    let last = performance.now();
    const step = (t: number) => {
      const dt = Math.min((t - last) / 16.67, 2);
      last = t;
      const w = W();
      const h = H();
      const lineY = h * THRESHOLD;

      ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // soft depth-of-field: distant particles drawn first
      const sorted = particlesRef.current.slice().sort((a, b) => b.z - a.z);
      for (const p of sorted) {
        updateParticle(p, w, h, lineY, dt);
        drawParticle(ctx, p, w, h, lineY, scrollProgress);
      }

      // threshold line
      ctx.save();
      ctx.globalAlpha = 0.55 - scrollProgress * 0.45;
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
  }, [prefersReduced, scrollProgress]);

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

type Particle = {
  x: number;
  y: number;
  z: number; // 0..1 depth
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
  const z = Math.pow(Math.random(), 2.5); // bias toward far
  const size = 0.5 + (1 - z) * 1.7;
  const vy = 0.6 + (1 - z) * 1.4 + Math.random() * 0.4;
  return {
    x: Math.random() * w,
    y: Math.random() * h * 0.85 - h * 0.1,
    z,
    vy,
    vx: (Math.random() - 0.5) * 0.25,
    size,
    state: "falling",
    hoverPhase: Math.random() * Math.PI * 2,
    life: 1,
    scatterAngle: Math.random() * Math.PI,
    scatterSpeed: 0,
  };
}

function updateParticle(p: Particle, w: number, h: number, lineY: number, dt: number) {
  if (p.state === "falling") {
    p.y += p.vy * dt;
    p.x += p.vx * dt;

    // converge slightly toward center near threshold
    if (p.y > lineY - 80 && p.y < lineY) {
      const center = w * 0.5;
      p.vx += (center - p.x) * 0.00008 * dt;
    }

    if (p.y >= lineY) {
      const roll = Math.random();
      if (roll < 0.78) {
        p.state = "passed";
      } else if (roll < 0.94) {
        p.state = "hover";
        p.y = lineY - 4 - Math.random() * 18;
        p.hoverPhase = Math.random() * Math.PI * 2;
      } else {
        p.state = "denied";
        p.scatterAngle = (Math.random() - 0.5) * Math.PI;
        p.scatterSpeed = 1.2 + Math.random() * 1.6;
      }
    }
  } else if (p.state === "hover") {
    p.hoverPhase += 0.05 * dt;
    p.y += Math.sin(p.hoverPhase) * 0.35 * dt;
    p.x += Math.cos(p.hoverPhase * 0.7) * 0.25 * dt;
    p.life -= 0.003 * dt;
    if (p.life <= 0) {
      Object.assign(p, createParticle(w, h));
      p.y = -10;
    }
  } else if (p.state === "denied") {
    p.x += Math.cos(p.scatterAngle) * p.scatterSpeed * dt;
    p.y += Math.sin(p.scatterAngle) * p.scatterSpeed * dt + 0.4 * dt;
    p.life -= 0.025 * dt;
    if (p.life <= 0 || p.y > h + 20 || p.x < -20 || p.x > w + 20) {
      Object.assign(p, createParticle(w, h));
      p.y = -10;
    }
  } else if (p.state === "passed") {
    p.y += p.vy * dt;
    p.x += p.vx * dt;
    if (p.y > h + 20) {
      Object.assign(p, createParticle(w, h));
      p.y = -10;
    }
  }

  if (p.x < -20) p.x = w + 20;
  if (p.x > w + 20) p.x = -20;
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  p: Particle,
  w: number,
  h: number,
  lineY: number,
  scrollProgress: number,
) {
  const depth = 1 - p.z;
  const baseAlpha = 0.2 + depth * 0.75;
  const blur = p.z * 2.2;

  let alpha = baseAlpha;
  if (p.state === "hover") alpha *= 0.5 + 0.5 * Math.sin(p.hoverPhase * 2);
  if (p.state === "denied") alpha *= p.life;

  // recede / part as user scrolls through threshold
  const part = Math.max(0, scrollProgress - 0.2) * 1.2;
  const yOffset = (p.y - lineY) * part * 0.35;
  const drawY = p.y + yOffset;

  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha * (1 - scrollProgress * 0.7));
  ctx.fillStyle = "#ffffff";
  if (blur > 0.4) {
    ctx.shadowBlur = blur;
    ctx.shadowColor = "rgba(255,255,255,0.45)";
  }
  ctx.beginPath();
  ctx.arc(p.x, drawY, p.size * (1 + depth * 0.5), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
