/**
 * Batch replace hardcoded colors with CSS variables across all .tsx files.
 * Run: node scripts/fix-colors.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const APP_DIR = 'app';

// Replacements: [pattern, replacement, description]
// Order matters — more specific patterns first
const REPLACEMENTS = [
  // Text colors → var(--text)
  // Match color property in inline styles: color: '#1a2332' or color: '#1e2535'
  // But NOT when it's background or border context
  [/color: '#1a2332'/g, "color: 'var(--text)'", 'text-color-1a2332'],
  [/color: '#1e2535'/g, "color: 'var(--text)'", 'text-color-1e2535'],
  [/color: "#1a2332"/g, 'color: "var(--text)"', 'text-color-1a2332-dq'],
  [/color: "#1e2535"/g, 'color: "var(--text)"', 'text-color-1e2535-dq'],

  // Muted text → var(--text-muted)
  [/color: '#5a6478'/g, "color: 'var(--text-muted)'", 'text-muted-5a6478'],
  [/color: "#5a6478"/g, 'color: "var(--text-muted)"', 'text-muted-5a6478-dq'],

  // Faint text → var(--text-faint)
  [/color: '#8f9ab0'/g, "color: 'var(--text-faint)'", 'text-faint-8f9ab0'],
  [/color: "#8f9ab0"/g, 'color: "var(--text-faint)"', 'text-faint-8f9ab0-dq'],

  // Background white → var(--bg-card) — but not #fff inside rgb/hex combos
  [/background: '#f7f8fa'/g, "background: 'var(--bg)'", 'bg-f7f8fa'],
  [/background: '#f8fafc'/g, "background: 'var(--bg)'", 'bg-f8fafc'],

  // Border colors → var(--border)
  [/border: '1px solid #d8dce6'/g, "border: '1px solid var(--border)'", 'border-d8dce6-1px'],
  [/border: '1px solid #e5e7eb'/g, "border: '1px solid var(--border)'", 'border-e5e7eb-1px'],
  [/border: '1.5px solid #d8dce6'/g, "border: '1.5px solid var(--border)'", 'border-d8dce6-1.5px'],
  [/border: '2px solid #d8dce6'/g, "border: '2px solid var(--border)'", 'border-d8dce6-2px'],
  [/borderBottom: '1px solid #d8dce6'/g, "borderBottom: '1px solid var(--border)'", 'borderBot-d8dce6'],
  [/borderBottom: '1px solid #e5e7eb'/g, "borderBottom: '1px solid var(--border)'", 'borderBot-e5e7eb'],
  [/borderTop: '1px solid #d8dce6'/g, "borderTop: '1px solid var(--border)'", 'borderTop-d8dce6'],

  // Nav dropdown colors
  [/color: '#c9cdd6'/g, "color: 'var(--text-muted)'", 'nav-c9cdd6'],
  [/border: '1px solid #2d3a4d'/g, "border: '1px solid var(--navy-border)'", 'nav-border-2d3a4d'],
];

// Patterns to SKIP (these are intentional dark backgrounds, not text)
const SKIP_PATTERNS = [
  /background: '#1a2332'/,
  /background: '#243044'/,
  // Don't replace color: '#fff' (white text on dark bg is intentional)
  // Don't replace color: '#e87722' (orange accent is intentional)
];

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === 'node_modules' || entry === '.next') continue;
    const stat = statSync(full);
    if (stat.isDirectory()) files.push(...walk(full));
    else if (full.endsWith('.tsx') || full.endsWith('.ts')) files.push(full);
  }
  return files;
}

let totalReplacements = 0;
const fileChanges = {};

const files = walk(APP_DIR);
for (const file of files) {
  let content = readFileSync(file, 'utf8');
  let original = content;
  let fileTotal = 0;

  for (const [pattern, replacement, desc] of REPLACEMENTS) {
    const matches = content.match(pattern);
    if (matches) {
      fileTotal += matches.length;
      content = content.replace(pattern, replacement);
    }
  }

  if (content !== original) {
    writeFileSync(file, content);
    fileChanges[file] = fileTotal;
    totalReplacements += fileTotal;
    console.log(`  ${file}: ${fileTotal} replacements`);
  }
}

console.log(`\nTotal: ${totalReplacements} replacements across ${Object.keys(fileChanges).length} files`);
