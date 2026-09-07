import { useState } from "react";
import { cn } from "@/lib/utils";

type Agent = {
  id: string;
  label: string;
  role: string;
  x: number;
};

const AGENTS: Agent[] = [
  { id: "claude", label: "Claude Code", role: "Coding agent", x: 110 },
  { id: "codex", label: "OpenAI Codex", role: "Software engineering agent", x: 300 },
  { id: "kimi", label: "Kimi", role: "General-purpose AI agent", x: 490 },
  { id: "langgraph", label: "LangGraph", role: "Agent orchestration framework", x: 680 },
  { id: "openclaw", label: "OpenClaw", role: "Autonomous task agent", x: 870 },
];

const A2A: [string, string][] = [
  ["claude", "codex"],
  ["codex", "kimi"],
  ["kimi", "langgraph"],
  ["langgraph", "openclaw"],
];

const STAGES = [
  { n: "01", t: "OBSERVE", b: "State • Actions • Outputs • Context" },
  { n: "02", t: "VALIDATE", b: "Policy • Permissions • Constraints • Risk" },
  { n: "03", t: "REASON", b: "System state • Dependencies • Intent" },
  { n: "04", t: "CONTROL", b: "Allow • Guide • Pause • Intervene" },
];

const EXEC = ["GitHub", "Browser", "APIs", "Databases", "Files", "Cloud infra", "External tools"];

const W = 980;
const AGENT_W = 150;
const AGENT_H = 46;
const AGENT_Y = 372;
const SULCUS_BOTTOM = 300;
const EXEC_Y = 500;

