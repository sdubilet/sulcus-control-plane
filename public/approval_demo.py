"""approval_demo.py — Sulcus tool-approval example.

A registered `publish_report` tool stays uncalled until the application
approves it. This example uses a scripted provider and simulates
publication in memory. No API key or Rust dependency is required.

Run:  python approval_demo.py
"""

from sulcus import (
    AgentToolLoop,
    ScriptedProvider,
    ToolApprovalDecision,
    ToolPermissionPolicy,
    ToolResourceLimits,
)

executions: list[dict] = []


def publish_report(title: str) -> dict:
    """Simulated publication — appends to an in-memory list."""
    record = {"title": title, "status": "published"}
    executions.append(record)
    return record


provider = ScriptedProvider(
    [
        {"tool_call": {"id": "publish-1", "name": "publish_report",
                       "arguments": {"title": "Q3 report"}}},
        {"content": "The report has been published."},
    ]
)

loop = AgentToolLoop(provider=provider, tools={"publish_report": publish_report})

paused = loop.run(
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
)

print("Before approval: 0 tool executions")
print(f"After approval: {len(executions)} simulated publication")
