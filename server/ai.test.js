import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeContextLocally, summarizeNewsLocally } from './ai.js';

test('summarizeNewsLocally produces a useful summary from headlines', () => {
  const summary = summarizeNewsLocally([
    { title: 'INEC reports late opening at Ibadan polling unit', source: 'Premium Times' },
    { title: 'Security incident reported near Oyo ward', source: 'Guardian' },
  ]);

  assert.match(summary, /Ibadan|INEC|operational/i);
});

test('analyzeContextLocally highlights critical issues and confidence', () => {
  const analysis = analyzeContextLocally({
    incidents: [
      { severity: 'Critical', reportType: 'SOS-Emergency', status: 'Open' },
      { severity: 'High', reportType: 'Vote Buying', status: 'Open' },
    ],
    coverage: 8,
    leader: 'Party A',
  });

  assert.match(analysis, /Critical|SOS|coverage/i);
  assert.match(analysis, /Party A/i);
});

test('analyzeContextLocally produces a post-election evidence brief', () => {
  const analysis = analyzeContextLocally({
    analysisMode: 'POST_ELECTION',
    evidenceAndLitigation: { readinessScore: 68, missingEvidence: 3, fieldMismatches: 2, irevMismatches: 1 },
    spatialConcentrations: [{ ward: 'Ilorin West / Adewole', submittedVotes: 1200, incidents: 2 }],
    reportingPerformance: [{ name: 'Field Agent A', score: 88 }],
  });

  assert.match(analysis, /Evidence readiness is 68%/i);
  assert.match(analysis, /Ilorin West \/ Adewole/i);
  assert.match(analysis, /not a legal conclusion/i);
});
