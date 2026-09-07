import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ── data model ─────────────────────────────────────────────── */

type Agent = {
  id: string;
  label: string;
  role: string;
  task: string;
  x: number;
  y: number;
};

type Phase = "observe" | "validate" | "reason" | "control";

type Frame = {
  sulcus: string;
  phase: Phase;
  status: Record<string, string>;
  busy?: string[];
  msg?: { from: string; to: string; text: string };
  approval?: boolean;
  note?: string;
  state: { running: number; deps: number; approvals: number };
};

type Scenario = {
  id: string;
  label: string;
  user: string;
  intent: string;
  agents: Agent[];
  links: [string, string][];
  tools: string[];
  frames: Frame[];
};

/* arc layout: five agents on a shallow curve under the control plane */
const P: [number, number][] = [
  [122, 372],
  [312, 336],
  [502, 326],
  [692, 336],
  [882, 372],
];

const DEV: Scenario = {
  id: "dev",
  label: "software development",
  user: "Build and launch the new website.",
  intent: "goal • constraints • permissions",
  agents: [
    { id: "claude", label: "Claude Code", role: "Frontend", task: "Implement checkout UI", x: P[0]![0], y: P[0]![1] },
    { id: "codex", label: "Codex", role: "Backend + API", task: "Implement payments API", x: P[1]![0], y: P[1]![1] },
    { id: "kimi", label: "Kimi", role: "Technical research", task: "Research implementation options", x: P[2]![0], y: P[2]![1] },
    { id: "research", label: "Research Agent", role: "Market + competitors", task: "Analyze competitors", x: P[3]![0], y: P[3]![1] },
    { id: "support", label: "Support Agent", role: "Customer feedback", task: "Analyze customer feedback", x: P[4]![0], y: P[4]![1] },
  ],
  links: [
    ["claude", "codex"],
    ["kimi", "claude"],
    ["research", "kimi"],
    ["support", "research"],
  ],
  tools: ["GitHub", "APIs", "Browser", "Cloud", "Database", "Email", "Production"],
  frames: [
    {
      sulcus: "Goal received · decomposing into supervised work",
      phase: "observe",
      status: { claude: "assigned", codex: "assigned", kimi: "assigned", research: "assigned", support: "assigned" },
      state: { running: 0, deps: 0, approvals: 0 },
    },
    {
      sulcus: "Agents executing autonomously · global state tracked",
      phase: "observe",
      busy: ["claude", "codex", "kimi"],
      status: { claude: "editing frontend", codex: "writing endpoint", kimi: "comparing approaches", research: "collecting feature data", support: "clustering requests" },
      state: { running: 3, deps: 0, approvals: 0 },
    },
    {
      sulcus: "Dependency detected · checkout UI → payments endpoint",
      phase: "reason",
      busy: ["codex"],
      status: { claude: "waiting for API", codex: "prioritize payments endpoint", kimi: "recommendation ready", research: "identifying trends", support: "clustering requests" },
      msg: { from: "claude", to: "codex", text: "blocked on payments contract" },
      note: "sequence applied · claude code held",
      state: { running: 2, deps: 1, approvals: 0 },
    },
    {
      sulcus: "Dependency resolved · releasing Claude Code",
      phase: "control",
      busy: ["claude", "codex"],
      status: { claude: "resuming checkout UI", codex: "running tests", kimi: "recommendation ready", research: "identifying trends", support: "feature request detected" },
      msg: { from: "codex", to: "claude", text: "API contract ready" },
      state: { running: 3, deps: 0, approvals: 0 },
    },
    {
      sulcus: "Conflict detected · shared schema write",
      phase: "validate",
      busy: ["codex"],
      status: { claude: "frontend/config", codex: "api/schema", kimi: "idle", research: "identifying trends", support: "feature request detected" },
      note: "lock → sequence → release",
      state: { running: 2, deps: 1, approvals: 0 },
    },
    {
      sulcus: "System insight · customer demand + competitive pressure on feature X",
      phase: "reason",
      busy: ["research", "support"],
      status: { claude: "implementing feature Y", codex: "tests green", kimi: "correlating signals", research: "competitor shipped X", support: "customers request X" },
      msg: { from: "support", to: "research", text: "Feature X requested by customers" },
      note: "recommend reprioritizing feature X",
      state: { running: 3, deps: 1, approvals: 0 },
    },
    {
      sulcus: "Approval required · deploy to production",
      phase: "control",
      status: { claude: "held", codex: "awaiting approval", kimi: "idle", research: "idle", support: "idle" },
      approval: true,
      state: { running: 1, deps: 0, approvals: 1 },
    },
    {
      sulcus: "Approved · authorizing Codex · execution resumes",
      phase: "control",
      busy: ["codex", "claude"],
      status: { claude: "shipping UI", codex: "deploying", kimi: "idle", research: "monitoring", support: "monitoring" },
      msg: { from: "codex", to: "claude", text: "release cut" },
      state: { running: 2, deps: 0, approvals: 0 },
    },
  ],
};

