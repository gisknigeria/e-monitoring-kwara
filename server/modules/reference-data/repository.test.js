import test from 'node:test';
import assert from 'node:assert/strict';
import { createReferenceDataRepository } from './repository.js';
import { getDeploymentConfig, isConfiguredScope } from '../../config/deployment.js';

function fixture() {
  return createReferenceDataRepository({ jsonDb: {}, saveJson() {} });
}

const base = {
  sourceId: 'inec-kwara-polling-units',
  sourceName: 'Official Kwara election reference feed',
  sourceUrl: 'https://example.gov.ng/kwara/reference',
  sourceVersion: '2026-09-10-v1',
  classification: 'master-data',
  records: [{ providerId: 'inec-pu-1', canonicalId: 'ng-kwara-ibadan-north-ward-1-pu-1', state: 'Kwara', lga: 'Ibadan North', ward: 'Ward 1', pollingUnit: 'PU 1' }],
};

test('reference ingestion creates a pending immutable release with normalized provenance', async () => {
  const repository = fixture();
  const release = await repository.ingestReferenceData(base);
  assert.equal(release.status, 'pending-approval');
  assert.equal(release.classification, 'authoritative-master');
  assert.equal(release.recordCount, 1);
  assert.equal(release.immutable, true);
  assert.equal(release.records[0].sourceClassification, 'authoritative-master');
  assert.equal(release.records[0].providerId, 'inec-pu-1');
  assert.equal(release.records[0].validationStatus, 'valid');
  const approved = await repository.approveReferenceData(release.id, { approvedBy: 'governance-1', approvedByRole: 'Admin' });
  assert.equal(approved.status, 'approved');
  assert.equal(approved.approvedBy, 'governance-1');
  assert.equal((await repository.activeReferenceData())[0].id, release.id);
});

test('same source version is idempotent and conflicting content is rejected', async () => {
  const repository = fixture();
  const first = await repository.ingestReferenceData(base);
  const replay = await repository.ingestReferenceData(base);
  assert.equal(replay.id, first.id);
  await assert.rejects(repository.ingestReferenceData({ ...base, records: [{ providerId: 'different', canonicalId: 'different' }] }), /different content/);
  assert.equal((await repository.referenceDataReleases()).length, 1);
});

test('reference classifications remain distinct and unapproved releases are excluded from active data', async () => {
  const repository = fixture();
  const master = await repository.ingestReferenceData(base);
  await repository.approveReferenceData(master.id, { approvedBy: 'governance-1' });
  const external = await repository.ingestReferenceData({ ...base, sourceId: 'official-boundaries', sourceVersion: '2026-v2', classification: 'external-reference' });
  const observation = await repository.ingestReferenceData({ ...base, sourceId: 'field-observations', sourceVersion: '2026-v1', classification: 'operating-observation' });
  assert.equal(external.status, 'pending-approval');
  assert.equal(observation.classification, 'field-observed');
  assert.equal((await repository.activeReferenceData()).length, 1);
  assert.equal((await repository.referenceDataReleases({ classification: 'external-reference' })).length, 1);
});

test('ingestion rejects non-Kwara scope', async () => {
  await assert.rejects(fixture().ingestReferenceData({ ...base, scopeId: 'ng-osun' }), /Kwara scope/);
});

test('invalid rows are quarantined and cannot be approved as the only content', async () => {
  const repository = fixture();
  const release = await repository.ingestReferenceData({ ...base, records: [{ state: 'Kwara' }] });
  assert.equal(release.quarantinedRecordCount, 1);
  assert.equal(release.records[0].validationStatus, 'quarantined');
  await assert.rejects(repository.approveReferenceData(release.id, { approvedBy: 'governance-1' }), /no valid records/);
});

test('default deployment config keeps Kwara enabled and scopes are validated by allowlist', () => {
  const config = getDeploymentConfig();
  assert.equal(config.scopeId, 'ng-kwara');
  assert.equal(isConfiguredScope('ng-kwara', config), true);
  assert.equal(isConfiguredScope('ng-osun', config), false);
});