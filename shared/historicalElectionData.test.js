import test from 'node:test';
import assert from 'node:assert/strict';
import { HISTORICAL_ELECTION_DATASETS, HISTORICAL_ELECTION_RESULTS, getHistoricalDataset, historicalDatasetSummary } from './historicalElectionData.js';

test('every historical dataset has a result record and an explicit limitation', () => {
  for (const dataset of HISTORICAL_ELECTION_DATASETS) {
    assert.ok(HISTORICAL_ELECTION_RESULTS[dataset.id], `${dataset.id} is missing its result record`);
    assert.ok(dataset.missing);
    assert.ok(['available', 'partial'].includes(dataset.status));
  }
});

test('historical lookups and coverage summary are consistent', () => {
  assert.equal(getHistoricalDataset(2023, 'Governorship')?.id, '2023-governor');
  const summary = historicalDatasetSummary();
  assert.equal(summary.total, HISTORICAL_ELECTION_DATASETS.length);
  assert.equal(summary.available + summary.partial, summary.total);
});

test('missing candidate vote totals are not represented as zero', () => {
  const senate2023 = HISTORICAL_ELECTION_RESULTS['2023-senate'];
  assert.equal(senate2023.metric, 'wins');
  assert.ok(senate2023.areas.every((area) => area.winnerValue === undefined));
});
