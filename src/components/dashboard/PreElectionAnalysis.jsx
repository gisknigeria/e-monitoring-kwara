import { useMemo, useState } from 'react';
import { MdFlashOn } from 'react-icons/md';
import { HISTORICAL_ELECTION_DATASETS, HISTORICAL_ELECTION_RESULTS, getHistoricalDataset, historicalDatasetSummary } from '../../../shared/historicalElectionData.js';

const formatMetric = (value, metric) => `${Number(value || 0).toLocaleString()} ${metric === 'votes' ? 'votes' : metric === 'seats' ? 'seats' : 'wins'}`;

export default function PreElectionAnalysis({ onAnalyze }) {
  const [year, setYear] = useState(2023);
  const [election, setElection] = useState('Governorship');
  const [brief, setBrief] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const summary = historicalDatasetSummary();
  const years = [...new Set(HISTORICAL_ELECTION_DATASETS.map((item) => item.year))].sort((a, b) => b - a);
  const elections = useMemo(() => HISTORICAL_ELECTION_DATASETS.filter((item) => item.year === Number(year)).map((item) => item.election), [year]);
  const dataset = getHistoricalDataset(year, election);
  const result = dataset ? HISTORICAL_ELECTION_RESULTS[dataset.id] : null;
  const maxValue = Math.max(1, ...(result?.parties || []).map((item) => item.value));
  const previous = HISTORICAL_ELECTION_DATASETS
    .filter((item) => item.election === election && item.year < Number(year))
    .sort((a, b) => b.year - a.year)[0];
  const previousResult = previous ? HISTORICAL_ELECTION_RESULTS[previous.id] : null;

  const selectYear = (value) => {
    const nextYear = Number(value);
    const nextElections = HISTORICAL_ELECTION_DATASETS.filter((item) => item.year === nextYear).map((item) => item.election);
    setYear(nextYear);
    if (!nextElections.includes(election)) setElection(nextElections[0] || '');
    setBrief('');
  };

  const generate = async () => {
    if (!dataset || !result) return;
    setLoading(true); setError(''); setBrief('');
    try {
      const response = await onAnalyze({
        analysisMode: 'PRE_ELECTION', generatedAt: new Date().toISOString(),
        selectedDataset: dataset,
        historicalResult: result,
        previousDataset: previous || null,
        previousResult: previousResult || null,
        coverageRegister: HISTORICAL_ELECTION_DATASETS.map(({ id, year: itemYear, election: itemElection, status, level, available, missing }) => ({ id, year: itemYear, election: itemElection, status, level, available, missing })),
        objective: 'Describe historical party performance, changes and data limitations. Do not predict a certain winner, target voters, or recommend political persuasion.',
      });
      setBrief(response.analysis || 'No historical brief was returned.');
    } catch (analysisError) { setError(analysisError.message || 'Historical analysis is unavailable.'); }
    finally { setLoading(false); }
  };

  return <section className="pre-election-dashboard">
    <div className="pre-election-head">
      <div><span className="eyebrow">BEFORE THE NEXT ELECTION</span><h2>Pre-Election Historical Analysis</h2><p>Compare previous Kwara outcomes while keeping incomplete records clearly visible.</p></div>
      <button className="primary action-btn" disabled={loading || !result} onClick={generate}><MdFlashOn /> {loading ? 'Analyzing…' : 'Generate AI Brief'}</button>
    </div>
    <p className="pre-election-caution">Historical results are a baseline, not a forecast. Missing votes remain unavailable and are never converted to zero.</p>

    <div className="pre-coverage-strip">
      <article><span>Datasets registered</span><strong>{summary.total}</strong><small>2019–2024</small></article>
      <article className="complete"><span>Analysis ready</span><strong>{summary.available}</strong><small>Useful numerical coverage</small></article>
      <article className="partial"><span>Partial records</span><strong>{summary.partial}</strong><small>Clearly marked below</small></article>
      <article><span>Election categories</span><strong>{new Set(HISTORICAL_ELECTION_DATASETS.map((item) => item.election)).size}</strong><small>Federal, state and local</small></article>
    </div>

    <div className="pre-filter-card">
      <label><span>Election year</span><select value={year} onChange={(event) => selectYear(event.target.value)}>{years.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span>Election type</span><select value={election} onChange={(event) => { setElection(event.target.value); setBrief(''); }}>{elections.map((item) => <option key={item}>{item}</option>)}</select></label>
      {dataset && <div className="pre-selected-coverage"><span className={`coverage-badge ${dataset.status}`}>{dataset.status === 'available' ? 'Analysis ready' : 'Partial data'}</span><b>{dataset.level}</b><small>{dataset.available}</small></div>}
    </div>

    {dataset && result && <div className="pre-analysis-grid">
      <article className="pre-card">
        <header><div><h3>{year} {election}</h3><p>{result.metric === 'votes' ? 'Recorded party totals' : 'Recorded outcome distribution'}</p></div><span>{dataset.authority}</span></header>
        <div className="historical-party-bars">{result.parties.map((item) => <div key={item.party}><div><strong>{item.party}</strong><b>{formatMetric(item.value, result.metric)}</b></div><span><i style={{ width: `${(item.value / maxValue) * 100}%` }} /></span></div>)}</div>
        <p className="pre-data-note">{result.note}</p>
      </article>
      <article className="pre-card">
        <header><div><h3>Coverage &amp; limitations</h3><p>What this analysis can safely use</p></div></header>
        <div className="pre-limit-list"><div><span>Available</span><b>{dataset.available}</b></div><div className="missing"><span>Still missing</span><b>{dataset.missing}</b></div><div><span>Source</span><a href={dataset.source.url} target="_blank" rel="noreferrer">{dataset.source.name}</a></div>{previous && <div><span>Previous comparison</span><b>{previous.year} {previous.status === 'available' ? 'available' : 'partial'}</b></div>}</div>
      </article>
    </div>}

    {result?.areas?.length > 0 && <article className="pre-card pre-area-card"><header><div><h3>Constituency outcomes</h3><p>{result.metric === 'votes' ? 'Winner and closest listed challenger' : 'Winner record; votes unavailable'}</p></div><b>{result.areas.length} areas</b></header><div className="pre-area-grid">{result.areas.map((area) => <div key={area.name}><span>{area.name}</span><strong>{area.winner} · {area.candidate}</strong>{area.winnerValue != null ? <small>{area.winnerValue.toLocaleString()} vs {area.runnerUp} {area.runnerUpValue.toLocaleString()}</small> : <small>Vote totals not loaded</small>}</div>)}</div></article>}

    {(brief || error) && <article className="pre-card pre-ai-brief"><header><div><h3>AI Historical Brief</h3><p>Neutral interpretation constrained by available coverage</p></div></header>{brief && <div>{brief}</div>}{error && <p className="pre-analysis-error">{error}</p>}</article>}

    <article className="pre-card dataset-register"><header><div><h3>Historical Dataset Register</h3><p>Every missing field is shown so the analysis cannot overstate its evidence.</p></div></header><div className="dataset-register-scroll"><table><thead><tr><th>Year</th><th>Election</th><th>Coverage</th><th>Status</th><th>Missing</th><th>Source</th></tr></thead><tbody>{HISTORICAL_ELECTION_DATASETS.map((item) => <tr key={item.id}><td>{item.year}</td><td>{item.election}</td><td>{item.level}</td><td><span className={`coverage-badge ${item.status}`}>{item.status === 'available' ? 'Ready' : 'Partial'}</span></td><td>{item.missing}</td><td><a href={item.source.url} target="_blank" rel="noreferrer">Open</a></td></tr>)}</tbody></table></div></article>
  </section>;
}
