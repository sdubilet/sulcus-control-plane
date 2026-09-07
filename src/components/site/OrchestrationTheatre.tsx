import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ── data model ─────────────────────────────────────────────── */

type Agent = {
  id: string;
  label: string;
  role: string;
  task: string;
  tools: string[];
  x: number;
};

type Step = {
  sulcus: string;
  kind: "observe" | "validate" | "reason" | "control";
  status: Record<string, string>;
  busy?: string[];
  msg?: { from: string; to: string; text: string };
  approval?: boolean;
  note?: string;
};

type Scenario = {
  id: string;
  label: string;
  user: string;
  goal: string;
  agents: Agent[];
  links: [string, string][];
  exec: string[];
  steps: Step[];
};

const COL = [110, 300, 490, 680, 870];

const DEV: Scenario = {
  id: "dev",
  label: "software development",
  user: "Build and launch the new website.",
  goal: "Build → Test → Launch → Learn",
  agents: [
    { id: "claude", label: "Claude Code", role: "Frontend development", task: "Implement checkout UI", tools: ["GitHub", "Files"], x: COL[0]! },
    { id: "codex", label: "Codex", role: "Backend + API", task: "Payments endpoint", tools: ["APIs", "CI"], x: COL[1]! },
    { id: "kimi", label: "Kimi", role: "Research + analysis", task: "Implementation options", tools: ["Browser"], x: COL[2]! },
    { id: "research", label: "Research Agent", role: "Market + competitors", task: "Competitor scan", tools: ["Browser", "Database"], x: COL[3]! },
    { id: "support", label: "Customer Support Agent", role: "Customer feedback", task: "Feedback clustering", tools: ["Email", "Database"], x: COL[4]! },
  ],
  links: [
    ["claude", "codex"],
    ["codex", "kimi"],
    ["kimi", "research"],
    ["research", "support"],
  ],
  exec: ["GitHub", "APIs", "Browser", "Cloud", "Database", "Email", "Production"],
  steps: [
    {
      sulcus: "Goal received · decomposing work",
      kind: "observe",
      status: { claude: "assigned", codex: "assigned", kimi: "assigned", research: "assigned", support: "assigned" },
    },
    {
      sulcus: "5 agents active · 3 tasks running",
      kind: "observe",
      busy: ["claude", "codex", "kimi"],
      status: { claude: "edits frontend", codex: "builds API", kimi: "researching options", research: "analyzing competitors", support: "reading feedback" },
    },
    {
      sulcus: "Dependency detected · frontend → payments endpoint",
      kind: "reason",
      busy: ["codex"],
      status: { claude: "waiting for API", codex: "prioritize endpoint", kimi: "researching options", research: "analyzing competitors", support: "reading feedback" },
      msg: { from: "claude", to: "codex", text: "needs endpoint Y" },
      note: "sequence · claude code paused until contract lands",
    },
    {
      sulcus: "Dependency cleared · releasing Claude Code",
      kind: "control",
      busy: ["claude", "codex"],
      status: { claude: "resumes UI", codex: "runs tests", kimi: "recommendation ready", research: "trend identified", support: "15 requests for X" },
      msg: { from: "codex", to: "claude", text: "API contract ready" },
    },
    {
      sulcus: "Conflict detected · shared schema write",
      kind: "validate",
      busy: ["codex"],
      status: { claude: "frontend/config", codex: "api/schema", kimi: "idle", research: "trend identified", support: "15 requests for X" },
      note: "lock · arbitrate · sequence — safe execution order applied",
    },
    {
      sulcus: "System insight · demand + competitive pressure on feature X",
      kind: "reason",
      busy: ["research", "support"],
      status: { claude: "implementing Y", codex: "tests green", kimi: "correlating", research: "competitor shipped X", support: "customers want X" },
      msg: { from: "support", to: "research", text: "15 customers requested X" },
      note: "recommend reprioritization → feature X",
    },
    {
      sulcus: "Approval required · deploy to production",
      kind: "control",
      status: { claude: "held", codex: "awaiting approval", kimi: "idle", research: "idle", support: "idle" },
      approval: true,
    },
    {
      sulcus: "Approved · authorizing Codex to continue",
      kind: "control",
      busy: ["codex", "claude"],
      status: { claude: "shipping UI", codex: "deploying", kimi: "idle", research: "monitoring", support: "monitoring" },
      msg: { from: "codex", to: "claude", text: "release cut" },
    },
  ],
};

const SCENARIOS = [DEV];

/* ── geometry ───────────────────────────────────────────────── */

