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
  const incidents = Array.isArray(context.incidents) ? context.incidents : [];
  const projection = context.projection || {};
  const resultSummary = context.resultSummary || {};
  const selectedParty = String(context.selectedParty || '').trim();
  const party = context.partyAnalysis || null;
  const criticalItems = incidents.filter((incident) => incident?.severity === 'Critical' || incident?.reportType === 'SOS-Emergency');
  const openItems = incidents.filter((incident) => !['Resolved', 'Submitted'].includes(incident?.status));
  const withoutEvidence = openItems.filter((incident) => !Number(incident?.mediaCount));
  const coverage = Number(projection.coverage || resultSummary.submissions || 0);
  const leader = projection.leader || 'No party';
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
