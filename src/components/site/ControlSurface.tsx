import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "./primitives";

/* ---------------------------------- types --------------------------------- */

type AgentStatus = "running" | "paused" | "restricted" | "stopped" | "awaiting";

type Agent = {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  task: string;
  action: string;
  tools: string[];
  tokens: number;
  spend: number;
  elapsed: number;
  budget: number;
};

type Verdict = "allowed" | "validated" | "paused" | "denied" | "approved" | "info";

type ActivityEvent = {
  id: number;
  t: number;
  actor: string;
  text: string;
  verdict: Verdict;
};

type Approval = {
  id: number;
  agent: string;
  request: string;
  risk: "HIGH" | "MEDIUM" | "LOW";
};

type Permission = {
  scope: string;
  level: string;
  state: "allowed" | "readonly" | "denied" | "approval";
};

type SecurityPhase = "idle" | "requested" | "validating" | "denied";

type State = {
  agents: Agent[];
  events: ActivityEvent[];
  approvals: Approval[];
  permissions: Permission[];
  security: { phase: SecurityPhase; agent: string; resource: string; scope: string; risk: string };
  clock: number;
  seq: number;
  tokenCap: number;
  spendCap: number;
};

/* ------------------------------- initial data ------------------------------ */

const AGENTS: Agent[] = [
  {
    id: "claude",
    name: "CLAUDE CODE",
    role: "Implementation",
    status: "running",
    task: "Implement checkout flow",
    action: "Editing checkout.tsx",
    tools: ["GitHub", "Terminal", "Browser"],
    tokens: 84_000,
    spend: 8.42,
    elapsed: 1122,
    budget: 61,
  },
  {
    id: "codex",
    name: "CODEX",
    role: "Verification",
    status: "running",
    task: "Regression suite · payments",
    action: "Executing test suite",
    tools: ["Terminal", "CI", "GitHub"],
    tokens: 61_800,
    spend: 6.18,
    elapsed: 903,
    budget: 72,
  },
  {
    id: "kimi",
    name: "KIMI",
    role: "Integration",
    status: "running",
    task: "Sync tax rates provider",
    action: "Requesting external API",
    tools: ["HTTP", "Secrets vault"],
    tokens: 43_700,
    spend: 4.37,
    elapsed: 640,
    budget: 44,
  },
  {
    id: "research",
    name: "RESEARCH",
    role: "Context",
    status: "running",
    task: "Compare payment providers",
    action: "Reading 12 sources",
    tools: ["Browser", "Files"],
    tokens: 32_100,
    spend: 3.21,
    elapsed: 512,
    budget: 29,
  },
  {
    id: "purchasing",
    name: "PURCHASING",
    role: "Operations",
    status: "awaiting",
    task: "Restock supplier order",
    action: "Awaiting authorization",
    tools: ["ERP", "Email"],
    tokens: 20_000,
    spend: 2.0,
    elapsed: 388,
    budget: 18,
  },
];

const PERMISSIONS: Permission[] = [
  { scope: "GitHub", level: "READ / WRITE", state: "allowed" },
  { scope: "Production", level: "READ ONLY", state: "readonly" },
  { scope: "Customer data", level: "DENIED", state: "denied" },
  { scope: "Payments", level: "APPROVAL REQUIRED", state: "approval" },
  { scope: "Terminal", level: "READ / WRITE", state: "allowed" },
  { scope: "Secrets vault", level: "APPROVAL REQUIRED", state: "approval" },
];

const initial: State = {
  agents: AGENTS,
  events: [],
  approvals: [
    { id: 1, agent: "CODEX", request: "Deploy to production", risk: "HIGH" },
    { id: 2, agent: "PURCHASING", request: "Approve $2,400 supplier order", risk: "MEDIUM" },
  ],
  permissions: PERMISSIONS,
  security: {
    phase: "idle",
    agent: "CODEX",
    resource: "Production database",
    scope: "READ / WRITE",
    risk: "HIGH",
  },
  clock: 52_328, // 14:32:08
  seq: 100,
  tokenCap: 2_500_000,
  spendCap: 50,
};

