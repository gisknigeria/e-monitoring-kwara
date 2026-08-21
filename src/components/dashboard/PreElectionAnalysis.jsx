import { useMemo, useState } from 'react';
import { MdFlashOn } from 'react-icons/md';
import { HISTORICAL_ELECTION_DATASETS, HISTORICAL_ELECTION_RESULTS, getHistoricalDataset } from '../../../shared/historicalElectionData.js';

const formatMetric = (value, metric) => `${Number(value || 0).toLocaleString()} ${metric === 'votes' ? 'votes' : metric === 'seats' ? 'seats' : 'wins'}`;

export default function PreElectionAnalysis({ onAnalyze }) {
  const [year, setYear] = useState(2023);
  const [election, setElection] = useState('Governorship');
  const [brief, setBrief] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const years = [...new Set(HISTORICAL_ELECTION_DATASETS.map((item) => item.year))].sort((a, b) => b - a);
  const elections = useMemo(() => HISTORICAL_ELECTION_DATASETS.filter((item) => item.year === Number(year)).map((item) => item.election), [year]);
  const dataset = getHistoricalDataset(year, election);
  const result = dataset ? HISTORICAL_ELECTION_RESULTS[dataset.id] : null;
  const maxValue = Math.max(1, ...(result?.parties || []).map((item) => item.value));

  const selectYear = (value) => {
    const nextYear = Number(value);
    const nextElections = HISTORICAL_ELECTION_DATASETS.filter((item) => item.year === nextYear).map((item) => item.election);
    setYear(nextYear);
    if (!nextElections.includes(election)) setElection(nextElections[0] || '');
  };

  const generate = async () => {
    if (!dataset || !result) return;
    setLoading(true); setError(''); setBrief('');
    try {
      const response = await onAnalyze({
        analysisMode: 'PRE_ELECTION', generatedAt: new Date().toISOString(),
        analysisScope: 'ALL_LOADED_HISTORICAL_DATASETS',
        jurisdictionFacts: {
          state: 'Kwara',
          lgaCount: 16,
          wardCount: 193,
          instruction: 'Kwara State has exactly 16 Local Government Areas. Never state or imply that Kwara has 18 LGAs.',
        },
        selectedView: { dataset, result },
        historicalDatasets: HISTORICAL_ELECTION_DATASETS.map((item) => ({
          dataset: item,
          result: HISTORICAL_ELECTION_RESULTS[item.id],
        })),
        objective: 'Use every loaded dataset to produce a statewide historical assessment and neutral operational decisions. Compare like-for-like offices across years. Do not base the brief only on selectedView, predict a certain winner, target voters, or recommend political persuasion.',
      });
      const analysis = String(response.analysis || '').trim();
      if (!analysis) throw new Error('The analysis service returned an empty brief. Please try again.');
      setBrief(analysis);
    } catch (analysisError) { setError(analysisError.message || 'Historical analysis is unavailable.'); }
    finally { setLoading(false); }
  };

  return <section className="pre-election-dashboard">
    <div className="pre-election-head">
      <div><span className="eyebrow">BEFORE THE NEXT ELECTION</span><h2>Pre-Election Historical Analysis</h2><p>Compare previous Kwara outcomes while keeping incomplete records clearly visible.</p></div>
      <button className="primary action-btn" disabled={loading || !result} onClick={generate}><MdFlashOn /> {loading ? 'Analyzing…' : 'Generate AI Brief'}</button>
    </div>
    <p className="pre-election-caution">Historical results are a baseline, not a forecast. Missing votes remain unavailable and are never converted to zero.</p>

    {(brief || error) && <article className="pre-card pre-ai-brief"><header><div><h3>AI Statewide Historical Brief</h3><p>Uses every loaded Kwara election dataset, regardless of the chart selected below.</p></div></header>{brief && <div>{brief}</div>}{error && <p className="pre-analysis-error">{error}</p>}</article>}

    <div className="pre-filter-card">
      <label><span>Election year</span><select value={year} onChange={(event) => selectYear(event.target.value)}>{years.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span>Election type</span><select value={election} onChange={(event) => setElection(event.target.value)}>{elections.map((item) => <option key={item}>{item}</option>)}</select></label>
    </div>

    {dataset && result && <div className="pre-analysis-grid single">
      <article className="pre-card">
        <header><div><h3>{year} {election}</h3><p>{result.metric === 'votes' ? 'Recorded party totals' : 'Recorded outcome distribution'}</p></div><span>{dataset.authority}</span></header>
        <div className="historical-party-bars">{result.parties.map((item) => <div key={item.party}><div><strong>{item.party}</strong><b>{formatMetric(item.value, result.metric)}</b></div><span><i style={{ width: `${(item.value / maxValue) * 100}%` }} /></span></div>)}</div>
        <p className="pre-data-note">{result.note}</p>
      </article>
    </div>}

    {result?.areas?.length > 0 && <article className="pre-card pre-area-card"><header><div><h3>Constituency outcomes</h3><p>{result.metric === 'votes' ? 'Winner and closest listed challenger' : 'Winner record; votes unavailable'}</p></div><b>{result.areas.length} areas</b></header><div className="pre-area-grid">{result.areas.map((area) => <div key={area.name}><span>{area.name}</span><strong>{area.winner} · {area.candidate}</strong>{area.winnerValue != null ? <small>{area.winnerValue.toLocaleString()} vs {area.runnerUp} {area.runnerUpValue.toLocaleString()}</small> : <small>Vote totals not loaded</small>}</div>)}</div></article>}

  </section>;
}
