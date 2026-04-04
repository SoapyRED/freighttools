/**
 * Parse UNECE UN/LOCODE CSV files into a compact JSON file.
 * Run: node scripts/parse-locode.mjs
 */
import { readFileSync, writeFileSync } from 'fs';

import { tmpdir } from 'os';
import { join } from 'path';

const base = join(tmpdir(), 'locode_raw');
const PARTS = [
  join(base, '2024-2 UNLOCODE CodeListPart1.csv'),
  join(base, '2024-2 UNLOCODE CodeListPart2.csv'),
  join(base, '2024-2 UNLOCODE CodeListPart3.csv'),
];

const FUNCTION_MAP = {
  '1': 'port',
  '2': 'rail',
  '3': 'road',
  '4': 'airport',
  '5': 'postal',
  '6': 'icd',
  '7': 'pipeline',
  'B': 'border',
};

function parseCoordinates(raw) {
  if (!raw || raw.trim().length < 5) return null;
  // Format: "5153N 00008W" or "5153S 00008E"
  const m = raw.trim().match(/^(\d{2})(\d{2})([NS])\s+(\d{3})(\d{2})([EW])$/);
  if (!m) return null;
  let lat = parseInt(m[1]) + parseInt(m[2]) / 60;
  let lon = parseInt(m[4]) + parseInt(m[5]) / 60;
  if (m[3] === 'S') lat = -lat;
  if (m[6] === 'W') lon = -lon;
  return { lat: Math.round(lat * 100) / 100, lon: Math.round(lon * 100) / 100 };
}

function parseFunctions(raw) {
  if (!raw) return [];
  const fns = [];
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (FUNCTION_MAP[ch]) fns.push(FUNCTION_MAP[ch]);
  }
  return fns;
}

// Simple CSV line parser (handles quoted fields)
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

const entries = [];
let skipped = 0;

for (const file of PARTS) {
  const lines = readFileSync(file, 'latin1').split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    const fields = parseCSVLine(line);
    // Columns: Change(0), Country(1), Location(2), Name(3), NameWoDiacritics(4),
    //          Subdivision(5), Function(6), Status(7), Date(8), IATA(9), Coordinates(10), Remarks(11)
    const country = (fields[1] || '').trim();
    const locCode = (fields[2] || '').trim();
    const name = (fields[3] || '').trim();
    const nameAscii = (fields[4] || '').trim();

    // Skip header/country rows (no location code)
    if (!locCode || !country || locCode.length !== 3) { skipped++; continue; }
    // Skip entries starting with "." (country headers)
    if (name.startsWith('.')) { skipped++; continue; }

    const fns = parseFunctions(fields[6] || '');
    const coords = parseCoordinates(fields[10] || '');
    const iata = (fields[9] || '').trim() || null;
    const subdivision = (fields[5] || '').trim() || null;
    const status = (fields[7] || '').trim() || null;

    entries.push({
      c: country,           // country code
      l: locCode,           // location code
      n: name,              // name
      a: nameAscii !== name ? nameAscii : undefined, // ascii name (only if different)
      s: subdivision || undefined,  // subdivision
      f: fns.length > 0 ? fns : undefined, // functions
      t: status || undefined,       // status
      i: iata || undefined,         // iata code
      g: coords || undefined,       // geo coordinates
    });
  }
}

console.log(`Parsed: ${entries.length} entries, skipped: ${skipped}`);

// Sort by country then location code
entries.sort((a, b) => a.c.localeCompare(b.c) || a.l.localeCompare(b.l));

// Write compact JSON
const outPath = process.argv[2] || 'lib/data/unlocode.json';
writeFileSync(outPath, JSON.stringify(entries));
const sizeMB = (Buffer.byteLength(JSON.stringify(entries)) / 1024 / 1024).toFixed(1);
console.log(`Written to ${outPath} (${sizeMB} MB, ${entries.length} entries)`);

// Stats
const withCoords = entries.filter(e => e.g).length;
const ports = entries.filter(e => e.f?.includes('port')).length;
const airports = entries.filter(e => e.f?.includes('airport')).length;
const rail = entries.filter(e => e.f?.includes('rail')).length;
console.log(`Ports: ${ports}, Airports: ${airports}, Rail: ${rail}, With coords: ${withCoords}`);
