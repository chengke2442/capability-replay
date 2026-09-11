import fs from 'node:fs/promises';
import { capability, replay } from './capability.js';
import { SessionLease } from './handoff.js';
import { startTarget, openSurface } from './surface.js';

await fs.mkdir('evidence', { recursive: true });
const { server, origin } = await startTarget();
const artifact = structuredClone(capability); artifact.policy.allowedOrigins = [origin];
await fs.writeFile('evidence/member-balance.v1.json', JSON.stringify(artifact, null, 2));
const discoveryEvidence = [
  { at: new Date().toISOString(), event: 'DISCOVERY_STARTED', planner: 'scripted-demo', note: 'Replace with a live LLM provider before submission.' },
  { at: new Date().toISOString(), event: 'OBSERVED', state: 'member lookup form' },
  { at: new Date().toISOString(), event: 'DECIDED', actions: ['fill member ID', 'click search', 'read result'] },
  { at: new Date().toISOString(), event: 'DISCOVERY_COMPLETED', artifactId: artifact.id }
];
await fs.writeFile('evidence/discovery.json', JSON.stringify(discoveryEvidence, null, 2));
const surface = await openSurface(origin); const evidence = []; const lease = new SessionLease('demo-session-1');
const found = await replay({ page: surface.page, artifact, input: { memberId: '12345' }, lease, evidence });
const intervention = lease.pause({ capabilityId: artifact.id, step: 'operator-demo', reason: 'Simulated confirmation dialog', liveUrl: surface.page.url() });
lease.resume('demo.operator', 'Reviewed the confirmation dialog; safe to continue.');
await surface.page.goto(origin); const notFound = await replay({ page: surface.page, artifact, input: { memberId: '00000' }, lease, evidence });
await fs.writeFile('evidence/replay.json', JSON.stringify({ found, notFound, intervention, handoffEvents: lease.events, events: evidence }, null, 2));
console.log(JSON.stringify({ found, notFound }, null, 2)); await surface.browser.close(); server.close();