const SCRIPT: Array<{ actor: string; text: string; verdict: Verdict }> = [
  { actor: "CLAUDE CODE", text: "Modified checkout.tsx", verdict: "allowed" },
  { actor: "CODEX", text: "Executed test suite", verdict: "allowed" },
  { actor: "KIMI", text: "Requested external API", verdict: "allowed" },
  { actor: "RESEARCH", text: "Indexed 12 sources", verdict: "allowed" },
  { actor: "CODEX", text: "Attempted production write", verdict: "denied" },
  { actor: "SULCUS", text: "Policy boundary enforced", verdict: "denied" },
  { actor: "CLAUDE CODE", text: "Attempted production deployment", verdict: "permission" },
  { actor: "SULCUS", text: "Approval required", verdict: "permission" },
  { actor: "KIMI", text: "Token budget threshold 82%", verdict: "allowed" },
  { actor: "CLAUDE CODE", text: "Committed 3 files", verdict: "allowed" },
];

/* --------------------------------- reducer -------------------------------- */

type Action =
  | { type: "tick" }
  | { type: "log"; actor: string; text: string; verdict: Verdict }
  | { type: "agent"; id: string; status: AgentStatus }
  | { type: "resolveApproval"; id: number; approve: boolean }
  | { type: "security"; phase: SecurityPhase }
  | { type: "grant"; id: string };

let scriptIdx = 0;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "tick": {
      const clock = state.clock + 3;
      const agents = state.agents.map((a) =>
        a.status === "running"
          ? {
              ...a,
              tokens: a.tokens + 300 + Math.round(Math.random() * 700),
              spend: a.spend + 0.03,
              elapsed: a.elapsed + 3,
              budget: Math.min(99, a.budget + (a.id === "codex" ? 0.6 : 0.2)),
            }
          : a,
      );
      const next = SCRIPT[scriptIdx % SCRIPT.length]!;
      scriptIdx += 1;
      const ev: ActivityEvent = { id: state.seq, t: clock, ...next };
      return {
        ...state,
        clock,
        agents,
        seq: state.seq + 1,
        events: [ev, ...state.events].slice(0, 9),
      };
    }
    case "log": {
      const ev: ActivityEvent = {
        id: state.seq,
        t: state.clock,
        actor: action.actor,
        text: action.text,
        verdict: action.verdict,
      };
      return { ...state, seq: state.seq + 1, events: [ev, ...state.events].slice(0, 9) };
    }
    case "agent":
      return {
        ...state,
        agents: state.agents.map((a) => (a.id === action.id ? { ...a, status: action.status } : a)),
      };
    case "grant":
      return {
        ...state,
        agents: state.agents.map((a) =>
          a.id === action.id ? { ...a, budget: Math.max(10, a.budget - 12) } : a,
        ),
      };
    case "resolveApproval":
      return { ...state, approvals: state.approvals.filter((a) => a.id !== action.id) };
    case "security":
      return { ...state, security: { ...state.security, phase: action.phase } };
    default:
      return state;
  }
}

/* --------------------------------- helpers -------------------------------- */

