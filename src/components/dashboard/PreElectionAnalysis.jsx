import { useEffect, useMemo, useState } from 'react';
import { MdFlashOn, MdMap, MdNavigateBefore } from 'react-icons/md';
import { HISTORICAL_ELECTION_DATASETS, HISTORICAL_ELECTION_RESULTS, getHistoricalDataset } from '../../../shared/historicalElectionData.js';
import { getRegistrationLocationOptions } from '../../../shared/electionData.js';

const formatMetric = (value, metric) => `${Number(value || 0).toLocaleString()} ${metric === 'votes' ? 'votes' : metric === 'seats' ? 'seats' : 'wins'}`;
const PARTY_COLORS = { APC: '#2563eb', PDP: '#dc2626', SDP: '#16a34a', LP: '#a855f7', NNPP: '#f59e0b', 'Other parties': '#94a3b8' };
const normalizeName = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export default function PreElectionAnalysis({ onAnalyze, initialSelection = null, onShowMap }) {
  const [year, setYear] = useState(2023);
  const [election, setElection] = useState('Governorship');
  const [brief, setBrief] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sentiment');
  const [selectedLga, setSelectedLga] = useState(initialSelection?.lga || '');
  const [selectedWard, setSelectedWard] = useState(initialSelection?.ward || '');
  const [selectedPollingUnit, setSelectedPollingUnit] = useState(initialSelection?.pollingUnit || '');
  const years = [...new Set(HISTORICAL_ELECTION_DATASETS.map((item) => item.year))].sort((a, b) => b - a);
  const elections = useMemo(() => HISTORICAL_ELECTION_DATASETS.filter((item) => item.year === Number(year)).map((item) => item.election), [year]);
  const dataset = getHistoricalDataset(year, election);
  const result = dataset ? HISTORICAL_ELECTION_RESULTS[dataset.id] : null;
  const maxValue = Math.max(1, ...(result?.parties || []).map((item) => item.value));
  const isGovernorSentiment = Number(year) === 2023 && election === 'Governorship';
  const totalPartyVotes = (result?.parties || []).reduce((sum, item) => sum + Number(item.value || 0), 0);
  const selectedArea = result?.areas?.find((area) => normalizeName(area.name) === normalizeName(selectedLga));
  const registeredLga = getRegistrationLocationOptions('Kwara').lgas.find((name) => normalizeName(name) === normalizeName(selectedLga)) || selectedLga;
  const locationOptions = getRegistrationLocationOptions('Kwara', registeredLga, selectedWard);

  useEffect(() => {
    if (!initialSelection?.lga) return;
    setSelectedLga(initialSelection.lga);
    setSelectedWard(initialSelection.ward || '');
    setSelectedPollingUnit(initialSelection.pollingUnit || '');
  }, [initialSelection]);

  const selectYear = (value) => {
    const nextYear = Number(value);
    const nextElections = HISTORICAL_ELECTION_DATASETS.filter((item) => item.year === nextYear).map((item) => item.election);
    setYear(nextYear);
    setSelectedLga(''); setSelectedWard(''); setSelectedPollingUnit('');
    if (!nextElections.includes(election)) setElection(nextElections[0] || '');
  };

  const openLga = (name) => {
    setSelectedLga(name);
    setSelectedWard('');
    setSelectedPollingUnit('');
  };

  const showSentimentMap = () => {
    if (!isGovernorSentiment || !result?.areas?.length) return;
    const topParties = result.parties.slice(0, 3).map((item) => ({
      party: item.party,
      value: Number(item.value || 0),
      percentage: totalPartyVotes ? (Number(item.value || 0) / totalPartyVotes) * 100 : 0,
      color: PARTY_COLORS[item.party] || '#94a3b8',
    }));
    const otherValue = result.parties.slice(3).reduce((sum, item) => sum + Number(item.value || 0), 0);
    onShowMap?.({
      mode: 'historical-sentiment',
      election: '2023 Governorship',
      sourceNote: result.note,
      partyShares: [...topParties, { party: 'Others', value: otherValue, percentage: totalPartyVotes ? (otherValue / totalPartyVotes) * 100 : 0, color: '#94a3b8' }],
      byLga: Object.fromEntries(result.areas.map((area) => [area.name, {
        winner: area.winner,
        runnerUp: area.runnerUp,
        winnerValue: area.winnerValue,
        runnerUpValue: area.runnerUpValue,
        margin: Number(area.winnerValue || 0) - Number(area.runnerUpValue || 0),
        color: PARTY_COLORS[area.winner] || '#94a3b8',
        listedShares: [
          { party: area.winner, value: Number(area.winnerValue || 0), percentage: (Number(area.winnerValue || 0) / Math.max(1, Number(area.winnerValue || 0) + Number(area.runnerUpValue || 0))) * 100 },
          { party: area.runnerUp, value: Number(area.runnerUpValue || 0), percentage: (Number(area.runnerUpValue || 0) / Math.max(1, Number(area.winnerValue || 0) + Number(area.runnerUpValue || 0))) * 100 },
        ],
      }])),
    });
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
        objective: 'Use every loaded dataset to produce a universal statewide historical assessment. Compare like-for-like offices and parties across years, identify historically strong, weak, and closely contested LGAs wherever the records support that conclusion, and recommend practical work for data quality, field coverage, incident response, compliance, and result documentation. Do not base the brief only on selectedView, present historical competitiveness as a guaranteed future win, target voters, or recommend political persuasion.',
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
      <div className="pre-election-actions">
        {activeTab === 'sentiment' && isGovernorSentiment && <button className="secondary action-btn sentiment-map-button" onClick={showSentimentMap}><MdMap /> Show on map</button>}
        {activeTab === 'history' && <button className="primary action-btn" disabled={loading || !result} onClick={generate}><MdFlashOn /> {loading ? 'Analyzing…' : 'Generate Brief'}</button>}
      </div>
    </div>
    <p className="pre-election-caution">Historical results are a baseline, not a forecast. Missing votes remain unavailable and are never converted to zero.</p>

    <div className="pre-section-tabs" role="tablist" aria-label="Pre-election analysis sections">
      <button type="button" role="tab" aria-selected={activeTab === 'sentiment'} className={activeTab === 'sentiment' ? 'active' : ''} onClick={() => { setActiveTab('sentiment'); setYear(2023); setElection('Governorship'); }}>Sentiment</button>
      <button type="button" role="tab" aria-selected={activeTab === 'history'} className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>History</button>
    </div>

    {activeTab === 'history' && (brief || error) && <article className="pre-card pre-generated-brief"><header><div><h3>Statewide Historical Operations Brief</h3><p>Uses every loaded Kwara election dataset to assess party performance, LGA competitiveness, and operational readiness.</p></div></header>{brief && <div>{brief}</div>}{error && <p className="pre-analysis-error">{error}</p>}</article>}

    {activeTab === 'history' && <div className="pre-filter-card">
      <label><span>Election year</span><select value={year} onChange={(event) => selectYear(event.target.value)}>{years.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span>Election type</span><select value={election} onChange={(event) => { setElection(event.target.value); setSelectedLga(''); setSelectedWard(''); setSelectedPollingUnit(''); }}>{elections.map((item) => <option key={item}>{item}</option>)}</select></label>
    </div>}

    {activeTab === 'sentiment' && isGovernorSentiment && result && <>
      <section className="pre-sentiment-summary">
        <header><div><span className="eyebrow">TEMPORARY SENTIMENT BASELINE</span><h3>2023 Governorship Historical Sentiment</h3><p>The latest governorship result is being used as a historical support signal until newer sentiment data is available.</p></div><button type="button" onClick={showSentimentMap}><MdMap /> Interactive map</button></header>
        <div className="sentiment-party-grid">{result.parties.map((item) => {
          const share = totalPartyVotes ? (Number(item.value) / totalPartyVotes) * 100 : 0;
          return <article key={item.party} style={{ '--party-color': PARTY_COLORS[item.party] || '#94a3b8' }}><i /><span>{item.party}</span><strong>{share.toFixed(1)}%</strong><small>{Number(item.value).toLocaleString()} recorded votes</small><div><b style={{ width: `${share}%` }} /></div></article>;
        })}</div>
        <div className="sentiment-legend">{result.parties.map((item) => <span key={item.party}><i style={{ background: PARTY_COLORS[item.party] || '#94a3b8' }} />{item.party}</span>)}<em>Color indicates the recorded LGA winner; strength reflects winning margin.</em></div>
      </section>

      <article className="pre-card historical-drilldown-card">
        <header><div><h3>Historical Result Drill-down</h3><p>LGA results are recorded; ward and polling-unit views inherit the LGA signal until certified lower-level totals are loaded.</p></div><b>{selectedPollingUnit ? 'Polling unit' : selectedWard ? 'Ward' : selectedLga ? 'Ward list' : '16 LGAs'}</b></header>
        <nav className="historical-breadcrumb" aria-label="Historical result level">
          <button type="button" className={!selectedLga ? 'active' : ''} onClick={() => { setSelectedLga(''); setSelectedWard(''); setSelectedPollingUnit(''); }}>Kwara</button>
          {selectedLga && <><span>›</span><button type="button" className={!selectedWard ? 'active' : ''} onClick={() => { setSelectedWard(''); setSelectedPollingUnit(''); }}>{selectedLga}</button></>}
          {selectedWard && <><span>›</span><button type="button" className={!selectedPollingUnit ? 'active' : ''} onClick={() => setSelectedPollingUnit('')}>{selectedWard}</button></>}
          {selectedPollingUnit && <><span>›</span><b>{selectedPollingUnit}</b></>}
        </nav>

        {!selectedLga && <div className="historical-lga-grid">{result.areas.map((area) => {
          const margin = Number(area.winnerValue || 0) - Number(area.runnerUpValue || 0);
          return <button type="button" key={area.name} onClick={() => openLga(area.name)} style={{ '--party-color': PARTY_COLORS[area.winner] || '#94a3b8' }}><i /><div><strong>{area.name}</strong><span>{area.winner} historical lead</span><small>{area.winnerValue.toLocaleString()} vs {area.runnerUp} {area.runnerUpValue.toLocaleString()}</small></div><b>+{margin.toLocaleString()}</b></button>;
        })}</div>}

        {selectedLga && !selectedWard && <><div className="historical-level-summary" style={{ '--party-color': PARTY_COLORS[selectedArea?.winner] || '#94a3b8' }}><i /><div><span>{selectedLga} LGA recorded winner</span><strong>{selectedArea?.winner || 'No result loaded'}</strong><small>{selectedArea?.winnerValue?.toLocaleString() || '—'} vs {selectedArea?.runnerUp || '—'} {selectedArea?.runnerUpValue?.toLocaleString() || ''}</small></div><button type="button" onClick={showSentimentMap}><MdMap /> Map</button></div><div className="historical-child-grid">{locationOptions.wards.map((ward) => <button type="button" key={ward} onClick={() => { setSelectedWard(ward); setSelectedPollingUnit(''); }}><div><strong>{ward}</strong><span style={{ color: PARTY_COLORS[selectedArea?.winner] || '#94a3b8' }}>{selectedArea?.winner || 'Unknown'} proxy</span></div><small>LGA-level sentiment · open polling units</small></button>)}</div>{!locationOptions.wards.length && <p className="pre-data-note">No registered ward hierarchy is available for this LGA.</p>}</>}

        {selectedLga && selectedWard && !selectedPollingUnit && <><button type="button" className="historical-back" onClick={() => setSelectedWard('')}><MdNavigateBefore /> Back to {selectedLga} wards</button><div className="historical-level-summary" style={{ '--party-color': PARTY_COLORS[selectedArea?.winner] || '#94a3b8' }}><i /><div><span>{selectedWard} inherited sentiment</span><strong>{selectedArea?.winner || 'Unknown'} proxy</strong><small>This is not a certified ward winner; it inherits the {selectedLga} LGA result.</small></div></div><div className="historical-child-grid polling-units">{locationOptions.pollingUnits.map((unit) => <button type="button" key={unit} onClick={() => setSelectedPollingUnit(unit)}><div><strong>{unit}</strong><span style={{ color: PARTY_COLORS[selectedArea?.winner] || '#94a3b8' }}>{selectedArea?.winner || 'Unknown'} proxy</span></div><small>Open polling-unit record</small></button>)}</div>{!locationOptions.pollingUnits.length && <p className="pre-data-note">No registered polling units are available for this ward.</p>}</>}

        {selectedPollingUnit && <section className="historical-pu-record"><button type="button" className="historical-back" onClick={() => setSelectedPollingUnit('')}><MdNavigateBefore /> Back to {selectedWard}</button><div style={{ '--party-color': PARTY_COLORS[selectedArea?.winner] || '#94a3b8' }}><i /><span>Polling-unit record</span><h4>{selectedPollingUnit}</h4><p>{selectedWard} · {selectedLga} LGA</p><strong>{selectedArea?.winner || 'Unknown'} historical sentiment proxy</strong><small>No certified 2023 polling-unit party totals are loaded. This indicator inherits the recorded LGA winner and must not be treated as a polling-unit result.</small></div></section>}
      </article>
    </>}

    {activeTab === 'history' && dataset && result && <div className="pre-analysis-grid single">
      <article className="pre-card">
        <header><div><h3>{year} {election}</h3><p>{result.metric === 'votes' ? 'Recorded party totals' : 'Recorded outcome distribution'}</p></div><span>{dataset.authority}</span></header>
        <div className="historical-party-bars">{result.parties.map((item) => <div key={item.party}><div><strong>{item.party}</strong><b>{formatMetric(item.value, result.metric)}</b></div><span><i style={{ width: `${(item.value / maxValue) * 100}%` }} /></span></div>)}</div>
        <p className="pre-data-note">{result.note}</p>
      </article>
    </div>}

    {activeTab === 'history' && result?.areas?.length > 0 && <article className="pre-card pre-area-card"><header><div><h3>Constituency outcomes</h3><p>{result.metric === 'votes' ? 'Winner and closest listed challenger' : 'Winner record; votes unavailable'}</p></div><b>{result.areas.length} areas</b></header><div className="pre-area-grid">{result.areas.map((area) => <div key={area.name}><span>{area.name}</span><strong>{area.winner} · {area.candidate}</strong>{area.winnerValue != null ? <small>{area.winnerValue.toLocaleString()} vs {area.runnerUp} {area.runnerUpValue.toLocaleString()}</small> : <small>Vote totals not loaded</small>}</div>)}</div></article>}

  </section>;
}