const W = 980;
const H = 640;
const AGENT_W = 158;
const AGENT_H = 62;
const AGENT_Y = 330;
const FIELD_Y = 300;
const FIELD_H = 168;
const EXEC_Y = 546;
const CAPS = [
  { t: "OBSERVE", b: "System state • Agent actions • Context", k: "observe" },
  { t: "VALIDATE", b: "Policy • Permissions • Constraints", k: "validate" },
  { t: "REASON", b: "Dependencies • Conflicts • Next action", k: "reason" },
  { t: "CONTROL", b: "Allow • Guide • Pause • Intervene", k: "control" },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function OrchestrationTheatre() {
  const scenario = SCENARIOS[0]!;

  const [i, setI] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const [hoverSulcus, setHoverSulcus] = useState(false);
  const reduced = usePrefersReducedMotion();
  const wrap = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => setI(0), [scenarioId]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !inView) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % scenario.steps.length), 3000);
    return () => window.clearInterval(id);
  }, [reduced, inView, scenario]);

  const step = scenario.steps[i]!;
  const agentById = (id: string) => scenario.agents.find((a) => a.id === id)!;
  const active = hover ? agentById(hover) : null;

  const linked = useMemo(() => {
    if (!hover) return new Set<string>();
    const s = new Set<string>([hover]);
    scenario.links.forEach(([a, b]) => {
      if (a === hover) s.add(b);
      if (b === hover) s.add(a);
    });
    return s;
  }, [hover, scenario]);

  const dim = (id: string) => hover !== null && !linked.has(id);
  const busy = (id: string) => (step.busy ?? []).includes(id);

  const stats = [
    `${scenario.agents.length} agents active`,
    `${(step.busy ?? []).length} tasks running`,
    step.kind === "reason" ? "1 dependency" : "0 dependencies",
    step.approval ? "1 approval pending" : "0 approvals pending",
    "0 policy violations",
  ];

  return (
    <div ref={wrap} className="panel tech-frame relative overflow-hidden p-4 sm:p-6">
      {/* header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="label-mono">orchestration · live simulation</p>
        <p className="label-mono text-primary">{scenario.label}</p>
      </div>


      {/* Desktop */}
      <div className="hidden md:block">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`Sulcus orchestrating a multi-agent ${scenario.label} system: a human goal enters the Sulcus control plane, which observes, validates, reasons about and controls a network of collaborating agents acting on external systems.`}
        >
          <defs>
            <linearGradient id="ot-plane" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--surface-2)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--surface)" stopOpacity="0.85" />
            </linearGradient>
            <marker id="ot-tip" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L8 4 L0 8 z" fill="var(--border-strong)" />
            </marker>
          </defs>

          {/* user */}
          <rect x={W / 2 - 190} y={10} width={380} height={54} rx={4} fill="var(--surface)" stroke="var(--border-strong)" />
          <text x={W / 2} y={31} textAnchor="middle" fontSize="10" letterSpacing="3" fontFamily="var(--font-mono)" fill="var(--primary)">
            USER
          </text>
          <text x={W / 2} y={50} textAnchor="middle" fontSize="11.5" fontFamily="var(--font-mono)" fill="var(--foreground)">
            “{scenario.user}”
          </text>
          <text x={W / 2} y={82} textAnchor="middle" fontSize="9.5" letterSpacing="2" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            GOAL · {scenario.goal}
          </text>
          <line x1={W / 2} y1={92} x2={W / 2} y2={116} stroke="var(--border-strong)" markerEnd="url(#ot-tip)" />

          {/* sulcus control plane */}
          <g onMouseEnter={() => setHoverSulcus(true)} onMouseLeave={() => setHoverSulcus(false)}>
            <rect
              x={30}
              y={118}
              width={W - 60}
              height={150}
              rx={8}
              fill="url(#ot-plane)"
              stroke={hoverSulcus ? "var(--signal)" : "var(--border-strong)"}
              strokeWidth={hoverSulcus ? 1.4 : 1}
              style={{ transition: "stroke 300ms ease" }}
            />
            <text x={54} y={146} fontSize="13" letterSpacing="4" fontFamily="var(--font-mono)" fill="var(--primary)">
              SULCUS
            </text>
            <text x={54} y={164} fontSize="9.5" letterSpacing="2.4" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
              CONTROL PLANE
            </text>
            <g>
              <circle cx={W - 190} cy={140} r={3} fill="var(--primary)" className={reduced ? undefined : "anim-pulse-node"} />
              <text x={W - 54} y={144} textAnchor="end" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
                continuous evaluation
              </text>
            </g>

            {CAPS.map((c, n) => {
              const w = (W - 60 - 40 - 3 * 16) / 4;
              const x = 50 + n * (w + 16);
              const on = step.kind === c.k;
              return (
                <g key={c.t}>
                  <rect
                    x={x}
                    y={182}
                    width={w}
                    height={66}
                    rx={5}
                    fill={on ? "color-mix(in srgb, var(--primary) 8%, var(--surface-3))" : "var(--surface-3)"}
                    stroke={on ? "var(--primary)" : hoverSulcus ? "var(--border-strong)" : "var(--border)"}
                    style={{ transition: "fill 400ms ease, stroke 400ms ease" }}
                  />
                  <text x={x + 14} y={206} fontSize="11.5" letterSpacing="2" fontFamily="var(--font-mono)" fill={on ? "var(--primary)" : "var(--foreground)"}>
                    {c.t}
                  </text>
                  <text x={x + 14} y={228} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
                    {c.b.split(" • ").slice(0, 2).join(" • ")}
                  </text>
                  <text x={x + 14} y={240} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
                    {c.b.split(" • ").slice(2).join(" • ")}
                  </text>
                  {n < 3 && (
                    <line x1={x + w + 2} y1={215} x2={x + w + 13} y2={215} stroke="var(--border-strong)" markerEnd="url(#ot-tip)" />
                  )}
                </g>
              );
            })}
          </g>

          {/* sulcus decision readout */}
          <rect x={30} y={276} width={W - 60} height={26} rx={4} fill="var(--surface-2)" stroke="var(--border)" />
          <circle cx={46} cy={289} r={3} fill="var(--primary)" className={reduced ? undefined : "anim-pulse-node"} />
          <text x={58} y={293} fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--foreground)">
            {step.sulcus}
          </text>
          {step.note && (
            <text x={W - 46} y={293} textAnchor="end" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
              {step.note}
            </text>
          )}

          {/* supervisory field around the agent network */}
          <rect
            x={30}
            y={FIELD_Y + 12}
            width={W - 60}
            height={FIELD_H}
            rx={10}
            fill="none"
            stroke="var(--primary)"
            strokeOpacity={hoverSulcus ? 0.5 : 0.18}
            strokeDasharray="2 6"
            style={{ transition: "stroke-opacity 300ms ease" }}
          />
          <text x={W - 44} textAnchor="end" y={FIELD_Y + 8} fontSize="8.5" letterSpacing="2.4" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            SUPERVISED EXECUTION FIELD · AGENT NETWORK
          </text>

          {/* supervisory lines sulcus ↕ agents */}
          {scenario.agents.map((a) => {
            const on = hoverSulcus || hover === a.id;
            return (
              <g key={`s-${a.id}`} opacity={dim(a.id) ? 0.2 : 1} style={{ transition: "opacity 300ms ease" }}>
                <line
                  x1={a.x - 12}
                  y1={302}
                  x2={a.x - 12}
                  y2={AGENT_Y}
                  stroke={on ? "var(--primary)" : "var(--border-strong)"}
                  className={on && !reduced ? "anim-flow" : undefined}
                  style={{ transition: "stroke 300ms ease" }}
                />
                <line
                  x1={a.x + 12}
                  y1={AGENT_Y}
                  x2={a.x + 12}
                  y2={302}
                  stroke={on ? "var(--primary)" : "var(--border)"}
                  strokeDasharray="2 4"
                  style={{ transition: "stroke 300ms ease" }}
                />
              </g>
            );
          })}

          {/* agent ↔ agent */}
          {scenario.links.map(([a, b]) => {
            const na = agentById(a);
            const nb = agentById(b);
            const y = AGENT_Y + AGENT_H;
            const mid = (na.x + nb.x) / 2;
            const on = hover === a || hover === b;
            const d = `M ${na.x + 26} ${y} C ${mid} ${y + 48}, ${mid} ${y + 48}, ${nb.x - 26} ${y}`;
            const carrying =
              step.msg &&
              ((step.msg.from === a && step.msg.to === b) || (step.msg.from === b && step.msg.to === a));
            return (
              <g key={`${a}-${b}`}>
                <path
                  id={`ot-${scenario.id}-${a}-${b}`}
                  d={d}
                  fill="none"
                  stroke={on || carrying ? "var(--signal)" : "var(--border-strong)"}
                  strokeWidth={on || carrying ? 1.3 : 1}
                  strokeDasharray="4 5"
                  opacity={hover && !on ? 0.15 : 0.8}
                  className={carrying && !reduced ? "anim-flow" : undefined}
                  style={{ transition: "opacity 300ms ease, stroke 300ms ease" }}
                />
                {carrying && !reduced && (
                  <circle key={`p-${i}`} r={3} fill="var(--signal)">
                    <animateMotion dur="2s" repeatCount="indefinite" path={d} />
                  </circle>
                )}
              </g>
            );
          })}

          {/* transient message label */}
          {step.msg && (
            <g key={`m-${i}`} className={reduced ? undefined : "animate-fade-in"}>
              {(() => {
                const na = agentById(step.msg.from);
                const nb = agentById(step.msg.to);
                const mx = (na.x + nb.x) / 2;
                const label = `${na.label} → ${nb.label}: “${step.msg.text}”`;
                const w = label.length * 5.4 + 20;
                return (
                  <>
                    <rect x={mx - w / 2} y={AGENT_Y + AGENT_H + 20} width={w} height={20} rx={3} fill="var(--surface-2)" stroke="var(--signal)" strokeOpacity={0.5} />
                    <text x={mx} y={AGENT_Y + AGENT_H + 34} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--foreground)">
                      {label}
                    </text>
                  </>
                );
              })()}
            </g>
          )}

          {/* agents */}
          {scenario.agents.map((a) => {
            const on = hover === a.id || hoverSulcus;
            const status = step.status[a.id] ?? "idle";
            const waiting = /wait|hold|approval|pending/i.test(status);
            return (
              <g
                key={a.id}
                onMouseEnter={() => setHover(a.id)}
                onMouseLeave={() => setHover(null)}
                className="cursor-pointer"
                opacity={dim(a.id) ? 0.28 : 1}
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
                <circle
                  cx={a.x - AGENT_W / 2 + 14}
                  cy={AGENT_Y + 17}
                  r={3}
                  fill={waiting ? "var(--signal)" : busy(a.id) ? "var(--primary)" : "var(--muted-foreground)"}
                  className={busy(a.id) && !reduced ? "anim-pulse-node" : undefined}
                />
                <text x={a.x - AGENT_W / 2 + 26} y={AGENT_Y + 20} fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--foreground)">
                  {a.label.length > 18 ? `${a.label.slice(0, 17)}…` : a.label}
                </text>
                <text x={a.x - AGENT_W / 2 + 12} y={AGENT_Y + 36} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
                  {a.role}
                </text>
                <line x1={a.x - AGENT_W / 2 + 12} y1={AGENT_Y + 42} x2={a.x + AGENT_W / 2 - 12} y2={AGENT_Y + 42} stroke="var(--border)" />
                <text
                  x={a.x - AGENT_W / 2 + 12}
                  y={AGENT_Y + 55}
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  fill={waiting ? "var(--signal)" : "var(--foreground)"}
                >
                  → {status}
                </text>
              </g>
            );
          })}

          {/* agents → execution */}
          {scenario.agents.map((a) => (
            <line
              key={`e-${a.id}`}
              x1={a.x}
              y1={AGENT_Y + AGENT_H + 52}
              x2={a.x}
              y2={EXEC_Y - 6}
              stroke="var(--border)"
              opacity={dim(a.id) ? 0.15 : 0.75}
              markerEnd="url(#ot-tip)"
              style={{ transition: "opacity 300ms ease" }}
            />
          ))}

          {/* execution environment */}
          <rect x={26} y={EXEC_Y - 28} width={216} height={18} fill="var(--surface)" />
          <text x={30} y={EXEC_Y - 16} fontSize="9" letterSpacing="2.4" fontFamily="var(--font-mono)" fill="var(--foreground)">
            EXECUTION ENVIRONMENT
          </text>
          <rect x={30} y={EXEC_Y} width={W - 60} height={62} rx={6} fill="var(--surface)" stroke="var(--border)" />
          {scenario.exec.map((e, n) => {
            const w = (W - 60 - 28 - 6 * 10) / 7;
            const x = 44 + n * (w + 10);
            return (
              <g key={e}>
                <rect x={x} y={EXEC_Y + 15} width={w} height={32} rx={3} fill="var(--surface-2)" stroke="var(--border)" />
                <text x={x + w / 2} y={EXEC_Y + 35} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
                  {e}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="space-y-3">
          <div className="rounded-sm border border-border-strong bg-surface p-3 text-center">
            <p className="label-mono text-primary">USER</p>
            <p className="mt-1 font-mono text-[10.5px] text-foreground">“{scenario.user}”</p>
            <p className="mt-1 font-mono text-[9px] text-muted-foreground">GOAL · {scenario.goal}</p>
          </div>
          <Arrow />
          <div className="rounded-md border border-border-strong bg-surface-2 p-3">
            <p className="font-mono text-xs tracking-[0.24em] text-primary">SULCUS</p>
            <p className="font-mono text-[9px] tracking-[0.18em] text-muted-foreground">CONTROL PLANE</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {CAPS.map((c) => (
                <div
                  key={c.t}
                  className={cn(
                    "rounded-sm border p-2 transition-colors",
                    step.kind === c.k ? "border-primary/70 bg-primary/[0.07]" : "border-border bg-surface-3",
                  )}
                >
                  <p className="font-mono text-[10.5px] tracking-[0.12em]">{c.t}</p>
                  <p className="mt-1 font-mono text-[8.5px] leading-relaxed text-muted-foreground">{c.b}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-sm border border-border bg-surface px-2 py-2">
              <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary", !reduced && "anim-pulse-node")} />
              <p className="font-mono text-[9.5px] leading-relaxed text-foreground">{step.sulcus}</p>
            </div>
          </div>
          <Arrow bidirectional />
          <div className="rounded-md border border-dashed border-primary/30 p-2">
            <p className="label-mono">supervised execution field · agent network</p>
            <div className="mt-2 space-y-2">
              {scenario.agents.map((a, n) => {
                const status = step.status[a.id] ?? "idle";
                const waiting = /wait|hold|approval|pending/i.test(status);
                const msgHere = step.msg?.from === a.id;
                return (
                  <div key={a.id}>
                    <div className="rounded-sm border border-border-strong bg-surface-2 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            waiting ? "bg-primary" : busy(a.id) ? "bg-primary" : "bg-muted-foreground",
                            busy(a.id) && !reduced && "anim-pulse-node",
                          )}
                        />
                        <span className="font-mono text-[11px]">{a.label}</span>
                        <span className="ml-auto font-mono text-[8.5px] text-muted-foreground">{a.role}</span>
                      </div>
                      <p className={cn("mt-1 font-mono text-[9.5px]", waiting ? "text-primary" : "text-muted-foreground")}>
                        → {status}
                      </p>
                    </div>
                    {msgHere && step.msg && (
                      <p className="ml-3 mt-1 font-mono text-[8.5px] text-primary">
                        ↳ {agentById(step.msg.to).label}: “{step.msg.text}”
                      </p>
                    )}
                    {n < scenario.agents.length - 1 && (
                      <div className="ml-3 flex items-center gap-2 py-1">
                        <span className="h-3 w-px bg-border-strong" />
                        <span className="font-mono text-[8.5px] text-muted-foreground">↕ messages • dependencies</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <Arrow />
          <div className="rounded-md border border-border bg-surface p-3">
            <p className="label-mono">execution environment</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {scenario.exec.map((e) => (
                <span key={e} className="rounded-sm border border-border bg-surface-2 px-2 py-1 font-mono text-[9.5px] text-muted-foreground">
                  {e}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* approval prompt */}
      {step.approval && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-sm border border-primary/50 bg-primary/[0.06] px-4 py-3">
          <span className="font-mono text-[10px] tracking-[0.18em] text-primary">APPROVAL REQUIRED</span>
          <span className="font-mono text-[11px] text-foreground">{step.sulcus}</span>
          <span className="ml-auto flex gap-2">
            <span className="rounded-sm border border-primary/60 px-2 py-1 font-mono text-[10px] text-primary">Approve</span>
            <span className="rounded-sm border border-border px-2 py-1 font-mono text-[10px] text-muted-foreground">Reject</span>
          </span>
        </div>
      )}

      {/* readout */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4 border-t border-border pt-3">
        <div className="min-h-[46px] font-mono text-[11px]">
          {active ? (
            <>
              <p className="text-primary">{active.label}</p>
              <p className="text-muted-foreground">
                task: {active.task} · status: {step.status[active.id] ?? "idle"} · tools: {active.tools.join(", ")}
              </p>
              <p className="text-muted-foreground">sulcus: {step.sulcus}</p>
            </>
          ) : hoverSulcus ? (
            <>
              <p className="text-primary">GLOBAL SYSTEM STATE</p>
              <p className="text-muted-foreground">{stats.join(" · ")}</p>
            </>
          ) : (
            <p className="text-muted-foreground">hover an agent or the control plane · simulated telemetry</p>
          )}
        </div>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {scenario.steps.map((_, n) => (
            <span
              key={n}
              className={cn("h-1 w-5 rounded-full transition-colors", n === i ? "bg-primary" : "bg-border")}
            />
          ))}
        </div>
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
