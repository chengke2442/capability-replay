import { enforce, redact } from './guardrails.js';

export const capability = {
  schemaVersion: '1.0', id: 'member.current-savings-balance', version: 1,
  description: 'Look up a member and return their current savings balance.',
  inputs: { memberId: { type: 'string', pattern: '^\\d{5}$', sensitive: true } },
  outputs: { outcome: { type: 'enum', values: ['FOUND', 'NOT_FOUND'] }, memberName: { type: 'string' }, currentSavingsBalance: { type: 'currency' } },
  policy: { allowedOrigins: [], allowedActions: ['fill', 'click', 'read'], riskyActions: 'block' },
  steps: [
    { id: 'enter-member', type: 'fill', target: { candidates: [{ role: 'textbox', name: 'Member ID' }, { css: 'input[name="member_id"]' }] }, valueFrom: 'memberId' },
    { id: 'search', type: 'click', target: { candidates: [{ role: 'button', name: 'Search member' }, { css: 'button' }] } },
    { id: 'classify', type: 'read', checkpoint: { any: [{ css: '#member-record' }, { role: 'alert', text: 'Member record not found' }] } }
  ],
  locatorStrategy: 'Accessibility role/name first; semantic attribute/CSS fallback. Each action is followed by a state assertion.',
  successCheckpoint: { css: '#member-record' }
};

async function locator(page, target) {
  for (const c of target.candidates) {
    if (c.role) { const l = page.getByRole(c.role, c.name ? { name: c.name } : undefined); if (await l.count()) return l; }
    if (c.css) { const l = page.locator(c.css); if (await l.count()) return l; }
  }
  throw new Error('No locator candidate matched');
}
export async function replay({ page, artifact, input, lease, evidence }) {
  const log = (event, data = {}) => evidence.push({ at: new Date().toISOString(), event, ...redact(data) });
  if (!/^\d{5}$/.test(input.memberId)) return { status: 'FAILURE', failure: { code: 'INPUT_INVALID', step: 'enter-member', expected: 'five-digit member ID' } };
  try {
    for (const step of artifact.steps) {
      lease.assertAutomation(); enforce(artifact.policy, step, page.url()); log('STEP_STARTED', { step: step.id });
      if (step.type === 'fill') await (await locator(page, step.target)).fill(input[step.valueFrom]);
      if (step.type === 'click') { await Promise.all([page.waitForLoadState('domcontentloaded'), (await locator(page, step.target)).click()]); }
      if (step.type === 'read') {
        if (await page.getByRole('alert').count()) { log('BUSINESS_OUTCOME', { outcome: 'NOT_FOUND', step: step.id }); return { status: 'BUSINESS_OUTCOME', outcome: 'NOT_FOUND' }; }
        await page.locator('#member-record').waitFor({ state: 'visible', timeout: 1500 });
      }
      log('STEP_COMPLETED', { step: step.id });
    }
    const row = page.locator('#member-record tr').nth(1); const balance = await row.locator('td').textContent(); const name = await page.locator('#member-record tr').nth(0).locator('td').textContent();
    const outputs = { outcome: 'FOUND', memberName: name?.trim(), currentSavingsBalance: balance?.trim() }; log('REPLAY_SUCCEEDED', { outputs }); return { status: 'SUCCESS', outputs };
  } catch (error) {
    const screenshot = `evidence/failure-${Date.now()}.png`; await page.screenshot({ path: screenshot });
    log('REPLAY_FAILED', { message: error.message, screenshot }); return { status: 'FAILURE', failure: { code: error.code || 'UNEXPECTED_UI_STATE', message: error.message, screenshot } };
  }
}
