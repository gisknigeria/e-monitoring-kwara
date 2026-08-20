const SOURCES = {
  nigeria2: { name: 'Nigeria 2.0 public API', url: 'https://nigeria2.com/api/' },
  inec2019Governor: { name: 'INEC 2019 Kwara EC8E', url: 'https://www.inecnigeria.org/wp-content/uploads/2019/10/KWARA.pdf' },
  inecArchive: { name: 'INEC election-results archive', url: 'https://www.inecnigeria.org/election-results/' },
  irev: { name: 'INEC IReV', url: 'https://inecelectionresults.ng/' },
  mediaNigeria2023: { name: 'Published 2023 constituency winners', url: 'https://www.medianigeria.com/kwara-state-senate-and-house-of-representative-2023-election-winners/' },
  assembly2023: { name: 'Published 2023 Assembly seat summary', url: 'https://von.gov.ng/apc-wins-23-kwara-assembly-seats-pdp-wins-one-seat/' },
  assembly2019: { name: 'Published 2019 Assembly seat summary', url: 'https://tribuneonlineng.com/apc-clears-24-house-of-assembly-seats-in-kwara/' },
  local2024: { name: 'KWSIEC declaration reported by Channels', url: 'https://www.channelstv.com/2024/09/22/apc-wins-all-16-lga-193-wards-lg-election-in-kwara/' },
};

export const HISTORICAL_ELECTION_DATASETS = [
  { id: '2019-president', year: 2019, election: 'Presidential', authority: 'INEC archive', level: 'State summary', status: 'partial', available: 'APC and PDP state totals', missing: 'Other-party and LGA vote breakdown', source: SOURCES.nigeria2 },
  { id: '2019-governor', year: 2019, election: 'Governorship', authority: 'INEC', level: 'State declaration', status: 'available', available: 'Official party totals and winner', missing: 'LGA/ward/PU breakdown', source: SOURCES.inec2019Governor },
  { id: '2019-senate', year: 2019, election: 'Senate', authority: 'INEC archive', level: '3 senatorial districts', status: 'available', available: 'Candidate votes, winners and runners-up', missing: 'Ward/PU breakdown', source: SOURCES.nigeria2 },
  { id: '2019-reps', year: 2019, election: 'House of Representatives', authority: 'INEC archive', level: '6 federal constituencies', status: 'available', available: 'Candidate votes, winners and runners-up', missing: 'Ward/PU breakdown', source: SOURCES.nigeria2 },
  { id: '2019-assembly', year: 2019, election: 'State House of Assembly', authority: 'INEC declaration', level: '24-seat summary', status: 'partial', available: 'Seat distribution', missing: 'Candidate and constituency vote totals', source: SOURCES.assembly2019 },
  { id: '2023-president', year: 2023, election: 'Presidential', authority: 'INEC/IReV', level: 'State totals + LGA transcription', status: 'available', available: 'Declared leading-party totals and LGA pattern data', missing: 'Some PU transcriptions require verification', source: SOURCES.nigeria2 },
  { id: '2023-governor', year: 2023, election: 'Governorship', authority: 'INEC/IReV', level: 'State totals + LGA transcription', status: 'available', available: 'Declared leading-party totals and LGA pattern data', missing: 'Some PU transcriptions require verification', source: SOURCES.nigeria2 },
  { id: '2023-senate', year: 2023, election: 'Senate', authority: 'INEC/IReV', level: '3 senatorial districts', status: 'partial', available: 'Verified winners by district', missing: 'Candidate vote totals', source: SOURCES.mediaNigeria2023 },
  { id: '2023-reps', year: 2023, election: 'House of Representatives', authority: 'INEC/IReV', level: '6 federal constituencies', status: 'partial', available: 'Published winners by constituency', missing: 'Candidate vote totals', source: SOURCES.mediaNigeria2023 },
  { id: '2023-assembly', year: 2023, election: 'State House of Assembly', authority: 'INEC declaration', level: '24-seat summary', status: 'partial', available: 'Seat distribution', missing: 'Candidate and constituency vote totals', source: SOURCES.assembly2023 },
  { id: '2024-local', year: 2024, election: 'Local Government', authority: 'KWSIEC declaration', level: '16 LGAs / 193 wards', status: 'partial', available: 'Declared chairmanship and councillorship outcome', missing: 'Party vote totals by LGA and ward', source: SOURCES.local2024 },
];

