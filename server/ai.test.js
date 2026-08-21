import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeContextLocally, enforceKwaraPreElectionFacts, summarizeNewsLocally } from './ai.js';

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

test('analyzeContextLocally uses the complete history for a Kwara-wide pre-election brief', () => {
  const analysis = analyzeContextLocally({
    analysisMode: 'PRE_ELECTION',
    selectedView: { dataset: { id: '2023-senate' }, result: { metric: 'wins', parties: [{ party: 'APC', value: 3 }] } },
    historicalDatasets: [
      { dataset: { id: '2019-governor', status: 'available' }, result: { parties: [{ party: 'APC', value: 331546 }, { party: 'PDP', value: 114754 }] } },
      { dataset: { id: '2023-governor', status: 'available' }, result: { parties: [{ party: 'APC', value: 273424 }, { party: 'PDP', value: 155490 }], areas: Array.from({ length: 16 }, (_, index) => ({ name: `LGA ${index + 1}`, winner: 'APC' })) } },
      { dataset: { id: '2019-assembly', status: 'partial' }, result: { parties: [{ party: 'APC', value: 24 }] } },
      { dataset: { id: '2023-assembly', status: 'partial' }, result: { parties: [{ party: 'APC', value: 23 }, { party: 'PDP', value: 1 }] } },
    ],
  });

  assert.match(analysis, /historical baseline, not a prediction/i);
  assert.match(analysis, /exactly 16 LGAs/i);
  assert.match(analysis, /Governorship: APC changed/i);
  assert.match(analysis, /PDP recorded 1 seat/i);
  assert.doesNotMatch(analysis, /18 LGAs/i);
});

test('enforceKwaraPreElectionFacts corrects the known 18-LGA hallucination', () => {
  const corrected = enforceKwaraPreElectionFacts('Kwara has 18 LGAs and 18 local government areas.', 'PRE_ELECTION');
  assert.equal(corrected, 'Kwara has 16 LGAs and 16 Local Government Areas.');
});