const pad = (n: number) => String(n).padStart(2, "0");
const clockStr = (s: number) => `${pad(Math.floor(s / 3600) % 24)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
const elapsedStr = (s: number) => `${Math.floor(s / 60)}m ${pad(s % 60)}s`;

const verdictClass: Record<Verdict, string> = {
  allowed: "text-ok",
  validated: "text-primary",
  paused: "text-warn",
  denied: "text-danger",
  approved: "text-ok",
  info: "text-primary",
};

const statusLabel: Record<AgentStatus, string> = {
  running: "RUNNING",
  paused: "PAUSED BY OPERATOR",
  restricted: "RESTRICTED SCOPE",
  stopped: "STOPPED",
  awaiting: "AWAITING APPROVAL",
};

const statusClass: Record<AgentStatus, string> = {
  running: "text-ok",
  paused: "text-warn",
  restricted: "text-warn",
  stopped: "text-danger",
  awaiting: "text-warn",
};

function Meter({ value, tone = "primary" }: { value: number; tone?: "primary" | "warn" | "ok" }) {
  const blocks = 16;
  const filled = Math.round((Math.min(100, value) / 100) * blocks);
  return (
    <span
      className={cn(
        "font-mono text-[13px] leading-none tracking-[0.08em]",
        tone === "warn" ? "text-warn" : tone === "ok" ? "text-ok" : "text-primary",
      )}
      aria-hidden="true"
    >
      {"█".repeat(filled)}
      <span className="text-border-strong">{"░".repeat(blocks - filled)}</span>
    </span>
  );
}

function Cell({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex flex-col gap-1.5 border-border px-4 py-3.5 sm:border-r last:sm:border-r-0">
      <span className="label-mono text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-sm text-foreground", tone)}>{value}</span>
    </div>
  );
}

function Btn({
  children,
  onClick,
  tone = "default",
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "default" | "ok" | "danger" | "warn";
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "label-mono rounded-sm border px-3 py-1.5 transition-colors",
        "border-border-strong text-muted-foreground hover:border-primary hover:text-primary",
        tone === "ok" && "hover:border-ok hover:text-ok",
        tone === "danger" && "hover:border-danger hover:text-danger",
        tone === "warn" && "hover:border-warn hover:text-warn",
        active && "border-primary bg-primary/10 text-primary",
      )}
    >
      {children}
    </button>
  );
}

/* -------------------------------- component ------------------------------- */

const TABS = ["ACTIVITY", "AGENTS", "BUDGET", "SECURITY", "APPROVALS"] as const;
type Tab = (typeof TABS)[number];

export function ControlSurface() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [tab, setTab] = useState<Tab>("ACTIVITY");
  const [selected, setSelected] = useState("claude");
  const { ref, visible } = useInView<HTMLDivElement>(0.15);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const on = () => setReduced(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    dispatch({ type: "tick" });
    dispatch({ type: "tick" });
    dispatch({ type: "tick" });
  }, []);

  useEffect(() => {
    if (!visible || reduced) return;
    const id = setInterval(() => dispatch({ type: "tick" }), 2600);
    return () => clearInterval(id);
  }, [visible, reduced]);

  const agent = useMemo(
    () => state.agents.find((a) => a.id === selected) ?? state.agents[0]!,
    [state.agents, selected],
  );

  const totals = useMemo(() => {
    const tokens = state.agents.reduce((s, a) => s + a.tokens, 0) + 1_580_000;
    const spend = state.agents.reduce((s, a) => s + a.spend, 0);
    const active = state.agents.filter((a) => a.status === "running").length;
    return { tokens, spend, active };
  }, [state.agents]);

  const runSecurity = useCallback(() => {
    dispatch({ type: "security", phase: "requested" });
    dispatch({ type: "log", actor: "CODEX", text: "Requested production database write", verdict: "allowed" });
    setTimeout(() => dispatch({ type: "security", phase: "validating" }), 900);
    setTimeout(() => {
      dispatch({ type: "security", phase: "denied" });
      dispatch({ type: "log", actor: "SULCUS", text: "Production write denied by policy", verdict: "denied" });
    }, 2000);
  }, []);

  return (
    <div ref={ref} className="panel tech-frame overflow-hidden">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="label-mono text-primary">SULCUS CONTROL</span>
          <span className="h-px w-6 bg-border-strong" />
          <span className="label-mono text-muted-foreground">SYSTEM STATUS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 rounded-full bg-ok", !reduced && "anim-pulse-node")} />
          <span className="label-mono text-ok">OPERATIONAL</span>
          <span className="label-mono ml-3 text-muted-foreground">{clockStr(state.clock)}</span>
        </div>
      </div>

      {/* summary strip */}
      <div className="grid grid-cols-2 divide-y divide-border border-b border-border sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-6">
        <Cell label="AGENTS" value={`${pad(totals.active)} ACTIVE`} />
        <Cell label="TASKS" value="17 RUNNING" />
        <Cell label="TOKENS" value={`${(totals.tokens / 1_000_000).toFixed(2)}M USED`} />
        <Cell label="SPEND" value={`$${totals.spend.toFixed(2)}`} />
        <Cell
          label="APPROVALS"
          value={state.approvals.length ? `${pad(state.approvals.length)} PENDING` : "NONE"}
          tone={state.approvals.length ? "text-warn" : "text-ok"}
        />
        <Cell
          label="SECURITY"
          value={state.security.phase === "denied" ? "1 BLOCKED" : "ALL CLEAR"}
          tone={state.security.phase === "denied" ? "text-danger" : "text-ok"}
        />
      </div>

      {/* tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border px-4 py-3">
        {TABS.map((t) => (
          <Btn key={t} active={tab === t} onClick={() => setTab(t)}>
            {t}
          </Btn>
        ))}
      </div>

      {/* body */}
      <div className="min-h-[420px] bg-surface/40 scanlines">
        <div className="relative z-10 p-4 md:p-6">
          {tab === "ACTIVITY" && (
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <span className="label-mono text-muted-foreground">EXECUTION STREAM</span>
                <ul className="mt-4 space-y-0 font-mono text-xs">
                  {state.events.map((e, idx) => (
                    <li
                      key={e.id}
                      className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border/60 py-2.5 transition-opacity duration-700"
                      style={{ opacity: 1 - idx * 0.07 }}
                    >
                      <span className="w-16 shrink-0 text-muted-foreground">{clockStr(e.t)}</span>
                      <span className="w-32 shrink-0 text-foreground/80">{e.actor}</span>
                      <span className="flex-1 text-muted-foreground">{e.text}</span>
                      <span className={cn("label-mono", verdictClass[e.verdict])}>→ {e.verdict}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <span className="label-mono text-muted-foreground">SUPERVISED AGENTS</span>
                {state.agents.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setSelected(a.id);
                      setTab("AGENTS");
                    }}
                    className="flex w-full items-center justify-between rounded-sm border border-border bg-surface-2/60 px-3 py-2.5 text-left transition-colors hover:border-primary/60"
                  >
                    <span className="font-mono text-xs text-foreground/85">{a.name}</span>
                    <span className={cn("label-mono", statusClass[a.status])}>{statusLabel[a.status]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "AGENTS" && (
            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
              <div className="space-y-2">
                {state.agents.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelected(a.id)}
                    className={cn(
                      "block w-full rounded-sm border px-3 py-2.5 text-left font-mono text-xs transition-colors",
                      a.id === selected
                        ? "border-primary/70 bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-border-strong",
                    )}
                  >
                    {a.name}
                    <span className="mt-1 block label-mono text-muted-foreground">{a.role}</span>
                  </button>
                ))}
              </div>

              <div className="rounded-sm border border-border bg-surface-2/40">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="font-mono text-sm text-foreground">{agent.name}</span>
                  <span className={cn("label-mono", statusClass[agent.status])}>{statusLabel[agent.status]}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-4 px-4 py-4 md:grid-cols-3">
                  <Field label="CURRENT TASK" value={agent.task} />
                  <Field label="CURRENT ACTION" value={agent.action} />
                  <Field label="TOOLS" value={agent.tools.join(" · ")} />
                  <Field label="TOKENS" value={`${Math.round(agent.tokens / 1000)}K`} />
                  <Field label="SPEND" value={`$${agent.spend.toFixed(2)}`} />
                  <Field label="ELAPSED" value={elapsedStr(agent.elapsed)} />
                </div>
                <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
                  <Btn
                    tone="warn"
                    onClick={() => {
                      dispatch({ type: "agent", id: agent.id, status: "paused" });
                      dispatch({ type: "log", actor: "OPERATOR", text: `Paused ${agent.name}`, verdict: "permission" });
                    }}
                  >
                    PAUSE
                  </Btn>
                  <Btn
                    tone="ok"
                    onClick={() => {
                      dispatch({ type: "agent", id: agent.id, status: "running" });
                      dispatch({ type: "log", actor: "OPERATOR", text: `Resumed ${agent.name}`, verdict: "allowed" });
                    }}
                  >
                    RESUME
                  </Btn>
                  <Btn
                    tone="danger"
                    onClick={() => {
                      dispatch({ type: "agent", id: agent.id, status: "stopped" });
                      dispatch({ type: "log", actor: "OPERATOR", text: `Stopped ${agent.name}`, verdict: "denied" });
                    }}
                  >
                    STOP
                  </Btn>
                  <Btn
                    onClick={() => {
                      dispatch({ type: "agent", id: agent.id, status: "restricted" });
                      dispatch({
                        type: "log",
                        actor: "SULCUS",
                        text: `${agent.name} scope restricted to read-only`,
                        verdict: "permission",
                      });
                    }}
                  >
                    RESTRICT
                  </Btn>
                </div>
              </div>
            </div>
          )}

          {tab === "BUDGET" && (
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-6">
                <div>
                  <span className="label-mono text-muted-foreground">TOKEN BUDGET · PROJECT</span>
                  <div className="mt-3 flex items-center gap-4">
                    <Meter value={(totals.tokens / state.tokenCap) * 100} />
                    <span className="font-mono text-xs text-muted-foreground">
                      {(totals.tokens / 1_000_000).toFixed(2)}M / 2.50M
                    </span>
                  </div>
                </div>
                <div>
                  <span className="label-mono text-muted-foreground">SPEND · TODAY</span>
                  <div className="mt-3 flex items-center gap-4">
                    <Meter value={(totals.spend / state.spendCap) * 100} tone="ok" />
                    <span className="font-mono text-xs text-muted-foreground">
                      ${totals.spend.toFixed(2)} / $50.00
                    </span>
                  </div>
                </div>
                <div>
                  <span className="label-mono text-muted-foreground">ALLOCATION BY AGENT</span>
                  <ul className="mt-3 space-y-2 font-mono text-xs">
                    {state.agents.map((a) => (
                      <li key={a.id} className="flex items-center justify-between border-b border-border/60 py-2">
                        <span className="text-foreground/80">{a.name}</span>
                        <span className="text-muted-foreground">${a.spend.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-sm border border-warn/50 bg-warn/[0.04] p-4">
                <span className="label-mono text-warn">BUDGET THRESHOLD REACHED</span>
                <p className="mt-3 font-mono text-sm text-foreground">CODEX</p>
                <div className="mt-3 flex items-center gap-4">
                  <Meter value={state.agents.find((a) => a.id === "codex")?.budget ?? 82} tone="warn" />
                  <span className="font-mono text-xs text-warn">
                    {Math.round(state.agents.find((a) => a.id === "codex")?.budget ?? 82)}% consumed
                  </span>
                </div>
                <p className="mt-4 font-mono text-xs leading-relaxed text-muted-foreground">
                  sulcus · agent has consumed its allocated share of the project budget. Execution continues only
                  under an operator decision.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Btn
                    tone="ok"
                    onClick={() => {
                      dispatch({ type: "grant", id: "codex" });
                      dispatch({ type: "log", actor: "OPERATOR", text: "Granted CODEX +10% budget", verdict: "allowed" });
                    }}
                  >
                    ALLOW +10%
                  </Btn>
                  <Btn
                    tone="warn"
                    onClick={() => {
                      dispatch({ type: "agent", id: "codex", status: "paused" });
                      dispatch({ type: "log", actor: "SULCUS", text: "CODEX paused at budget limit", verdict: "permission" });
                    }}
                  >
                    PAUSE AGENT
                  </Btn>
                  <Btn
                    tone="danger"
                    onClick={() => {
                      dispatch({ type: "agent", id: "codex", status: "stopped" });
                      dispatch({ type: "log", actor: "SULCUS", text: "CODEX stopped at budget limit", verdict: "denied" });
                    }}
                  >
                    STOP
                  </Btn>
                </div>
              </div>
            </div>
          )}

          {tab === "SECURITY" && (
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
              <div>
                <span className="label-mono text-muted-foreground">PERMISSION BOUNDARY</span>
                <ul className="mt-3 font-mono text-xs">
                  {state.permissions.map((p) => (
                    <li key={p.scope} className="flex items-center justify-between border-b border-border/60 py-2.5">
                      <span className="text-foreground/85">{p.scope}</span>
                      <span
                        className={cn(
                          "label-mono",
                          p.state === "allowed" && "text-ok",
                          p.state === "readonly" && "text-primary",
                          p.state === "denied" && "text-danger",
                          p.state === "approval" && "text-warn",
                        )}
                      >
                        {p.level}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-sm border border-border bg-surface-2/40 p-4">
                <span className="label-mono text-muted-foreground">ACCESS REQUEST</span>
                <div className="mt-3 space-y-2 font-mono text-xs">
                  <Row k="AGENT" v={state.security.agent} />
                  <Row k="RESOURCE" v={state.security.resource} />
                  <Row k="SCOPE" v={state.security.scope} />
                  <Row k="RISK" v={state.security.risk} tone="text-danger" />
                  <Row
                    k="STATE"
                    v={
                      state.security.phase === "idle"
                        ? "no open request"
                        : state.security.phase === "requested"
                          ? "requested"
                          : state.security.phase === "validating"
                            ? "validating against policy…"
                            : "DENIED"
                    }
                    tone={
                      state.security.phase === "denied"
                        ? "text-danger"
                        : state.security.phase === "validating"
                          ? "text-warn"
                          : "text-primary"
                    }
                  />
                </div>
                {state.security.phase === "denied" && (
                  <p className="mt-4 border-l-2 border-danger pl-3 font-mono text-xs leading-relaxed text-muted-foreground">
                    "Agent does not have permission to modify production data."
                  </p>
                )}
                <div className="mt-4">
                  <Btn onClick={runSecurity}>SIMULATE REQUEST</Btn>
                </div>
              </div>
            </div>
          )}

          {tab === "APPROVALS" && (
            <div>
              <span className="label-mono text-muted-foreground">PENDING APPROVALS</span>
              <ul className="mt-4 space-y-3">
                {state.approvals.map((a, i) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-border bg-surface-2/40 px-4 py-4"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-xs text-muted-foreground">{pad(i + 1)}</span>
                      <div>
                        <p className="font-mono text-sm text-foreground">{a.agent}</p>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">{a.request}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("label-mono", a.risk === "HIGH" ? "text-danger" : "text-warn")}>
                        {a.risk} RISK
                      </span>
                      <Btn
                        tone="ok"
                        onClick={() => {
                          dispatch({ type: "resolveApproval", id: a.id, approve: true });
                          dispatch({ type: "log", actor: "USER", text: `Approved · ${a.request}`, verdict: "allowed" });
                          dispatch({ type: "log", actor: "SULCUS", text: "Execution resumed under approval", verdict: "permission" });
                        }}
                      >
                        APPROVE
                      </Btn>
                      <Btn
                        tone="danger"
                        onClick={() => {
                          dispatch({ type: "resolveApproval", id: a.id, approve: false });
                          dispatch({ type: "log", actor: "USER", text: `Rejected · ${a.request}`, verdict: "denied" });
                        }}
                      >
                        REJECT
                      </Btn>
                    </div>
                  </li>
                ))}
                {state.approvals.length === 0 && (
                  <li className="rounded-sm border border-border bg-surface-2/40 px-4 py-6 font-mono text-xs text-muted-foreground">
                    queue empty · agents continue autonomously. Sulcus will interrupt you only when a decision requires
                    human authority.
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* footer legend */}
      <div className="grid grid-cols-2 divide-border border-t border-border md:grid-cols-5 md:divide-x">
        {[
          ["OBSERVE", "See what every agent is doing."],
          ["CONTROL", "Pause, resume, stop or redirect."],
          ["BUDGET", "Enforce token and spend limits."],
          ["SECURITY", "Bound tools, data and permissions."],
          ["APPROVALS", "Require human authorization."],
        ].map(([k, v]) => (
          <div key={k} className="px-4 py-3.5">
            <span className="label-mono text-primary">{k}</span>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="pr-4">
      <span className="label-mono text-muted-foreground">{label}</span>
      <p className="mt-1.5 font-mono text-xs text-foreground/90">{value}</p>
    </div>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/60 py-2">
      <span className="label-mono text-muted-foreground">{k}</span>
      <span className={cn("text-foreground/90", tone)}>{v}</span>
    </div>
  );
}
