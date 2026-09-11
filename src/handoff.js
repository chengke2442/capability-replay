export class SessionLease {
  constructor(sessionId) { this.sessionId = sessionId; this.owner = 'automation'; this.events = []; }
  pause(request) { this.owner = 'operator'; this.events.push({ type: 'INTERVENTION_REQUESTED', at: new Date().toISOString(), ...request }); return { sessionId: this.sessionId, owner: this.owner, request }; }
  resume(operator, note) {
    if (this.owner !== 'operator') throw new Error('Only an operator-held session can resume');
    this.owner = 'automation'; this.events.push({ type: 'CONTROL_RETURNED', operator, note, at: new Date().toISOString() });
  }
  assertAutomation() { if (this.owner !== 'automation') throw new Error('Automation does not own this live session'); }
}
