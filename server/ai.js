function summarizeNewsLocally(articles = []) {
  const headlines = (articles || [])
    .map((item) => String(item?.title || '').trim())
    .filter(Boolean)
    .slice(0, 10);

  if (!headlines.length) return 'No recent headlines were available for summarization.';

  const mentionsInec = headlines.some((headline) => /inec|polling|ballot|vote/i.test(headline));
  const mentionsSecurity = headlines.some((headline) => /security|violence|thugg|attack|sos|incident/i.test(headline));
  const mentionsLogistics = headlines.some((headline) => /late|delay|bvas|battery|network|material|register/i.test(headline));

  const themes = [];
  if (mentionsInec) themes.push('election administration and polling operations');
  if (mentionsSecurity) themes.push('security and incident response');
  if (mentionsLogistics) themes.push('logistics and equipment readiness');

  const themeText = themes.length ? themes.join(', ') : 'operational readiness';
  return `Local summary: the headline set points most strongly to ${themeText}. This is operationally relevant for Ibadan and INEC follow-up work, so prioritize field verification for any reported disruptions, confirm facts with official channels, and monitor follow-up coverage before acting on the stories.`;
}

function analyzeContextLocally(context = {}) {
  if (context.analysisMode === 'PRE_ELECTION') {
    const history = Array.isArray(context.historicalDatasets) ? context.historicalDatasets : [];
    const byId = new Map(history.map(item => [item?.dataset?.id, item]));
    const resultFor = id => byId.get(id)?.result || {};
    const partyValue = (result, party) => Number((result?.parties || []).find(item => item.party === party)?.value || 0);
    const change = (current, previous) => {
      const delta = Number(current || 0) - Number(previous || 0);
      return `${delta >= 0 ? '+' : ''}${delta.toLocaleString()}`;
    };
    const governor2019 = resultFor('2019-governor');
    const governor2023 = resultFor('2023-governor');
    const president2019 = resultFor('2019-president');
    const president2023 = resultFor('2023-president');
    const assembly2019 = resultFor('2019-assembly');
    const assembly2023 = resultFor('2023-assembly');
    const governorLgas = Array.isArray(governor2023.areas) ? governor2023.areas : [];
    const presidentialLgas = Array.isArray(president2023.areas) ? president2023.areas : [];
    const ready = history.filter(item => item?.dataset?.status === 'available').length;
    const partial = Math.max(0, history.length - ready);
    const apcGovernorChange = change(partyValue(governor2023, 'APC'), partyValue(governor2019, 'APC'));
    const pdpGovernorChange = change(partyValue(governor2023, 'PDP'), partyValue(governor2019, 'PDP'));
    const apcPresidentialChange = change(partyValue(president2023, 'APC'), partyValue(president2019, 'APC'));
    const pdpPresidentialChange = change(partyValue(president2023, 'PDP'), partyValue(president2019, 'PDP'));
    const apcAssembly2019 = partyValue(assembly2019, 'APC');
    const apcAssembly2023 = partyValue(assembly2023, 'APC');
    const pdpAssembly2023 = partyValue(assembly2023, 'PDP');
    return `EXECUTIVE ASSESSMENT
Across all ${history.length} loaded Kwara datasets, the historical record shows broad APC dominance in the available 2019, 2023 and 2024 outcomes, while PDP improved its governorship vote between 2019 and 2023 and gained one State Assembly seat in 2023. Kwara State has exactly 16 LGAs. This is a statewide historical baseline, not a prediction of the next election.

EVIDENCE & PATTERNS
- Governorship: APC changed by ${apcGovernorChange} votes from 2019 to 2023; PDP changed by ${pdpGovernorChange}. The 2023 transcription lists APC ahead in ${governorLgas.length} of 16 LGAs, but those LGA figures do not yet reconcile to the declared state total.
- Presidential: APC changed by ${apcPresidentialChange} and PDP by ${pdpPresidentialChange} votes between the available 2019 and 2023 records. The 2019 presidential record is partial, so other-party movement is not comparable.
- Legislative: the loaded records show APC winning all 3 Senate districts and 6 federal constituencies in both cycles; 2023 vote totals are missing. APC State Assembly seats changed from ${apcAssembly2019} to ${apcAssembly2023}, while PDP recorded ${pdpAssembly2023} seat in 2023.
- The 2024 local-government record contains 16 chairmanship and 193 councillorship outcomes, but no detailed party vote totals.

RISKS & UNCERTAINTIES
- ${partial} of ${history.length} datasets are partial, especially 2023 Senate/Reps votes and Assembly/local-government constituency totals.
- Polling-unit structures changed between election cycles, and the two 2023 LGA transcriptions must not be presented as certified state totals.
- Historical outcomes cannot establish future voting behaviour or a certain winner.

ACTIONABLE NEXT STEPS
- Direct the data team now to reconcile all 16 LGA transcriptions against official result sheets and record every correction.
- Require the planning team this cycle to compare only like-for-like offices across 2019 and 2023.
- Allocate reporting and verification readiness across all 16 LGAs using result-sheet coverage and operational gaps, not voter persuasion.
- Obtain official 2023 legislative vote totals and detailed 2024 KWSIEC figures before producing constituency-level conclusions.

CONFIDENCE
MODERATE for statewide historical direction; LOW TO MODERATE for constituency or polling-unit decisions because ${partial} datasets remain partial and require source reconciliation.`;
  }
  if (context.analysisMode === 'POST_ELECTION') {
    const evidence = context.evidenceAndLitigation || {};
    const spatial = Array.isArray(context.spatialConcentrations) ? context.spatialConcentrations : [];
    const performance = Array.isArray(context.reportingPerformance) ? context.reportingPerformance : [];
    const topSpatial = spatial[0];
    const topPerformer = performance[0];
    const conflicts = Number(evidence.fieldMismatches || 0) + Number(evidence.irevMismatches || 0);
    const readiness = Number(evidence.readinessScore || 0);
    return `EXECUTIVE ASSESSMENT
Evidence readiness is ${readiness}%. The submitted record contains ${conflicts} count conflict${conflicts === 1 ? '' : 's'} requiring reconciliation before legal or public reliance. This is an operational evidence assessment, not a legal conclusion.

EVIDENCE & PATTERNS
- ${Number(evidence.missingEvidence || 0)} field result submission${Number(evidence.missingEvidence || 0) === 1 ? '' : 's'} lack attached evidence.
- ${Number(evidence.fieldMismatches || 0)} Agent-Supervisor and ${Number(evidence.irevMismatches || 0)} field-IReV discrepancies are recorded.
- ${topSpatial ? `${topSpatial.ward} has the highest observed submitted-vote concentration (${Number(topSpatial.submittedVotes || 0).toLocaleString()}) with ${Number(topSpatial.incidents || 0)} related operational incidents.` : 'No ward-level spatial concentration can yet be established.'}

RISKS & UNCERTAINTIES
- Preserve original result images, timestamps, submitter identity, and revision history before correcting records.
- Submitted vote concentration is not verified turnout and incomplete coverage can change every ranking.
- Performance scores measure reporting discipline from available records, not overall staff conduct or legal responsibility.

ACTIONABLE NEXT STEPS
- Freeze the evidence register immediately and verify hashes or immutable copies for every available result attachment.
- Reconcile the results desk urgently against original sheets for all ${conflicts} conflicting unit record${conflicts === 1 ? '' : 's'}.
- Recover missing evidence this cycle for ${Number(evidence.missingEvidence || 0)} submission${Number(evidence.missingEvidence || 0) === 1 ? '' : 's'} and document every unavailable original.
- Review ward deployment before the next cycle using incident burden, reporting gaps, and response outcomes rather than voter targeting.
- Validate performance awards after supervisor review${topPerformer ? `, beginning with ${topPerformer.name} (${Number(topPerformer.score || 0)}% reporting score)` : ''}.

CONFIDENCE
${readiness >= 80 ? 'MODERATE: evidence completeness is comparatively strong, but all conflicts and coverage gaps still require verification.' : 'LOW TO MODERATE: missing evidence, count conflicts, or incomplete coverage limit reliance on the current record.'}`;
  }
  const incidents = Array.isArray(context.incidents) ? context.incidents : [];
  const projection = context.projection || {};
  const resultSummary = context.resultSummary || {};
  const selectedParty = String(context.selectedParty || '').trim();
  const party = context.partyAnalysis || null;
  const criticalItems = incidents.filter((incident) => incident?.severity === 'Critical' || incident?.reportType === 'SOS-Emergency');
  const openItems = incidents.filter((incident) => !['Resolved', 'Submitted'].includes(incident?.status));
  const withoutEvidence = openItems.filter((incident) => !Number(incident?.mediaCount));
  const coverage = Number(projection.coverage || resultSummary.submissions || context.coverage || 0);
  const leader = projection.leader || context.leader || 'No party';
  const margin = Number(projection.margin || 0);
  const locationCounts = criticalItems.reduce((counts, incident) => {
    const location = [incident?.lga, incident?.ward].filter(Boolean).join(' / ') || 'unspecified locations';
    counts[location] = (counts[location] || 0) + 1;
    return counts;
  }, {});
  const topRiskLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0];
  const assessment = selectedParty && party
    ? `${selectedParty} has ${Number(party.votes || 0).toLocaleString()} submitted votes and leads in ${Number(party.wards || 0)} assessed wards and ${Number(party.lgas || 0)} assessed LGAs. This is an interim operational picture, not a final result.`
    : `${leader} leads the submitted vote data by ${margin.toLocaleString()} votes across ${coverage} covered polling units. The picture remains provisional until missing units and evidence are verified.`;
  const evidence = [
    `- ${incidents.length} incidents are in scope: ${criticalItems.length} critical/SOS and ${Math.max(0, openItems.length - criticalItems.length)} other open items.`,
    `- ${withoutEvidence.length} open incident${withoutEvidence.length === 1 ? '' : 's'} currently lack attached media evidence.`,
    topRiskLocation ? `- The highest observed critical/SOS concentration is ${topRiskLocation[0]} with ${topRiskLocation[1]} item${topRiskLocation[1] === 1 ? '' : 's'}.` : '- No geographic concentration of critical/SOS incidents is established.',
  ];
  const risks = [
    `- Result coverage is ${coverage} polling unit${coverage === 1 ? '' : 's'}; unreported units can materially change margins.`,
    `- ${openItems.length} incident${openItems.length === 1 ? '' : 's'} remain unresolved or unsubmitted, limiting confidence in the operating picture.`,
    '- Incident descriptions are field observations and require corroboration before escalation or public use.',
  ];
  const nextActions = [
    criticalItems.length ? `- Dispatch the response coordinator immediately to verify and triage the ${criticalItems.length} critical/SOS item${criticalItems.length === 1 ? '' : 's'}, recording disposition and response time.` : '- Confirm with the response desk now that no unlogged critical or SOS events are awaiting triage.',
    withoutEvidence.length ? `- Assign field supervisors within the next reporting cycle to obtain timestamped evidence for ${withoutEvidence.length} open item${withoutEvidence.length === 1 ? '' : 's'} and mark unverifiable reports accordingly.` : '- Audit the evidence desk this cycle to confirm every open report has usable, timestamped support.',
    `- Reconcile the results desk now against polling-unit submissions, duplicates, and arithmetic before relying on the ${margin.toLocaleString()}-vote margin.`,
    `- Contact ward reporting teams this cycle to close coverage gaps beyond the ${coverage} currently represented polling unit${coverage === 1 ? '' : 's'}.`,
  ];
  const confidence = coverage >= 50 && !criticalItems.length && withoutEvidence.length === 0 ? 'MODERATE: coverage and evidence are improving, but results remain provisional.' : 'LOW TO MODERATE: open incidents, evidence gaps, and incomplete polling-unit coverage limit certainty.';

  return `EXECUTIVE ASSESSMENT\n${assessment}\n\nEVIDENCE & PATTERNS\n${evidence.join('\n')}\n\nRISKS & UNCERTAINTIES\n${risks.join('\n')}\n\nACTIONABLE NEXT STEPS\n${nextActions.join('\n')}\n\nCONFIDENCE\n${confidence}`;
}

function enforceKwaraPreElectionFacts(value, analysisMode = 'PRE_ELECTION') {
  const text = String(value || '');
  if (analysisMode !== 'PRE_ELECTION') return text;
  return text
    .replace(/\b18\s+LGAs\b/gi, '16 LGAs')
    .replace(/\b18\s+local government areas\b/gi, '16 Local Government Areas');
}

function ensureUsableAnalysis(value, provider = 'AI') {
  const text = String(value || '').trim();
  if (text.length < 80) {
    const error = new Error(`${provider} returned an empty or incomplete analysis.`);
    error.code = 'AI_EMPTY_RESPONSE';
    error.status = 502;
    throw error;
  }
  return text;
}

export { summarizeNewsLocally, analyzeContextLocally, enforceKwaraPreElectionFacts, ensureUsableAnalysis };