export const HISTORICAL_ELECTION_RESULTS = {
  '2019-president': {
    metric: 'votes', totalVotes: 447168,
    parties: [{ party: 'APC', value: 308984 }, { party: 'PDP', value: 138184 }],
    areas: [], note: 'The available archive contains APC and PDP state totals only; other parties are not represented in this record.',
  },
  '2019-governor': {
    metric: 'votes', totalVotes: 453433,
    parties: [{ party: 'APC', value: 331546 }, { party: 'PDP', value: 114754 }, { party: 'Other parties', value: 7133 }],
    areas: [], note: 'Official INEC state declaration. Detailed geographic totals have not yet been loaded.',
  },
  '2019-senate': {
    metric: 'votes',
    parties: [{ party: 'APC', value: 311682 }, { party: 'PDP', value: 147534 }],
    areas: [
      { name: 'Kwara Central', winner: 'APC', candidate: 'Yahaya Ibrahim Oloriegbe', winnerValue: 123808, runnerUp: 'PDP', runnerUpValue: 68994 },
      { name: 'Kwara North', winner: 'APC', candidate: 'Suleiman Sadiq Umar', winnerValue: 98170, runnerUp: 'PDP', runnerUpValue: 33364 },
      { name: 'Kwara South', winner: 'APC', candidate: 'Oyelola Yisa Ashiru', winnerValue: 89704, runnerUp: 'PDP', runnerUpValue: 45176 },
    ], note: 'Party totals shown here aggregate the listed district candidate results.',
  },
  '2019-reps': {
    metric: 'votes',
    parties: [{ party: 'APC', value: 308836 }, { party: 'PDP', value: 149828 }],
    areas: [
      { name: 'Baruten/Kaiama', winner: 'APC', candidate: 'Mohammed Omar Bio', winnerValue: 37914, runnerUp: 'PDP', runnerUpValue: 14476 },
      { name: 'Edu/Moro/Pategi', winner: 'APC', candidate: 'Ahmed Abubakar Ndakenne', winnerValue: 58045, runnerUp: 'PDP', runnerUpValue: 19144 },
      { name: 'Ekiti/Isin/Irepodun/Oke-Ero', winner: 'APC', candidate: 'Abdulraheem Olawuyi', winnerValue: 33386, runnerUp: 'PDP', runnerUpValue: 26954 },
      { name: 'Ifelodun/Offa/Oyun', winner: 'APC', candidate: 'Kayode Tijani Ismail', winnerValue: 54410, runnerUp: 'PDP', runnerUpValue: 19449 },
      { name: 'Ilorin East/Ilorin South', winner: 'APC', candidate: 'Abdulganiyu Saka Olododo', winnerValue: 56496, runnerUp: 'PDP', runnerUpValue: 27737 },
      { name: 'Ilorin West/Asa', winner: 'APC', candidate: 'Abdulyekeen Sadiq Alajagusi', winnerValue: 68585, runnerUp: 'PDP', runnerUpValue: 42068 },
    ], note: 'Party totals shown here aggregate the listed constituency candidate results.',
  },
  '2019-assembly': { metric: 'seats', totalSeats: 24, parties: [{ party: 'APC', value: 24 }], areas: [], note: 'Seat distribution only; constituency vote totals are not loaded.' },
  '2023-president': {
    metric: 'votes',
    parties: [{ party: 'APC', value: 263572 }, { party: 'PDP', value: 136909 }, { party: 'LP', value: 31166 }, { party: 'NNPP', value: 3142 }],
    areas: [
      { name: 'Asa', winner: 'APC', candidate: 'Bola Tinubu', winnerValue: 12129, runnerUp: 'PDP', runnerUpValue: 8228 },
      { name: 'Baruten', winner: 'APC', candidate: 'Bola Tinubu', winnerValue: 20139, runnerUp: 'PDP', runnerUpValue: 8296 },
      { name: 'Edu', winner: 'APC', candidate: 'Bola Tinubu', winnerValue: 16171, runnerUp: 'PDP', runnerUpValue: 11546 },
      { name: 'Ekiti', winner: 'APC', candidate: 'Bola Tinubu', winnerValue: 5180, runnerUp: 'PDP', runnerUpValue: 3198 },
      { name: 'Ifelodun', winner: 'APC', candidate: 'Bola Tinubu', winnerValue: 13902, runnerUp: 'PDP', runnerUpValue: 5320 },
      { name: 'Ilorin East', winner: 'APC', candidate: 'Bola Tinubu', winnerValue: 22710, runnerUp: 'PDP', runnerUpValue: 11884 },
      { name: 'Ilorin South', winner: 'APC', candidate: 'Bola Tinubu', winnerValue: 19964, runnerUp: 'PDP', runnerUpValue: 9781 },
      { name: 'Ilorin West', winner: 'APC', candidate: 'Bola Tinubu', winnerValue: 42231, runnerUp: 'PDP', runnerUpValue: 25724 },
      { name: 'Irepodun', winner: 'APC', candidate: 'Bola Tinubu', winnerValue: 9921, runnerUp: 'PDP', runnerUpValue: 5622 },
      { name: 'Isin', winner: 'APC', candidate: 'Bola Tinubu', winnerValue: 3996, runnerUp: 'PDP', runnerUpValue: 2136 },
      { name: 'Kaiama', winner: 'APC', candidate: 'Bola Tinubu', winnerValue: 13300, runnerUp: 'PDP', runnerUpValue: 5685 },
      { name: 'Moro', winner: 'APC', candidate: 'Bola Tinubu', winnerValue: 13477, runnerUp: 'PDP', runnerUpValue: 5802 },
      { name: 'Offa', winner: 'APC', candidate: 'Bola Tinubu', winnerValue: 16536, runnerUp: 'PDP', runnerUpValue: 3023 },
      { name: 'Oke-Ero', winner: 'APC', candidate: 'Bola Tinubu', winnerValue: 5129, runnerUp: 'PDP', runnerUpValue: 2527 },
      { name: 'Oyun', winner: 'APC', candidate: 'Bola Tinubu', winnerValue: 8457, runnerUp: 'PDP', runnerUpValue: 4063 },
      { name: 'Pategi', winner: 'APC', candidate: 'Bola Tinubu', winnerValue: 8604, runnerUp: 'PDP', runnerUpValue: 4736 },
    ], note: 'Declared leading-party state totals are used above. LGA figures are independent sheet transcriptions and do not yet reconcile to the declared total, so they are pattern evidence only.',
  },
  '2023-governor': {
    metric: 'votes',
    parties: [{ party: 'APC', value: 273424 }, { party: 'PDP', value: 155490 }, { party: 'SDP', value: 18922 }],
    areas: [
      { name: 'Asa', winner: 'APC', candidate: 'Abdulrahman Abdulrazaq', winnerValue: 7407, runnerUp: 'PDP', runnerUpValue: 5219 },
      { name: 'Baruten', winner: 'APC', candidate: 'Abdulrahman Abdulrazaq', winnerValue: 19187, runnerUp: 'PDP', runnerUpValue: 4661 },
      { name: 'Edu', winner: 'APC', candidate: 'Abdulrahman Abdulrazaq', winnerValue: 12098, runnerUp: 'PDP', runnerUpValue: 9967 },
      { name: 'Ekiti', winner: 'APC', candidate: 'Abdulrahman Abdulrazaq', winnerValue: 4003, runnerUp: 'PDP', runnerUpValue: 2352 },
      { name: 'Ifelodun', winner: 'APC', candidate: 'Abdulrahman Abdulrazaq', winnerValue: 11051, runnerUp: 'PDP', runnerUpValue: 5286 },
      { name: 'Ilorin East', winner: 'APC', candidate: 'Abdulrahman Abdulrazaq', winnerValue: 12708, runnerUp: 'PDP', runnerUpValue: 7365 },
      { name: 'Ilorin South', winner: 'APC', candidate: 'Abdulrahman Abdulrazaq', winnerValue: 11919, runnerUp: 'PDP', runnerUpValue: 6553 },
      { name: 'Ilorin West', winner: 'APC', candidate: 'Abdulrahman Abdulrazaq', winnerValue: 30763, runnerUp: 'PDP', runnerUpValue: 20874 },
      { name: 'Irepodun', winner: 'APC', candidate: 'Abdulrahman Abdulrazaq', winnerValue: 7060, runnerUp: 'PDP', runnerUpValue: 4109 },
      { name: 'Isin', winner: 'APC', candidate: 'Abdulrahman Abdulrazaq', winnerValue: 3867, runnerUp: 'PDP', runnerUpValue: 1916 },
      { name: 'Kaiama', winner: 'APC', candidate: 'Abdulrahman Abdulrazaq', winnerValue: 9160, runnerUp: 'PDP', runnerUpValue: 3344 },
      { name: 'Moro', winner: 'APC', candidate: 'Abdulrahman Abdulrazaq', winnerValue: 11154, runnerUp: 'PDP', runnerUpValue: 4579 },
      { name: 'Offa', winner: 'APC', candidate: 'Abdulrahman Abdulrazaq', winnerValue: 9857, runnerUp: 'PDP', runnerUpValue: 4020 },
      { name: 'Oke-Ero', winner: 'APC', candidate: 'Abdulrahman Abdulrazaq', winnerValue: 5947, runnerUp: 'PDP', runnerUpValue: 2544 },
      { name: 'Oyun', winner: 'APC', candidate: 'Abdulrahman Abdulrazaq', winnerValue: 4787, runnerUp: 'PDP', runnerUpValue: 2971 },
      { name: 'Pategi', winner: 'APC', candidate: 'Abdulrahman Abdulrazaq', winnerValue: 9026, runnerUp: 'PDP', runnerUpValue: 3892 },
    ], note: 'Top-three declared state totals are loaded. LGA figures are independent sheet transcriptions and do not yet reconcile to the declared total, so they are pattern evidence only.',
  },
  '2023-senate': {
    metric: 'wins', parties: [{ party: 'APC', value: 3 }],
    areas: [
      { name: 'Kwara Central', winner: 'APC', candidate: 'Saliu Mustapha' },
      { name: 'Kwara North', winner: 'APC', candidate: 'Sadiq Suleiman Umar' },
      { name: 'Kwara South', winner: 'APC', candidate: 'Lola Ashiru' },
    ], note: 'Winner-only record. Missing vote totals are not treated as zero.',
  },
  '2023-reps': {
    metric: 'wins', parties: [{ party: 'APC', value: 6 }],
    areas: [
      { name: 'Baruten/Kaiama', winner: 'APC', candidate: 'Mohammed Omar Bio' },
      { name: 'Edu/Moro/Pategi', winner: 'APC', candidate: 'Saba Ahmed Adam' },
      { name: 'Asa/Ilorin West', winner: 'APC', candidate: 'Muktar Tolani Shagaya' },
      { name: 'Offa/Oyun/Ifelodun', winner: 'APC', candidate: 'Tijjani Kayode Ismail' },
      { name: 'Ilorin East/South', winner: 'APC', candidate: 'Aluko Ahmed Yinka' },
      { name: 'Ekiti/Isin/Irepodun/Oke-Ero', winner: 'APC', candidate: 'Raheem Tunji Olawuyi' },
    ], note: 'Winner-only secondary record awaiting candidate vote totals from official sheets.',
  },
  '2023-assembly': { metric: 'seats', totalSeats: 24, parties: [{ party: 'APC', value: 23 }, { party: 'PDP', value: 1 }], areas: [], note: 'Seat distribution only; constituency vote totals are not loaded.' },
  '2024-local': { metric: 'wins', parties: [{ party: 'APC', value: 209 }], areas: [], note: 'KWSIEC declared APC winners in 16 chairmanship and 193 councillorship contests. Detailed vote totals are not publicly loaded.' },
};

export function historicalDatasetSummary() {
  const available = HISTORICAL_ELECTION_DATASETS.filter((item) => item.status === 'available').length;
  return { total: HISTORICAL_ELECTION_DATASETS.length, available, partial: HISTORICAL_ELECTION_DATASETS.length - available };
}

export function getHistoricalDataset(year, election) {
  return HISTORICAL_ELECTION_DATASETS.find((item) => item.year === Number(year) && item.election === election) || null;
}
