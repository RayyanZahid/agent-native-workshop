"""Workshop-only checks, run by scripts/verify.py after the general ones.

verify.py is copied unchanged from agent-native-kit; checks that only make
sense for this workshop live here.
"""
import json


def checks(v):
    # The workshop's own checker is the tool attendees' agents call after every
    # build step, so it has to run without a token. It is pointed at the kit's
    # demo, which is known to pass.
    r = v.get("/api/mcp", method="POST", body={
        "jsonrpc": "2.0", "id": 1, "method": "tools/call",
        "params": {"name": "workshop_check_target", "arguments": {"url": "https://agent-native-kit.vercel.app"}},
    })
    body = r.text if r else ""
    v.check("workshop-check-target", "pass" if "findings" in body else "fail",
            "workshop_check_target runs anonymously and returns findings",
            "Every build step tells the attendee's agent to verify with this tool; if it needs a token or errors, no step can be marked done.",
            "Keep workshop_check_target at scope: null in lib/mcp/tools.ts and make sure lib/checkTarget.ts can reach the internet.")

    r = v.get("/api/mcp", method="POST", body={
        "jsonrpc": "2.0", "id": 2, "method": "tools/call",
        "params": {"name": "workshop_outline", "arguments": {}},
    })
    try:
        text = json.loads(r.text)["result"]["content"][0]["text"]
        steps = json.loads(text).get("build_steps", [])
    except Exception:
        steps = []
    v.check("build-steps", "pass" if len(steps) == 7 and all(isinstance(s.get("budgetMinutes"), int) for s in steps) else "fail",
            f"workshop_outline serves 7 build steps, each with a budgetMinutes ({len(steps)} found)",
            "SKILL.md tells the guiding agent to keep to each step's budget; a step without one has no stop point.",
            "Give every entry in BUILD_STEPS (lib/curriculum.ts) a budgetMinutes.")
