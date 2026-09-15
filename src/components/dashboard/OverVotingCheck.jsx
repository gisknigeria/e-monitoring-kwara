import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../api/client.js';
import './over-voting-check.css';

const STATUS_LABEL = {
  'exceeds-registered-voters': 'Exceeds registered voters',
  'within-bounds': 'Within registered voters',
  unknown: 'No data at this scope',
};

const finiteNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export function normalizeOverVotingResponse(payload) {
  const value = payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
    ? payload.data
    : payload;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return {
    ...value,
    submittedVotes: finiteNumber(value.submittedVotes),
    pollingUnitsReporting: finiteNumber(value.pollingUnitsReporting),
    registeredVoters: value.registeredVoters == null ? null : finiteNumber(value.registeredVoters),
    excessVotes: finiteNumber(value.excessVotes),
  };
}

export default function OverVotingCheck({ authToken, geography = { state: 'Kwara' } }) {
  const safeGeography = geography || { state: 'Kwara' };
  const params = new URLSearchParams(Object.entries(safeGeography).filter(([, value]) => value));
  const check = useQuery({
    queryKey: ['over-voting', authToken, params.toString()],
    queryFn: ({ signal }) => apiRequest(`/reports/over-voting?${params.toString()}`, authToken, { signal }),
  });
  const checkData = normalizeOverVotingResponse(check.data);

  const scopeLabel = [safeGeography.state, safeGeography.lga, safeGeography.ward, safeGeography.pollingUnit].filter(Boolean).join(' · ') || 'Kwara State';

  return (
    <article className="post-card overvoting-card">
      <header>
        <div>
          <h3>Over-Voting Check</h3>
          <p>Submitted votes vs. registered voters — {scopeLabel}</p>
        </div>
        {checkData && <span className={`overvoting-badge overvoting-${checkData.status}`}>{STATUS_LABEL[checkData.status] || 'Check available'}</span>}
      </header>

      {check.isPending && <p role="status">Checking…</p>}
      {check.isError && <p role="alert">{check.error.message} <button onClick={() => check.refetch()}>Retry</button></p>}

      {checkData && (
        <>
          <div className="overvoting-figures">
            <div><span>Submitted votes</span><b>{checkData.submittedVotes.toLocaleString()}</b></div>
            <div><span>Registered voters</span><b>{checkData.registeredVoters !== null ? checkData.registeredVoters.toLocaleString() : '—'}</b></div>
            <div><span>Polling units reporting</span><b>{checkData.pollingUnitsReporting.toLocaleString()}</b></div>
            {checkData.status === 'exceeds-registered-voters' && (
              <div className="overvoting-excess"><span>Excess votes</span><b>{checkData.excessVotes.toLocaleString()}</b></div>
            )}
          </div>
          {checkData.status === 'unknown' ? (
            <p className="post-card-note">{checkData.note || 'Registered-voter data is unavailable for this scope.'}</p>
          ) : (
            <p className="post-card-note">
              {checkData.registeredVotersSource?.sourceName || 'Registered-voter dataset'}
              {checkData.registeredVotersSource?.sourceVersion ? ` (${checkData.registeredVotersSource.sourceVersion})` : ''}
              {checkData.methodology ? ` · ${checkData.methodology}` : ''}
            </p>
          )}
        </>
      )}
    </article>
  );
}
