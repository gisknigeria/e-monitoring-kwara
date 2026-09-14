const parseCsvList = (value, fallback = []) => {
  const candidates = String(value ?? '').split(',').map((item) => item.trim()).filter(Boolean);
  return candidates.length ? candidates : fallback;
};

const scopedDeployment = Object.freeze({
  country: 'Nigeria',
  state: 'Kwara',
  name: 'Kwara Election Intelligence Platform',
  timezone: 'Africa/Lagos',
  scopeId: process.env.SIGAR_SCOPE_ID || 'ng-kwara',
  electionId: process.env.SIGAR_ELECTION_ID || 'ng-kwara-election',
  // Optional ISO date. Only used to resolve pre-election/election-day/post-election
  // report windows; left empty (not defaulted to a guessed date) until configured.
  electionDate: process.env.SIGAR_ELECTION_DATE || '',
  sourceVersion: process.env.SIGAR_SOURCE_VERSION || 'kwara-operational-v1',
  allowedScopeIds: parseCsvList(process.env.SIGAR_ALLOWED_SCOPE_IDS, ['ng-kwara']),
  lifecycleViews: ['pre-election', 'election-day', 'post-election'],
});

export const deployment = scopedDeployment;

export function getDeploymentConfig(overrides = {}) {
  const scopeId = String(overrides.scopeId ?? process.env.SIGAR_SCOPE_ID ?? deployment.scopeId ?? 'ng-kwara').trim() || 'ng-kwara';
  const electionId = String(overrides.electionId ?? process.env.SIGAR_ELECTION_ID ?? deployment.electionId ?? 'ng-kwara-election').trim() || 'ng-kwara-election';
  const baseAllowedScopeIds = parseCsvList(process.env.SIGAR_ALLOWED_SCOPE_IDS, deployment.allowedScopeIds || [deployment.scopeId || scopeId]);
  const allowedScopeIds = Array.from(new Set(baseAllowedScopeIds.map((item) => item.trim()).filter(Boolean)));
  return {
    ...deployment,
    scopeId,
    electionId,
    sourceVersion: String(overrides.sourceVersion ?? process.env.SIGAR_SOURCE_VERSION ?? deployment.sourceVersion ?? 'kwara-operational-v1').trim() || 'kwara-operational-v1',
    electionDate: String(overrides.electionDate ?? process.env.SIGAR_ELECTION_DATE ?? deployment.electionDate ?? '').trim(),
    allowedScopeIds,
  };
}

export function isConfiguredScope(scopeId, config = getDeploymentConfig()) {
  const raw = String(scopeId || '').trim();
  if (!raw) return false;
  return config.allowedScopeIds.some((item) => item.toLowerCase() === raw.toLowerCase());
}

export function requireConfiguredScope(scopeId, config = getDeploymentConfig()) {
  const resolved = String(scopeId || '').trim();
  if (!resolved || !isConfiguredScope(resolved, config)) {
    throw new Error(`Scope '${resolved || '(empty)'}' is not configured for this deployment. Allowed scopes: ${config.allowedScopeIds.join(', ') || 'none'}.`);
  }
  return resolved;
}

export function requireKwaraState(state) {
  const expected = String(deployment.state || 'Kwara').trim();
  if (typeof state !== 'string' || state.trim().toLowerCase() !== expected.toLowerCase()) {
    throw new Error(`This deployment accepts ${expected} State operations only.`);
  }
  return expected;
}
