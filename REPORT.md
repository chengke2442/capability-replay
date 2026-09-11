# Design report

## 1. Architecture

The MVP is a single Node process: a local target surface, a browser adapter, a discovery seam, a capability artifact, and a deterministic executor. The small surface is intentionally table-based and has no test IDs, so the core is not coupled to a modern application DOM. A production build would make the `page` adapter an interface implemented by web accessibility, vision/coordinates, and desktop accessibility drivers.

Discovery is separate from execution. A planner observes the surface and proposes typed actions; the policy gate validates every proposed action before it reaches the adapter. The included scripted planner makes the demo reproducible. A live provider belongs behind the same planner contract and must produce the required discovery evidence before submission.

## 2. Artifact schema

An artifact is versioned and declares its ID, contract, policy, ordered steps, locator candidates, outputs, and checkpoint. Inputs and outputs are typed rather than inferred from a transcript. Locator candidates express a preference order: accessible role/name, then a conservative CSS fallback. Parameter values stay in the invocation; the saved artifact holds a reference such as `valueFrom: memberId`, never a member value.

## 3. Determinism & error handling

Replay never calls a planner. It executes the serialized steps in order, waits for navigation and a visible checkpoint, then extracts declared fields. It returns one of: `SUCCESS`, `BUSINESS_OUTCOME` (for an expected missing record), or `FAILURE` with a code, step context, and screenshot. Input validation is immediate. Transient waits are bounded; a timeout is a hard failure rather than a blind next click. A production adapter would add known-dialog handlers and retry budgets as explicit steps, not hidden recovery.

## 4. Heterogeneity & multi-tenant

The seam is the surface adapter: artifacts refer to logical locators and actions, while an adapter resolves them for DOM, accessibility-tree, vision, or OS automation. For tenant reuse, retain a vendor-level base artifact plus signed tenant/version override packs for locator candidates and routes. Replay records locator choice, page fingerprint, and checkpoint failures. A drift monitor can flag a variant when fallback usage or failure rate rises, without silently rewriting the base capability.

## 5. Escalation & handoff

`SessionLease` has explicit ownership: `automation` or `operator`. A timeout, policy violation, risky action, or unrecognized state creates an intervention request containing the capability, current step, reason, and failure screenshot. The browser context is retained; the operator receives that same session, performs a manual action, then calls `resume(operator, note)`. The control-transfer log becomes part of the evidence. The demo contains the real state machine but intentionally omits a co-browsing UI.

## 6. Safety

Every action is checked against configured origin and action allowlists. Irreversible actions are blocked in this MVP. Structured events are redacted for identifiers and secret-like field names, and artifacts retain parameter references rather than credentials or member data. Screenshots are useful failure evidence but should be stored encrypted with retention controls in a real regulated deployment; the local demo only uses fake data.

## 7. Cuts

The MVP has one capability and a local target, not tenant management, queues, an approval workflow, operator UI, or desktop driver. The visible discovery evidence is scripted so that it is reproducible without credentials; before external submission it must be replaced by one live LLM discovery run using the provider adapter and its redacted evidence. Next, I would add the provider adapter with strict JSON-schema output, known interstitial recovery steps, and a review/approval state before unattended replay.
