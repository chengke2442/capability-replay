# Legacy UI capability MVP

A deliberately small vertical slice for computer-use automation. It drives a local, legacy-shaped member servicing page, records a typed capability, and then replays that capability with no planner in the loop.

## What is real

- Playwright operates a live browser surface with table-based markup and no test IDs.
- The replay engine uses ordered locator candidates, assertions, bounded waits, and a typed error taxonomy.
- The same browser context is paused for human handoff and resumed after an operator acknowledgement.
- Logs, artifacts, and failure screenshots are redacted before persistence.

The discovery planner has two seams: `scripted` is the reproducible local demo; `live` requires `OPENAI_API_KEY` and is reserved for the genuine model-driven discovery run. The scripted planner is intentionally not presented as an LLM run.

## Run

Requires Node 20+ and Playwright browsers (`npx playwright install chromium` if Chromium is not present).

```powershell
npm run demo
npm test
```

`npm run demo` starts the local target, runs discovery, saves `evidence/member-balance.v1.json`, replays it for member `12345`, and demonstrates the expected `NOT_FOUND` business outcome for member `00000`.

For a live discovery adapter, set `OPENAI_API_KEY` and implement your provider call in `src/planner.js`; its output is constrained to the same action schema and policy gate.

## Layout

- `src/surface.js` - local legacy-like target and browser surface adapter
- `src/capability.js` - typed capability contract and replay executor
- `src/guardrails.js` - allowlist, redaction, and risky-action gate
- `src/handoff.js` - session ownership and pause/resume protocol
- `evidence/` - generated artifacts and structured evidence
