/**
 * Convert HS code CSVs to a single JSON file for the application.
 * Run: node lib/data/convert-hs-csv.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Simple CSV parser that handles quoted fields ──────────────────
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/^\uFEFF/, '').split('\n');
  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseLine(line);
    const row = {};
    headers.forEach((h, j) => { row[h] = values[j] ?? ''; });
    rows.push(row);
  }
  return rows;
}

function parseLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

// ── Read source files ──────────────────────────────────────────────
const codesCSV = readFileSync(join(__dirname, 'hs-codes.csv'), 'utf-8');
const sectionsCSV = readFileSync(join(__dirname, 'hs-sections.csv'), 'utf-8');

const rawCodes = parseCSV(codesCSV);
const rawSections = parseCSV(sectionsCSV);

// ── Build sections array ───────────────────────────────────────────
const sections = rawSections.map(s => ({
  numeral: s.section.toLowerCase(),
  name: capitalizeFirst(s.name),
}));

function capitalizeFirst(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Build codes array ──────────────────────────────────────────────
const codes = rawCodes.map(c => ({
  hscode: c.hscode,
  description: c.description,
  level: parseInt(c.level, 10),
  parent: c.parent,
  section: c.section,
}));

// ── Stats ──────────────────────────────────────────────────────────
const chapters = codes.filter(c => c.level === 2);
const headings = codes.filter(c => c.level === 4);
const subheadings = codes.filter(c => c.level === 6);

console.log(`Sections: ${sections.length}`);
console.log(`Chapters (level 2): ${chapters.length}`);
console.log(`Headings (level 4): ${headings.length}`);
console.log(`Subheadings (level 6): ${subheadings.length}`);
console.log(`Total codes: ${codes.length}`);

// ── Write JSON ─────────────────────────────────────────────────────
const output = { sections, codes };
writeFileSync(
  join(__dirname, 'hs-codes.json'),
  JSON.stringify(output),
  'utf-8'
);

console.log(`Written to lib/data/hs-codes.json`);
