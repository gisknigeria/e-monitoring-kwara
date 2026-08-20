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
    const dataset = context.selectedDataset || {};
    const result = context.historicalResult || {};
    const previousDataset = context.previousDataset || null;
    const previousResult = context.previousResult || null;
    const parties = Array.isArray(result.parties) ? result.parties : [];
    const ranked = parties.slice().sort((a, b) => Number(b.value || 0) - Number(a.value || 0));
    const leader = ranked[0];
    const runnerUp = ranked[1];
    const unit = result.metric === 'votes' ? 'votes' : result.metric === 'seats' ? 'seats' : 'recorded wins';
    const margin = leader && runnerUp ? Number(leader.value || 0) - Number(runnerUp.value || 0) : null;
    const previousLeader = previousResult?.parties?.slice().sort((a, b) => Number(b.value || 0) - Number(a.value || 0))[0];
    return `EXECUTIVE ASSESSMENT
The ${dataset.year || ''} Kwara ${dataset.election || 'election'} record shows ${leader ? `${leader.party} with ${Number(leader.value || 0).toLocaleString()} ${unit}` : 'no comparable party total'}. This is a historical baseline, not a prediction of the next election.

EVIDENCE & PATTERNS
- Coverage level: ${dataset.level || 'not stated'}.
- ${leader && runnerUp ? `${leader.party} led the available record by ${Number(margin).toLocaleString()} ${unit} over ${runnerUp.party}.` : 'The available record supports outcome identification but not a numerical margin.'}
- ${previousDataset && previousLeader ? `The closest earlier ${previousDataset.election} record is ${previousDataset.year}, led by ${previousLeader.party}; differences must be interpreted against changes in parties, candidates, turnout and polling-unit structure.` : 'No directly comparable earlier dataset is loaded for this selection.'}

RISKS & UNCERTAINTIES
- Missing data: ${dataset.missing || 'not documented'}.
- ${result.note || 'Source coverage should be verified before use.'}
- Historical performance alone cannot establish future voting behaviour or a certain winner.

ACTIONABLE NEXT STEPS
- Reconcile the data register against the linked official result source before publishing any figure.
- Obtain the missing geographic or candidate totals listed in the coverage register when they become available.
- Compare like-for-like offices and geographic levels; do not combine presidential, governorship and legislative votes into one forecast.
- Use the baseline for neutral planning, reporting coverage and resource readiness, not voter targeting or persuasion.

CONFIDENCE
${dataset.status === 'available' ? 'MODERATE: the loaded figures support descriptive historical analysis, but the stated geographic and source limitations remain.' : 'LOW TO MODERATE: the record is partial and should support only the specifically listed outcome or seat observations.'}`;
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

export { summarizeNewsLocally, analyzeContextLocally };
