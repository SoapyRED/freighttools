'use client';

import { useState } from 'react';
import HighlightedCode from './HighlightedCode';

const TABS: { label: string; lang: 'javascript' | 'python' | 'n8n'; code: string }[] = [
  {
    label: 'JavaScript',
    lang: 'javascript',
    code: `// FreightUtils API — JavaScript example
// Calculate loading metres for 10 Euro pallets

const response = await fetch(
  'https://www.freightutils.com/api/ldm?pallet=euro&qty=10'
);
const data = await response.json();

console.log(\`LDM: \${data.ldm}\`);
console.log(\`Utilisation: \${data.utilisation_percent}%\`);
console.log(\`Fits: \${data.fits}\`);`,
  },
  {
    label: 'Python',
    lang: 'python',
    code: `# FreightUtils API — Python example
# Calculate loading metres for 10 Euro pallets

import requests

response = requests.get(
    'https://www.freightutils.com/api/ldm',
    params={'pallet': 'euro', 'qty': 10}
)
data = response.json()

print(f"LDM: {data['ldm']}")
print(f"Utilisation: {data['utilisation_percent']}%")
print(f"Fits: {data['fits']}")`,
  },
  {
    label: 'n8n',
    lang: 'n8n',
    code: `n8n HTTP Request Node Configuration:

Method: GET
URL: https://www.freightutils.com/api/ldm
Query Parameters:
  pallet = euro
  qty = 10

The response JSON can be mapped directly to
downstream nodes. No authentication needed.

All FreightUtils endpoints work the same way —
see the full endpoint reference below.`,
  },
];

export default function QuickstartTabs() {
  const [active, setActive] = useState(0);

  return (
    <div>
      {/* Tab buttons */}
      <div style={{ display: 'flex', gap: 4, marginBottom: -1 }}>
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            style={{
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              cursor: 'pointer',
              border: '1px solid',
              borderBottom: 'none',
              borderRadius: '8px 8px 0 0',
              borderColor: active === i ? 'var(--border, #d8dce6)' : 'transparent',
              background: active === i ? '#1a2332' : 'transparent',
              color: active === i ? '#EF9F27' : 'var(--text-muted, #5a6478)',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Code block */}
      <HighlightedCode
        code={TABS[active].code}
        lang={TABS[active].lang}
        style={{ borderRadius: '0 8px 8px 8px', marginBottom: 0 }}
      />

      {/* Footer note */}
      <p style={{
        fontSize: 13, color: 'var(--text-muted, #5a6478)', marginTop: 12, lineHeight: 1.6,
      }}>
        All endpoints work the same way. No auth, no signup. Full reference below ↓
      </p>
    </div>
  );
}