const OPS: Scenario = {
  id: "ops",
  label: "business operations",
  user: "Run my grocery business.",
  intent: "goal • budget • approval thresholds",
  agents: [
    { id: "inventory", label: "Inventory Agent", role: "POS / stock", task: "Track stock levels", x: P[0]![0], y: P[0]![1] },
    { id: "accounting", label: "Accounting Agent", role: "Reconciliation", task: "Reconcile sales + invoices", x: P[1]![0], y: P[1]![1] },
    { id: "market", label: "Market Research Agent", role: "Trends", task: "Analyze demand trends", x: P[2]![0], y: P[2]![1] },
    { id: "purchasing", label: "Purchasing Agent", role: "Suppliers", task: "Prepare supplier orders", x: P[3]![0], y: P[3]![1] },
    { id: "customer", label: "Customer Agent", role: "Reviews", task: "Analyze customer feedback", x: P[4]![0], y: P[4]![1] },
  ],
  links: [
    ["inventory", "accounting"],
    ["inventory", "purchasing"],
    ["market", "purchasing"],
    ["customer", "market"],
  ],
  tools: ["POS", "Ledger", "Suppliers", "Email", "Database", "Browser", "Payments"],
  frames: [
    {
      sulcus: "Goal received · assigning operating agents",
      phase: "observe",
      status: { inventory: "assigned", accounting: "assigned", market: "assigned", purchasing: "assigned", customer: "assigned" },
      state: { running: 0, deps: 0, approvals: 0 },
    },
    {
      sulcus: "Signal · milk inventory below threshold",
      phase: "observe",
      busy: ["inventory", "accounting"],
      status: { inventory: "milk below threshold", accounting: "reconciling sales", market: "scanning trends", purchasing: "listening", customer: "reading reviews" },
      msg: { from: "inventory", to: "purchasing", text: "low stock: milk" },
      state: { running: 2, deps: 1, approvals: 0 },
    },
    {
      sulcus: "Signals aligned · demand trend + stock gap",
      phase: "reason",
      busy: ["market", "purchasing"],
      status: { inventory: "milk below threshold", accounting: "books current", market: "oat milk demand rising", purchasing: "recommend 120 units", customer: "complaint cluster" },
      msg: { from: "market", to: "purchasing", text: "shift mix → oat milk" },
      note: "recommended order · 120 units",
      state: { running: 2, deps: 1, approvals: 0 },
    },
    {
      sulcus: "Purchase approval required · supplier order",
      phase: "validate",
      status: { inventory: "holding", accounting: "holding", market: "idle", purchasing: "awaiting approval", customer: "idle" },
      approval: true,
      state: { running: 1, deps: 0, approvals: 1 },
    },
    {
      sulcus: "Approved · authorizing Purchasing Agent",
      phase: "control",
      busy: ["purchasing", "accounting"],
      status: { inventory: "restock pending", accounting: "PO booked", market: "monitoring", purchasing: "order submitted", customer: "monitoring" },
      msg: { from: "purchasing", to: "accounting", text: "PO #4471" },
      state: { running: 2, deps: 0, approvals: 0 },
    },
  ],
};

const SCENARIOS = [DEV, OPS];

/* ── geometry ───────────────────────────────────────────────── */

const W = 1000;
const H = 620;
const AW = 168;
const AH = 66;

const CX = 500;
const CY = 158;
const RX = 268;
const RY = 54;

const LOOP: { t: string; b: string; k: Phase; a: number }[] = [
  { t: "OBSERVE", b: "State • Actions • Context", k: "observe", a: Math.PI },
  { t: "VALIDATE", b: "Policy • Permissions • Constraints", k: "validate", a: -Math.PI / 2 },
  { t: "REASON", b: "Dependencies • Conflicts • Next action", k: "reason", a: 0 },
  { t: "CONTROL", b: "Allow • Guide • Pause • Intervene", k: "control", a: Math.PI / 2 },
];

