import { useState } from "react";
import { Section, Headline, Lede, Reveal } from "./primitives";
import { ControlPlaneSchematic } from "./ControlPlaneSchematic";


const nodes = [
  { id: "agents", label: "Agents", x: 90, y: 70 },
  { id: "tools", label: "Tools", x: 90, y: 180 },
  { id: "sulcus", label: "Sulcus", x: 240, y: 125, primary: true },
  { id: "observe", label: "Observe", x: 390, y: 55 },
  { id: "govern", label: "Govern", x: 390, y: 125 },
  { id: "intervene", label: "Intervene", x: 390, y: 195 },
];

const connections: [string, string][] = [
  ["agents", "sulcus"],
  ["tools", "sulcus"],
  ["sulcus", "observe"],
  ["sulcus", "govern"],
  ["sulcus", "intervene"],
];

export function Architecture() {
  const [active, setActive] = useState<string | null>("sulcus");

  return (
    <Section id="architecture" index="04" label="Architecture">
      <Reveal>
        <Headline>One control surface. Many runtimes.</Headline>
      </Reveal>
      <Reveal delay={80}>
        <Lede className="mt-6">
          Sulcus is designed to wrap existing agent runtimes and frameworks, applying supervision
          without requiring teams to rebuild their systems.
        </Lede>
      </Reveal>

      <div className="mt-14">
        <Reveal>
          <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
            One control layer for every agent.
          </h3>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            Agents execute. Agents collaborate. Sulcus observes, validates, reasons, and controls.
          </p>
        </Reveal>
        <Reveal delay={80} className="mt-6">
          <ControlPlaneSchematic />
        </Reveal>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Reveal>
          <div className="panel tech-frame relative overflow-hidden p-6">
            <span className="pointer-events-none absolute right-5 top-5 font-mono text-[10px] text-muted-foreground">topo_04</span>
            <svg viewBox="0 0 500 270" className="h-[280px] w-full" role="img" aria-label="Sulcus architecture topology">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-strong)" />
                </marker>
              </defs>
              <g opacity="0.1">
                <circle cx="240" cy="125" r="60" fill="none" stroke="var(--border-strong)" strokeWidth="1" />
                <circle cx="240" cy="125" r="100" fill="none" stroke="var(--border-strong)" strokeWidth="1" />
              </g>
              {connections.map(([a, b]) => {
                const na = nodes.find((n) => n.id === a)!;
                const nb = nodes.find((n) => n.id === b)!;
                return (
                  <line
                    key={`${a}-${b}`}
                    x1={na.x}
                    y1={na.y}
                    x2={nb.x}
                    y2={nb.y}
                    stroke="var(--border-strong)"
                    strokeWidth="1"
                    markerEnd="url(#arrow)"
                    className="anim-flow"
                  />
                );
              })}
              {nodes.map((n) => {
                const isActive = active === n.id;
                return (
                  <g
                    key={n.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setActive(n.id)}
                    onMouseLeave={() => setActive("sulcus")}
                  >
                    <rect
                      x={n.x - 42}
                      y={n.y - 18}
                      width={84}
                      height={36}
                      rx={6}
                      fill={n.primary ? "var(--primary)" : "var(--surface-2)"}
                      stroke={isActive ? "var(--signal)" : n.primary ? "var(--primary)" : "var(--border-strong)"}
                      strokeWidth={isActive ? 2 : 1}
                    />
                    <text
                      x={n.x}
                      y={n.y + 4}
                      textAnchor="middle"
                      fontSize="11"
                      fontFamily="var(--font-mono)"
                      fill={n.primary ? "var(--primary-foreground)" : "var(--foreground)"}
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="grid gap-4">
            {[
              { t: "Runtime adapters", b: "Connect to existing agent frameworks and tool environments." },
              { t: "Policy engine", b: "Evaluate actions against configurable rules and constraints." },
              { t: "Execution graph", b: "Track, coordinate, and reconstruct agent runs." },
              { t: "Control API", b: "Pause, resume, redirect, or terminate execution programmatically." },
            ].map((i, idx) => (
              <div key={i.t} className="panel p-5">
                <span className="label-mono text-primary">{String(idx + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-base font-semibold">{i.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{i.b}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
