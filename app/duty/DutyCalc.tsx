'use client';

import { useState } from 'react';
import Link from 'next/link';

interface DutyResult {
  commodity_code: string;
  commodity_description: string;
  origin_country: string;
  origin_country_name: string;
  cif_value: number;
  duty_rate: string;
  duty_rate_percent: number;
  duty_amount: number;
  vat_rate: string;
  vat_rate_percent: number;
  vat_amount: number;
  total_import_taxes: number;
  total_landed_cost: number;
  warnings: { type: string; message: string }[];
  disclaimer: string;
}

const COMMON_COUNTRIES = [
  { code: 'CN', name: 'China' }, { code: 'US', name: 'United States' },
  { code: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' }, { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' }, { code: 'TW', name: 'Taiwan' },
  { code: 'VN', name: 'Vietnam' }, { code: 'TH', name: 'Thailand' },
  { code: 'TR', name: 'Turkey' }, { code: 'BD', name: 'Bangladesh' },
  { code: 'PK', name: 'Pakistan' }, { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' }, { code: 'BE', name: 'Belgium' },
  { code: 'ES', name: 'Spain' }, { code: 'PL', name: 'Poland' },
  { code: 'MY', name: 'Malaysia' }, { code: 'ID', name: 'Indonesia' },
  { code: 'BR', name: 'Brazil' }, { code: 'MX', name: 'Mexico' },
  { code: 'CA', name: 'Canada' }, { code: 'AU', name: 'Australia' },
  { code: 'CH', name: 'Switzerland' }, { code: 'SE', name: 'Sweden' },
  { code: 'IE', name: 'Ireland' }, { code: 'CZ', name: 'Czechia' },
  { code: 'RO', name: 'Romania' }, { code: 'HU', name: 'Hungary' },
  { code: 'ZA', name: 'South Africa' }, { code: 'EG', name: 'Egypt' },
  { code: 'SA', name: 'Saudi Arabia' }, { code: 'AE', name: 'UAE' },
  { code: 'SG', name: 'Singapore' }, { code: 'HK', name: 'Hong Kong' },
  { code: 'NZ', name: 'New Zealand' }, { code: 'NO', name: 'Norway' },
];

const INCOTERMS = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'];

export default function DutyCalc() {
  const [code, setCode] = useState('');
  const [country, setCountry] = useState('CN');
  const [customsValue, setCustomsValue] = useState('');
  const [freight, setFreight] = useState('');
  const [insurance, setInsurance] = useState('');
  const [incoterm, setIncoterm] = useState('FOB');
  const [result, setResult] = useState<DutyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorHint, setErrorHint] = useState<string>('');
  const [errorSuggestionUrl, setErrorSuggestionUrl] = useState<string>('');

  const handleCalculate = async () => {
    if (!code || code.length < 6) { setError('Enter a commodity code (minimum 6 digits)'); setErrorHint(''); setErrorSuggestionUrl(''); return; }
    if (!customsValue || Number(customsValue) <= 0) { setError('Enter a customs value'); setErrorHint(''); setErrorSuggestionUrl(''); return; }

    setError('');
    setErrorHint('');
    setErrorSuggestionUrl('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/duty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodityCode: code,
          originCountry: country,
          customsValue: Number(customsValue),
          freightCost: Number(freight) || 0,
          insuranceCost: Number(insurance) || 0,
          incoterm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Calculation failed');
        setErrorHint(data.hint ?? '');
        setErrorSuggestionUrl(data.suggestion_url ?? '');
        return;
      }
      setResult(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const card: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 12, overflow: 'hidden', marginBottom: 20,
  };
  const cardHead: React.CSSProperties = {
    background: 'var(--bg-card)', padding: '12px 18px',
    borderBottom: '1px solid var(--border)',
    borderLeft: '3px solid var(--page-cat, var(--cat-customs))',
    fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
  };
  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: 16,
    border: '1px solid var(--border)', borderRadius: 8,
    background: 'var(--bg-card)', color: 'var(--text)', fontFamily: 'inherit',
  };
  const lbl: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.5px', color: 'var(--text-faint)', marginBottom: 6, display: 'block',
  };
  const btn: React.CSSProperties = {
    width: '100%', padding: '14px', fontSize: 16, fontWeight: 700, color: '#fff',
    background: '#e87722', border: 'none', borderRadius: 8, cursor: 'pointer',
    marginTop: 16,
  };

  return (
    <>
      {/* Input form */}
      <div style={card}>
        <div style={cardHead}>Import Details</div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lbl}>Commodity Code (UK Tariff)</label>
              <input style={inp} placeholder="e.g. 6204430000" value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))} />
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>
                <Link href="/hs" style={{ color: '#e87722', textDecoration: 'none' }}>Look up HS code &rarr;</Link>
              </div>
            </div>
            <div>
              <label style={lbl}>Country of Origin</label>
              <select style={{ ...inp, fontSize: 14 }} value={country} onChange={e => setCountry(e.target.value)}>
                {COMMON_COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={lbl}>Customs Value (&pound;)</label>
              <input style={inp} type="number" placeholder="10000" value={customsValue}
                onChange={e => setCustomsValue(e.target.value)} min={0} step={0.01} />
            </div>
            <div>
              <label style={lbl}>Freight (&pound;)</label>
              <input style={inp} type="number" placeholder="500" value={freight}
                onChange={e => setFreight(e.target.value)} min={0} step={0.01} />
            </div>
            <div>
              <label style={lbl}>Insurance (&pound;)</label>
              <input style={inp} type="number" placeholder="50" value={insurance}
                onChange={e => setInsurance(e.target.value)} min={0} step={0.01} />
            </div>
            <div>
              <label style={lbl}>Incoterm</label>
              <select style={{ ...inp, fontSize: 14 }} value={incoterm} onChange={e => setIncoterm(e.target.value)}>
                {INCOTERMS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleCalculate} disabled={loading}
            style={{ ...btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Looking up rates...' : 'Calculate Duty & VAT'}
          </button>

          {error && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', fontSize: 14 }}>
              <div style={{ fontWeight: 600 }}>{error}</div>
              {errorHint && (
                <div style={{ fontSize: 13, marginTop: 6, color: '#7f1d1d', lineHeight: 1.5 }}>
                  {errorHint}
                </div>
              )}
              {errorSuggestionUrl && (
                <div style={{ marginTop: 10 }}>
                  <Link
                    href={errorSuggestionUrl}
                    style={{
                      display: 'inline-block',
                      background: '#e87722', color: '#fff',
                      padding: '7px 14px', borderRadius: 6,
                      fontSize: 13, fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    Use HS Code Lookup →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          <div style={card}>
            <div style={cardHead}>
              Duty & VAT Estimate — {result.commodity_code}
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
                {result.commodity_description}
              </p>

              {/* Breakdown table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, marginBottom: 16 }}>
                <tbody>
                  {[
                    { label: 'CIF Value', rate: '', amount: result.cif_value, note: `Customs value + freight + insurance (${incoterm} basis)` },
                    { label: 'Import Duty', rate: result.duty_rate, amount: result.duty_amount, note: 'Third-country duty rate' },
                    { label: 'VAT', rate: result.vat_rate, amount: result.vat_amount, note: `On CIF + duty (\u00a3${(result.cif_value + result.duty_amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })})` },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 0', fontWeight: 600, color: 'var(--text)' }}>{row.label}</td>
                      <td style={{ padding: '12px 8px', color: '#e87722', fontWeight: 600, textAlign: 'center', width: 80 }}>{row.rate}</td>
                      <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600, color: 'var(--text)', fontFamily: 'monospace' }}>
                        &pound;{row.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid var(--border)' }}>
                    <td style={{ padding: '14px 0', fontWeight: 800, color: 'var(--text)', fontSize: 16 }}>Total Import Taxes</td>
                    <td></td>
                    <td style={{ padding: '14px 0', textAlign: 'right', fontWeight: 800, color: '#e87722', fontSize: 18, fontFamily: 'monospace' }}>
                      &pound;{result.total_import_taxes.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 0', fontWeight: 600, color: 'var(--text-muted)' }}>Total Landed Cost</td>
                    <td></td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      &pound;{result.total_landed_cost.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Links */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
                <Link href={`/hs?code=${result.commodity_code.slice(0, 6)}`} style={{ color: '#e87722', textDecoration: 'none' }}>
                  Look up HS code &rarr;
                </Link>
                <Link href="/incoterms" style={{ color: '#e87722', textDecoration: 'none' }}>
                  Check Incoterms &rarr;
                </Link>
                <a href={`https://www.trade-tariff.service.gov.uk/commodities/${result.commodity_code}`}
                  target="_blank" rel="noopener noreferrer" style={{ color: '#e87722', textDecoration: 'none' }}>
                  View on GOV.UK Trade Tariff &rarr;
                </a>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.warnings.map((w, i) => (
                <div key={i} className={`warning-badge ${w.type}`}>{w.message}</div>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.6 }}>
            {result.disclaimer}
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: '1fr 1fr 1fr 1fr'"],
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
