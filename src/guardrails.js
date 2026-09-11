const SECRET = /(password|token|authorization|secret)/i;
const PII = /\b\d{5,}\b/g;

export class PolicyViolation extends Error { constructor(message) { super(message); this.code = 'POLICY_VIOLATION'; } }

export function enforce(policy, action, url) {
  if (!policy.allowedActions.includes(action.type)) throw new PolicyViolation(`Action ${action.type} is not allowlisted`);
  if (!policy.allowedOrigins.some(origin => url.startsWith(origin))) throw new PolicyViolation(`Origin is not allowlisted: ${url}`);
  if (action.risk === 'irreversible') throw new PolicyViolation('Irreversible action requires operator approval');
}

export function redact(value) {
  if (value == null) return value;
  if (typeof value === 'string') return value.replace(PII, '[REDACTED_ID]');
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, SECRET.test(k) ? '[REDACTED]' : redact(v)]));
  return value;
}