const loopPos = (a: number) => ({ x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a) });
const ORBIT = `M ${CX - RX} ${CY} a ${RX} ${RY} 0 1 1 ${RX * 2} 0 a ${RX} ${RY} 0 1 1 ${-RX * 2} 0`;

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

export function SystemArchitecture() {
  const [scenarioId, setScenarioId] = useState("dev");
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
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
    const id = window.setInterval(() => setI((n) => (n + 1) % scenario.frames.length), 3200);
    return () => window.clearInterval(id);
  }, [reduced, inView, scenario]);

  const frame = scenario.frames[i]!;
  const byId = (id: string) => scenario.agents.find((a) => a.id === id)!;
  const active = hover ? byId(hover) : null;

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
  const busy = (id: string) => (frame.busy ?? []).includes(id);

  const dependencyOf = (id: string) => {
    const link = scenario.links.find(([a, b]) => a === id || b === id);
    if (!link) return "none";
    const other = link[0] === id ? link[1] : link[0];
    return `${byId(other).label} → ${byId(other).task.toLowerCase()}`;
  };

  const stats = [
    `${scenario.agents.length} agents active`,
    `${frame.state.running} tasks running`,
    `${frame.state.deps} dependencies`,
    `${frame.state.approvals} approval pending`,
    "0 policy violations",
  ];

  return (
    <div ref={wrap} className="panel tech-frame relative overflow-hidden p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="label-mono">system architecture · live simulation</p>
        <div className="flex items-center gap-1 rounded-sm border border-border p-1">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScenarioId(s.id)}
              aria-pressed={s.id === scenarioId}
              className={cn(
                "rounded-[2px] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
                s.id === scenarioId ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`Sulcus architecture for a ${scenario.label} system: a human goal enters the Sulcus control plane, which continuously observes, validates, reasons and controls a network of autonomous agents communicating with each other and acting on real tools and systems.`}
        >
          <defs>
            <linearGradient id="sa-plane" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--surface-2)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--surface)" stopOpacity="0.8" />
            </linearGradient>
            <marker id="sa-tip" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L8 4 L0 8 z" fill="var(--border-strong)" />
            </marker>
          </defs>

          {/* human */}
          <rect x={CX - 210} y={8} width={420} height={46} rx={4} fill="var(--surface)" stroke="var(--border-strong)" />
          <text x={CX - 194} y={28} fontSize="9.5" letterSpacing="3" fontFamily="var(--font-mono)" fill="var(--primary)">
            HUMAN
          </text>
          <text x={CX - 194} y={44} fontSize="11" fontFamily="var(--font-mono)" fill="var(--foreground)">
            “{scenario.user}”
          </text>
          <text x={CX + 194} y={28} textAnchor="end" fontSize="8.5" letterSpacing="1.6" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            {scenario.intent}
          </text>
          <line x1={CX} y1={54} x2={CX} y2={76} stroke="var(--border-strong)" markerEnd="url(#sa-tip)" />

          {/* sulcus control plane */}
          <g onMouseEnter={() => setHoverSulcus(true)} onMouseLeave={() => setHoverSulcus(false)}>
            <rect
              x={24}
              y={78}
              width={W - 48}
              height={164}
              rx={8}
              fill="url(#sa-plane)"
              stroke={hoverSulcus ? "var(--primary)" : "var(--border-strong)"}
              strokeWidth={hoverSulcus ? 1.4 : 1}
              style={{ transition: "stroke 300ms ease" }}
            />
            <text x={44} y={100} fontSize="12" letterSpacing="4" fontFamily="var(--font-mono)" fill="var(--primary)">
              SULCUS
            </text>
            <text x={44} y={116} fontSize="8.5" letterSpacing="2.4" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
              CONTROL PLANE
            </text>

            {/* continuous loop orbit */}
            <path d={ORBIT} fill="none" stroke="var(--primary)" strokeOpacity={0.28} strokeDasharray="3 7" />
            {!reduced && (
              <circle r={3} fill="var(--primary)">
                <animateMotion dur="9s" repeatCount="indefinite" path={ORBIT} />
              </circle>
            )}

            {/* system state at loop centre */}
            <text x={CX} y={CY - 6} textAnchor="middle" fontSize="8.5" letterSpacing="2.4" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
              GLOBAL SYSTEM STATE
            </text>
            <text x={CX} y={CY + 10} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--foreground)">
              {frame.state.running} running · {frame.state.deps} deps · {frame.state.approvals} approval
            </text>
            <text x={CX} y={CY + 26} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
              {scenario.agents.length} agents · 0 policy violations
            </text>

            {LOOP.map((c) => {
              const { x, y } = loopPos(c.a);
              const on = frame.phase === c.k;
              const w = 188;
              const h = 52;
              return (
                <g key={c.t}>
                  <rect
                    x={x - w / 2}
                    y={y - h / 2}
                    width={w}
                    height={h}
                    rx={5}
                    fill={on ? "color-mix(in srgb, var(--primary) 9%, var(--surface-3))" : "var(--surface-3)"}
                    stroke={on ? "var(--primary)" : hoverSulcus ? "var(--border-strong)" : "var(--border)"}
                    style={{ transition: "fill 400ms ease, stroke 400ms ease" }}
                  />
                  <text x={x - w / 2 + 12} y={y - 6} fontSize="11" letterSpacing="2" fontFamily="var(--font-mono)" fill={on ? "var(--primary)" : "var(--foreground)"}>
                    {c.t}
                  </text>
                  <text x={x - w / 2 + 12} y={y + 12} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
                    {c.b}
                  </text>
                </g>
              );
            })}
          </g>

          {/* decision readout */}
          <rect x={24} y={250} width={W - 48} height={26} rx={4} fill="var(--surface-2)" stroke="var(--border)" />
          <circle cx={40} cy={263} r={3} fill="var(--primary)" className={reduced ? undefined : "anim-pulse-node"} />
          <text x={52} y={267} fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--foreground)">
            {frame.sulcus}
          </text>
          {frame.note && (
            <text x={W - 40} y={267} textAnchor="end" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
              {frame.note}
            </text>
          )}

          {/* control surface over the agent network */}
          <path
            d={`M 24 300 L 24 470 L ${W - 24} 470 L ${W - 24} 300`}
            fill="none"
            stroke="var(--primary)"
            strokeOpacity={hoverSulcus ? 0.5 : 0.16}
            strokeDasharray="2 6"
            style={{ transition: "stroke-opacity 300ms ease" }}
          />
          <text x={W - 34} y={296} textAnchor="end" fontSize="8.5" letterSpacing="2.4" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            CONTROL SURFACE · MULTI-AGENT SYSTEM
          </text>

          {/* sulcus ↕ agents */}
          {scenario.agents.map((a) => {
            const on = hoverSulcus || hover === a.id;
            return (
              <g key={`s-${a.id}`} opacity={dim(a.id) ? 0.18 : 1} style={{ transition: "opacity 300ms ease" }}>
                <line
                  x1={a.x - 14}
                  y1={278}
                  x2={a.x - 14}
                  y2={a.y}
                  stroke={on ? "var(--primary)" : "var(--border-strong)"}
                  className={on && !reduced ? "anim-flow" : undefined}
                  style={{ transition: "stroke 300ms ease" }}
                />
                <line
                  x1={a.x + 14}
                  y1={a.y}
                  x2={a.x + 14}
                  y2={278}
                  stroke={on ? "var(--primary)" : "var(--border)"}
                  strokeDasharray="2 4"
                  style={{ transition: "stroke 300ms ease" }}
                />
              </g>
            );
          })}

          {/* agent ↔ agent */}
          {scenario.links.map(([a, b]) => {
            const na = byId(a);
            const nb = byId(b);
            const mx = (na.x + nb.x) / 2;
            const y1 = na.y + AH;
            const y2 = nb.y + AH;
            const on = hover === a || hover === b;
            const carrying =
              !!frame.msg && ((frame.msg.from === a && frame.msg.to === b) || (frame.msg.from === b && frame.msg.to === a));
            const d = `M ${na.x + 26} ${y1} C ${mx} ${Math.max(y1, y2) + 46}, ${mx} ${Math.max(y1, y2) + 46}, ${nb.x - 26} ${y2}`;
            return (
              <g key={`${a}-${b}`}>
                <path
                  d={d}
                  fill="none"
                  stroke={on || carrying ? "var(--signal)" : "var(--border-strong)"}
                  strokeWidth={on || carrying ? 1.3 : 1}
                  strokeDasharray="4 5"
                  opacity={hover && !on ? 0.14 : 0.8}
                  className={carrying && !reduced ? "anim-flow" : undefined}
                  style={{ transition: "opacity 300ms ease, stroke 300ms ease" }}
                />
                {carrying && !reduced && (
                  <circle key={`p-${i}`} r={3} fill="var(--signal)">
                    <animateMotion dur="2.4s" repeatCount="indefinite" path={d} />
                  </circle>
                )}
              </g>
            );
          })}

          {/* message label */}
          {frame.msg && (
            <g key={`m-${i}`} className={reduced ? undefined : "animate-fade-in"}>
              {(() => {
                const na = byId(frame.msg.from);
                const nb = byId(frame.msg.to);
                const mx = (na.x + nb.x) / 2;
                const label = `${na.label} → ${nb.label}: “${frame.msg.text}”`;
                const w = label.length * 5.4 + 20;
                const y = Math.max(na.y, nb.y) + AH + 34;
                return (
                  <>
                    <rect x={mx - w / 2} y={y} width={w} height={20} rx={3} fill="var(--surface-2)" stroke="var(--signal)" strokeOpacity={0.5} />
                    <text x={mx} y={y + 14} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--foreground)">
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
            const status = frame.status[a.id] ?? "idle";
            const waiting = /wait|hold|approval|pending|blocked/i.test(status);
            return (
              <g
                key={a.id}
                onMouseEnter={() => setHover(a.id)}
                onMouseLeave={() => setHover(null)}
                className="cursor-pointer"
                opacity={dim(a.id) ? 0.26 : 1}
                style={{ transition: "opacity 300ms ease" }}
              >
                <rect
                  x={a.x - AW / 2}
                  y={a.y}
                  width={AW}
                  height={AH}
                  rx={4}
                  fill="var(--surface)"
                  stroke={on ? "var(--primary)" : "var(--border-strong)"}
                  strokeWidth={on ? 1.4 : 1}
                  style={{ transition: "stroke 300ms ease" }}
                />
                <circle
                  cx={a.x - AW / 2 + 14}
                  cy={a.y + 17}
                  r={3}
                  fill={waiting ? "var(--signal)" : busy(a.id) ? "var(--primary)" : "var(--muted-foreground)"}
                  className={busy(a.id) && !reduced ? "anim-pulse-node" : undefined}
                />
                <text x={a.x - AW / 2 + 26} y={a.y + 20} fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--foreground)">
                  {a.label}
                </text>
                <text x={a.x - AW / 2 + 12} y={a.y + 36} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
                  {a.role}
                </text>
                <line x1={a.x - AW / 2 + 12} y1={a.y + 43} x2={a.x + AW / 2 - 12} y2={a.y + 43} stroke="var(--border)" />
                <text
                  x={a.x - AW / 2 + 12}
                  y={a.y + 57}
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  fill={waiting ? "var(--signal)" : "var(--foreground)"}
                >
                  → {status.length > 26 ? `${status.slice(0, 25)}…` : status}
                </text>
              </g>
            );
          })}

          {/* agents → tools */}
          {scenario.agents.map((a) => (
            <line
              key={`t-${a.id}`}
              x1={a.x}
              y1={a.y + AH + 52}
              x2={a.x}
              y2={520}
              stroke="var(--border)"
              opacity={dim(a.id) ? 0.14 : 0.7}
              markerEnd="url(#sa-tip)"
              style={{ transition: "opacity 300ms ease" }}
            />
          ))}

          {/* tools & systems */}
          <rect x={20} y={498} width={168} height={16} fill="var(--surface)" />
          <text x={24} y={510} fontSize="9" letterSpacing="2.4" fontFamily="var(--font-mono)" fill="var(--foreground)">
            TOOLS &amp; SYSTEMS
          </text>
          <rect x={24} y={524} width={W - 48} height={60} rx={6} fill="var(--surface)" stroke="var(--border)" />
          {scenario.tools.map((t, n) => {
            const w = (W - 48 - 28 - 6 * 10) / 7;
            const x = 38 + n * (w + 10);
            return (
              <g key={t}>
                <rect x={x} y={538} width={w} height={32} rx={3} fill="var(--surface-2)" stroke="var(--border)" />
                <text x={x + w / 2} y={558} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
                  {t}
                </text>
              </g>
            );
          })}

          {/* feedback: tools/agents → sulcus */}
          <path
            d={`M ${W - 24} 554 L ${W - 8} 554 L ${W - 8} 160 L ${W - 24} 160`}
            fill="none"
            stroke="var(--primary)"
            strokeOpacity={0.35}
            strokeDasharray="3 5"
            markerEnd="url(#sa-tip)"
            className={reduced ? undefined : "anim-flow"}
          />
          <text x={W - 14} y={360} textAnchor="middle" fontSize="8" letterSpacing="2" fontFamily="var(--font-mono)" fill="var(--muted-foreground)" transform={`rotate(90 ${W - 14} 360)`}>
            EVENTS • STATE • OUTPUTS
          </text>
        </svg>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        <div className="rounded-sm border border-border-strong bg-surface p-3">
          <p className="label-mono text-primary">HUMAN</p>
          <p className="mt-1 font-mono text-[10.5px] text-foreground">“{scenario.user}”</p>
          <p className="mt-1 font-mono text-[9px] text-muted-foreground">{scenario.intent}</p>
        </div>
        <Arrow />
        <div className="rounded-md border border-border-strong bg-surface-2 p-3">
          <p className="font-mono text-xs tracking-[0.24em] text-primary">SULCUS</p>
          <p className="font-mono text-[9px] tracking-[0.18em] text-muted-foreground">CONTROL PLANE</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {LOOP.map((c) => (
              <div
                key={c.t}
                className={cn(
                  "rounded-sm border p-2 transition-colors",
                  frame.phase === c.k ? "border-primary/70 bg-primary/[0.07]" : "border-border bg-surface-3",
                )}
              >
                <p className="font-mono text-[10.5px] tracking-[0.12em]">{c.t}</p>
                <p className="mt-1 font-mono text-[8.5px] leading-relaxed text-muted-foreground">{c.b}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-[9px] text-muted-foreground">
            {frame.state.running} running · {frame.state.deps} deps · {frame.state.approvals} approval · 0 violations
          </p>
          <div className="mt-2 flex items-start gap-2 rounded-sm border border-border bg-surface px-2 py-2">
            <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary", !reduced && "anim-pulse-node")} />
            <p className="font-mono text-[9.5px] leading-relaxed text-foreground">{frame.sulcus}</p>
          </div>
        </div>
        <Arrow bidirectional />
        <div className="rounded-md border border-dashed border-primary/30 p-2">
          <p className="label-mono">control surface · multi-agent system</p>
          <div className="mt-2 space-y-2">
            {scenario.agents.map((a, n) => {
              const status = frame.status[a.id] ?? "idle";
              const waiting = /wait|hold|approval|pending|blocked/i.test(status);
              return (
                <div key={a.id}>
                  <div className="rounded-sm border border-border-strong bg-surface-2 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          waiting || busy(a.id) ? "bg-primary" : "bg-muted-foreground",
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
                  {frame.msg?.from === a.id && (
                    <p className="ml-3 mt-1 font-mono text-[8.5px] text-primary">
                      ↳ {byId(frame.msg.to).label}: “{frame.msg.text}”
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
          <p className="label-mono">tools &amp; systems</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {scenario.tools.map((t) => (
              <span key={t} className="rounded-sm border border-border bg-surface-2 px-2 py-1 font-mono text-[9.5px] text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {frame.approval && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-sm border border-primary/50 bg-primary/[0.06] px-4 py-3">
          <span className="font-mono text-[10px] tracking-[0.18em] text-primary">APPROVAL REQUIRED</span>
          <span className="font-mono text-[11px] text-foreground">{frame.sulcus}</span>
          <span className="ml-auto flex gap-2">
            <span className="rounded-sm border border-primary/60 px-2 py-1 font-mono text-[10px] text-primary">Approve</span>
            <span className="rounded-sm border border-border px-2 py-1 font-mono text-[10px] text-muted-foreground">Reject</span>
          </span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4 border-t border-border pt-3">
        <div className="min-h-[52px] font-mono text-[11px]">
          {active ? (
            <>
              <p className="text-primary">{active.label}</p>
              <p className="text-muted-foreground">
                task: {active.task} · status: {frame.status[active.id] ?? "idle"}
              </p>
              <p className="text-muted-foreground">
                dependency: {dependencyOf(active.id)} · sulcus: {frame.sulcus}
              </p>
            </>
          ) : hoverSulcus ? (
            <>
              <p className="text-primary">GLOBAL SYSTEM STATE</p>
              <p className="text-muted-foreground">{stats.join(" · ")}</p>
              <p className="text-muted-foreground">observing every agent, message, dependency and tool call</p>
            </>
          ) : (
            <p className="text-muted-foreground">hover an agent or the control plane · simulated telemetry</p>
          )}
        </div>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {scenario.frames.map((_, n) => (
            <span key={n} className={cn("h-1 w-5 rounded-full transition-colors", n === i ? "bg-primary" : "bg-border")} />
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