export function ControlPlaneSchematic() {
  const [hoverAgent, setHoverAgent] = useState<string | null>(null);
  const [hoverSulcus, setHoverSulcus] = useState(false);

  const agentById = (id: string) => AGENTS.find((a) => a.id === id)!;
  const isDim = (id: string) =>
    hoverAgent !== null &&
    hoverAgent !== id &&
    !A2A.some(([a, b]) => (a === hoverAgent && b === id) || (b === hoverAgent && a === id));

  const active = hoverAgent ? agentById(hoverAgent) : null;

  return (
    <div className="panel tech-frame relative overflow-hidden p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="label-mono">system topology</p>
        <span className="font-mono text-[10px] text-muted-foreground">arch_04 · control_plane</span>
      </div>

      {/* Desktop / tablet schematic */}
      <div className="hidden md:block">
        <svg
          viewBox={`0 0 ${W} 600`}
          className="w-full"
          role="img"
          aria-label="Sulcus control plane architecture: human intent flows into Sulcus, which observes, validates, reasons about, and controls a network of collaborating agents acting on the execution environment."
        >
          <defs>
            <linearGradient id="sulcusFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--surface-2)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--surface)" stopOpacity="0.85" />
            </linearGradient>
            <marker id="tip" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L8 4 L0 8 z" fill="var(--border-strong)" />
            </marker>
          </defs>

          {/* ── Human layer ── */}
          <g>
            <rect x={W / 2 - 80} y={12} width={160} height={40} rx={4} fill="var(--surface)" stroke="var(--border-strong)" />
            <text x={W / 2} y={37} textAnchor="middle" fontSize="12" letterSpacing="3" fontFamily="var(--font-mono)" fill="var(--foreground)">
              HUMAN
            </text>
            <text x={W / 2} y={70} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
              Goals • Intent • Constraints • Permissions
            </text>
          </g>
          <line x1={W / 2} y1={80} x2={W / 2} y2={112} stroke="var(--border-strong)" strokeWidth="1" markerEnd="url(#tip)" />

          {/* ── Sulcus control plane ── */}
          <g
            onMouseEnter={() => setHoverSulcus(true)}
            onMouseLeave={() => setHoverSulcus(false)}
            className="cursor-default"
          >
            <rect
              x={40}
              y={114}
              width={W - 80}
              height={SULCUS_BOTTOM - 114}
              rx={8}
              fill="url(#sulcusFill)"
              stroke={hoverSulcus ? "var(--signal)" : "var(--border-strong)"}
              strokeWidth={hoverSulcus ? 1.4 : 1}
              style={{ transition: "stroke 300ms ease, stroke-width 300ms ease" }}
            />
            <text x={64} y={142} fontSize="13" letterSpacing="4" fontFamily="var(--font-mono)" fill="var(--primary)">
              SULCUS
            </text>
            <text x={64} y={160} fontSize="9.5" letterSpacing="2.4" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
              AGENT CONTROL PLANE
            </text>
            <text x={W - 64} y={142} textAnchor="end" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
              continuous evaluation
            </text>

            {STAGES.map((s, i) => {
              const w = (W - 80 - 32 - 3 * 18) / 4;
              const x = 56 + i * (w + 18);
              return (
                <g key={s.t}>
                  <rect
                    x={x}
                    y={178}
                    width={w}
                    height={92}
                    rx={5}
                    fill="var(--surface-3)"
                    stroke={hoverSulcus ? "var(--primary)" : "var(--border)"}
                    strokeOpacity={hoverSulcus ? 0.55 : 1}
                    style={{ transition: "stroke 300ms ease" }}
                  />
                  <text x={x + 14} y={200} fontSize="9" fontFamily="var(--font-mono)" fill="var(--primary)">
                    {s.n}
                  </text>
                  <text x={x + 14} y={222} fontSize="12.5" letterSpacing="2" fontFamily="var(--font-mono)" fill="var(--foreground)">
                    {s.t}
                  </text>
                  <text x={x + 14} y={246} fontSize="9" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
                    {s.b.split(" • ").slice(0, 2).join(" • ")}
                  </text>
                  <text x={x + 14} y={259} fontSize="9" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
                    {s.b.split(" • ").slice(2).join(" • ")}
                  </text>
                  {i < 3 && (
                    <line
                      x1={x + w + 3}
                      y1={224}
                      x2={x + w + 15}
                      y2={224}
                      stroke="var(--border-strong)"
                      strokeWidth="1"
                      markerEnd="url(#tip)"
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* ── Layer label ── */}
          <text x={40} y={330} fontSize="9.5" letterSpacing="2.4" fontFamily="var(--font-mono)" fill="var(--foreground)">
            AGENTS &amp; FRAMEWORKS
          </text>
          <text x={40} y={346} fontSize="9" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            Different models • Different frameworks • Different capabilities
          </text>

          {/* ── Sulcus ↕ agents (control down, events up) ── */}
          {AGENTS.map((a) => {
            const highlight = hoverSulcus || hoverAgent === a.id;
            return (
              <g key={`v-${a.id}`} opacity={isDim(a.id) ? 0.25 : 1} style={{ transition: "opacity 300ms ease" }}>
                <line
                  x1={a.x - 14}
                  y1={SULCUS_BOTTOM}
                  x2={a.x - 14}
                  y2={AGENT_Y}
                  stroke={highlight ? "var(--primary)" : "var(--border-strong)"}
                  strokeWidth="1"
                  className={highlight ? "anim-flow" : undefined}
                  style={{ transition: "stroke 300ms ease" }}
                />
                <line
                  x1={a.x + 14}
                  y1={AGENT_Y}
                  x2={a.x + 14}
                  y2={SULCUS_BOTTOM}
                  stroke={highlight ? "var(--primary)" : "var(--border)"}
                  strokeWidth="1"
                  strokeDasharray="2 4"
                  style={{ transition: "stroke 300ms ease" }}
                />
              </g>
            );
          })}

          {/* ── Agent ↔ agent collaboration ── */}
          {A2A.map(([a, b]) => {
            const na = agentById(a);
            const nb = agentById(b);
            const y = AGENT_Y + AGENT_H;
            const mid = (na.x + nb.x) / 2;
            const on = hoverAgent === a || hoverAgent === b;
            return (
              <path
                key={`${a}-${b}`}
                d={`M ${na.x + 30} ${y} C ${mid} ${y + 46}, ${mid} ${y + 46}, ${nb.x - 30} ${y}`}
                fill="none"
                stroke={on ? "var(--signal)" : "var(--border-strong)"}
                strokeWidth={on ? 1.3 : 1}
                strokeDasharray="4 5"
                opacity={hoverAgent && !on ? 0.2 : 0.85}
                className={on ? "anim-flow" : undefined}
                style={{ transition: "opacity 300ms ease, stroke 300ms ease" }}
              />
            );
          })}

          {/* ── Agents ── */}
          {AGENTS.map((a) => {
            const on = hoverAgent === a.id || hoverSulcus;
            return (
              <g
                key={a.id}
                onMouseEnter={() => setHoverAgent(a.id)}
                onMouseLeave={() => setHoverAgent(null)}
                className="cursor-pointer"
                opacity={isDim(a.id) ? 0.3 : 1}
                style={{ transition: "opacity 300ms ease" }}
              >
                <rect
                  x={a.x - AGENT_W / 2}
                  y={AGENT_Y}
                  width={AGENT_W}
                  height={AGENT_H}
                  rx={4}
                  fill="var(--surface)"
                  stroke={on ? "var(--primary)" : "var(--border-strong)"}
                  strokeWidth={on ? 1.4 : 1}
                  style={{ transition: "stroke 300ms ease" }}
                />
                <circle cx={a.x - AGENT_W / 2 + 16} cy={AGENT_Y + AGENT_H / 2} r={3.5} fill="none" stroke={on ? "var(--primary)" : "var(--border-strong)"} />
                <circle cx={a.x - AGENT_W / 2 + 16} cy={AGENT_Y + AGENT_H / 2} r={1.2} fill={on ? "var(--primary)" : "var(--muted-foreground)"} />
                <text
                  x={a.x - AGENT_W / 2 + 30}
                  y={AGENT_Y + AGENT_H / 2 + 4}
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                  fill="var(--foreground)"
                >
                  {a.label}
                </text>
              </g>
            );
          })}

          {/* ── Agents → execution ── */}
          {AGENTS.map((a) => (
            <line
              key={`e-${a.id}`}
              x1={a.x}
              y1={AGENT_Y + AGENT_H + 52}
              x2={a.x}
              y2={EXEC_Y - 8}
              stroke="var(--border)"
              strokeWidth="1"
              opacity={isDim(a.id) ? 0.2 : 0.8}
              markerEnd="url(#tip)"
              style={{ transition: "opacity 300ms ease" }}
            />
          ))}

          {/* ── Execution environment ── */}
          <text x={40} y={EXEC_Y - 18} fontSize="9.5" letterSpacing="2.4" fontFamily="var(--font-mono)" fill="var(--foreground)">
            EXECUTION ENVIRONMENT
          </text>
          <rect x={40} y={EXEC_Y} width={W - 80} height={64} rx={6} fill="var(--surface)" stroke="var(--border)" />
          {EXEC.map((e, i) => {
            const w = (W - 80 - 28 - 6 * 10) / 7;
            const x = 54 + i * (w + 10);
            return (
              <g key={e}>
                <rect x={x} y={EXEC_Y + 16} width={w} height={32} rx={3} fill="var(--surface-2)" stroke="var(--border)" />
                <text x={x + w / 2} y={EXEC_Y + 36} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
                  {e}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Mobile stacked schematic */}
      <div className="md:hidden">
        <div className="space-y-3">
          <div className="rounded-sm border border-border-strong bg-surface p-3 text-center">
            <p className="label-mono">HUMAN</p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">Goals • Intent • Constraints</p>
          </div>
          <Arrow />
          <div className="rounded-md border border-border-strong bg-surface-2 p-3">
            <p className="font-mono text-xs tracking-[0.24em] text-primary">SULCUS</p>
            <p className="font-mono text-[9px] tracking-[0.18em] text-muted-foreground">AGENT CONTROL PLANE</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {STAGES.map((s) => (
                <div key={s.t} className="rounded-sm border border-border bg-surface-3 p-2">
                  <p className="font-mono text-[9px] text-primary">{s.n}</p>
                  <p className="font-mono text-[11px] tracking-[0.12em]">{s.t}</p>
                  <p className="mt-1 font-mono text-[8.5px] leading-relaxed text-muted-foreground">{s.b}</p>
                </div>
              ))}
            </div>
          </div>
          <Arrow bidirectional />
          <div className="rounded-md border border-border bg-surface p-3">
            <p className="label-mono">AGENTS &amp; FRAMEWORKS</p>
            <p className="mt-1 font-mono text-[9px] text-muted-foreground">
              Different models • Different frameworks
            </p>
            <div className="mt-3 space-y-2">
              {AGENTS.map((a, i) => (
                <div key={a.id}>
                  <div className="flex items-center gap-2 rounded-sm border border-border-strong bg-surface-2 px-3 py-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/80" />
                    <span className="font-mono text-[11px]">{a.label}</span>
                    <span className="ml-auto font-mono text-[9px] text-muted-foreground">{a.role}</span>
                  </div>
                  {i < AGENTS.length - 1 && (
                    <div className="ml-3 flex items-center gap-2 py-1">
                      <span className="h-3 w-px bg-border-strong" />
                      <span className="font-mono text-[8.5px] text-muted-foreground">↕ messages • context</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <Arrow />
          <div className="rounded-md border border-border bg-surface p-3">
            <p className="label-mono">EXECUTION ENVIRONMENT</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {EXEC.map((e) => (
                <span key={e} className="rounded-sm border border-border bg-surface-2 px-2 py-1 font-mono text-[9.5px] text-muted-foreground">
                  {e}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hover readout */}
      <div className="mt-4 flex min-h-[34px] items-center justify-between gap-4 border-t border-border pt-3">
        <p className={cn("font-mono text-[11px]", active || hoverSulcus ? "text-foreground" : "text-muted-foreground")}>
          {active ? (
            <>
              <span className="text-primary">{active.label}</span> · {active.role}
            </>
          ) : hoverSulcus ? (
            <>
              <span className="text-primary">Sulcus</span> · Observe • Validate • Reason • Control
            </>
          ) : (
            "hover an agent or the control plane for detail"
          )}
        </p>
        <span className="hidden font-mono text-[9.5px] text-muted-foreground sm:inline">
          — control · - - events
        </span>
      </div>
    </div>
  );
}

function Arrow({ bidirectional = false }: { bidirectional?: boolean }) {
  return (
    <div className="flex justify-center" aria-hidden="true">
      <span className="font-mono text-xs text-muted-foreground">{bidirectional ? "↕" : "↓"}</span>
    </div>
  );
}
