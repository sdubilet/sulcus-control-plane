import { useEffect, useState } from "react";
import { Section, Headline, Reveal, useInView } from "./primitives";

const CODE = `paused = loop.run(
    [{"role": "user", "content": "Publish the report."}],
    tool_permission_policy=ToolPermissionPolicy(
        default_allow=False,
        allowed_tools={"publish_report"},
    ),
    tool_resource_limits=ToolResourceLimits(
        max_tool_calls_per_loop=1,
    ),
    require_tool_approval=True,
)
assert paused.reason == "approval_required"
assert executions == []  # The callable has not run.

# Your application supplies the decision.
result = loop.resume(
    checkpoint=paused.checkpoint,
    approval_decisions=[
        ToolApprovalDecision("publish-1", approved=True),
    ],
)`;

function useTypewriter(text: string, active: boolean, speed = 6) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!active) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, active, speed]);
  return out;
}

export function CodeDemo() {
  const { ref, visible } = useInView<HTMLDivElement>(0.2);
  const typed = useTypewriter(CODE, visible);

  return (
    <Section id="developers" index="06" label="Try the code">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <Reveal>
            <Headline>
              Ask. Check.
              <br />
              Approve. Execute.
            </Headline>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              A registered <code className="font-mono text-foreground">publish_report</code> tool
              stays uncalled until the application approves it. This example uses a scripted
              provider and simulates publication in memory.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              The excerpt uses a configured{" "}
              <code className="font-mono text-foreground">AgentToolLoop</code>. The complete file
              includes public imports, tool registration, the provider, and assertions. No API key
              or Rust dependency is required.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <a
              href="/approval_demo.py"
              download
              className="mt-8 inline-flex items-center gap-2 text-base text-primary transition-opacity hover:opacity-80"
            >
              Download the complete Python example ↓
            </a>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-8 border-t border-border pt-8">
              <p className="label-mono">With Sulcus installed</p>
              <p className="mt-4 font-mono text-sm text-foreground">python approval_demo.py</p>
              <a
                href="https://github.com/ElarizT/Sulcus#installation"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-base text-muted-foreground transition-colors hover:text-primary"
              >
                Source installation instructions ↗
              </a>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground/70">
                Verified against development revision 1070b5e (1.0.0rc1). The approval decision is
                supplied by application code, not an authenticated approval service.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <div
            ref={ref}
            className="panel tech-frame scanlines overflow-hidden"
            style={{ boxShadow: "var(--shadow-panel)" }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
              <span className="label-mono">approval_demo.py / excerpt</span>
              <span className="label-mono text-primary">public APIs</span>
            </div>
            <pre className="relative z-10 min-h-[420px] overflow-x-auto p-6 font-mono text-[13px] leading-relaxed text-foreground/90">
              <code>
                {typed}
                <span
                  className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-primary"
                  style={{ animation: "sulcus-caret 1s steps(1) infinite" }}
                />
              </code>
            </pre>
            <div className="border-t border-border px-5 py-5">
              <p className="label-mono">Expected output / offline demo</p>
              <p className="mt-3 font-mono text-[13px] text-foreground/85">
                Before approval: 0 tool executions
              </p>
              <p className="mt-1.5 font-mono text-[13px] text-primary">
                After approval: 1 simulated publication
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
