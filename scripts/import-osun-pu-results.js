import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const electionUrl = 'https://www.nigeriaopendata.com/elections/election/osun-governorship-2026';
const outputFile = join(dirname(fileURLToPath(import.meta.url)), '..', 'server', 'data', 'osun2026PollingUnitResults.json');
const headers = { Accept: 'text/html', 'User-Agent': 'Kwara-Election-Monitor/1.0 prepared-results-import' };

const decodeText = value => String(value || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ')
  .trim();

const getHtml = async url => {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(45_000) });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
};

const parseLgaPage = (html, lgaId) => {
  const lga = decodeText(html.match(/Wards in\s+([^<]+)/i)?.[1]);
  if (!lga) throw new Error(`Could not read LGA ${lgaId}`);
  const rows = [];
  const wardBlocks = html.split('<div class="col-12 col-lg-6 reveal">').slice(1);
  for (const wardBlock of wardBlocks) {
    const ward = decodeText(wardBlock.match(/class="geo-name"[^>]*>([\s\S]*?)<\/div>/i)?.[1]);
    if (!ward) continue;
    const puBlocks = wardBlock.split(/<div style="padding:9px 10px;background:var\(--surface-3\);border-radius:6px;border-left:3px solid[^>]*>/i).slice(1);
    for (const block of puBlocks) {
      const puCode = block.match(/29\/\d{2}\/\d{2}\/\d{3}/)?.[0] || '';
      const pollingUnit = decodeText(block.match(/font-weight:700;font-size:0\.78rem[^>]*>([\s\S]*?)<\/div>/i)?.[1]);
      const resultArea = block.slice(0, block.search(/Total\s+[\d,]+/i) + 40);
      const results = [];
      for (const match of resultArea.matchAll(/>\s*([A-Z][A-Z0-9-]{0,9})\s*<span[^>]*>\s*([\d,]+)\s*<\/span>/g)) {
        const party = match[1];
        const votes = Number(match[2].replace(/,/g, ''));
        if (!results.some(item => item.party === party)) results.push({ party, votes });
      }
      if (puCode && pollingUnit && results.length) rows.push({
        id: `published-${puCode.replaceAll('/', '-')}`,
        lga,
        ward,
        pollingUnit,
        puCode,
        results,
      });
    }
  }
  return rows;
};

const mainHtml = await getHtml(electionUrl);
const lgaIds = [...new Set([...mainHtml.matchAll(/\/elections\/election\/osun-governorship-2026\/lga\/(\d+)/g)].map(match => match[1]))];
if (lgaIds.length !== 30) throw new Error(`Expected 30 Osun LGAs, found ${lgaIds.length}`);

const rows = [];
for (let offset = 0; offset < lgaIds.length; offset += 5) {
  const batch = lgaIds.slice(offset, offset + 5);
  const pages = await Promise.all(batch.map(async id => ({ id, html: await getHtml(`${electionUrl}/lga/${id}`) })));
  pages.forEach(({ id, html }) => rows.push(...parseLgaPage(html, id)));
  console.log(`Imported ${Math.min(offset + batch.length, lgaIds.length)}/${lgaIds.length} LGAs (${rows.length} polling units)`);
}

rows.sort((a, b) => `${a.lga}|${a.ward}|${a.puCode}`.localeCompare(`${b.lga}|${b.ward}|${b.puCode}`));
if (rows.length < 3_700) throw new Error(`Prepared source returned only ${rows.length} polling-unit results`);
await mkdir(dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify({
  sourceName: 'NigeriaOpenData — Osun State Governorship Election 2026',
  sourceUrl: electionUrl,
  sourceNote: 'Prepared polling-unit vote figures aggregated from official INEC EC8A result-sheet scans.',
  importedAt: new Date().toISOString(),
  rows,
}, null, 2)}\n`, 'utf8');
console.log(`Saved ${rows.length} polling-unit results to ${outputFile}`);
