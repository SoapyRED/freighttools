'use client';

import { useState, useEffect, useCallback } from 'react';
import { PALLET_PRESETS, PALLET_PRESET_MAP } from '@/lib/data/pallets';
import { VEHICLES } from '@/lib/data/vehicles';
import AdUnit from '@/app/components/AdUnit';
import RelatedTools from '@/app/components/RelatedTools';
import DataTimestamp from '@/app/components/DataTimestamp';
import { calculateLdm, type LdmResult } from '@/lib/calculations/ldm';
import { useUrlSync, getUrlParams } from '@/app/hooks/useUrlState';

const defaultResult: LdmResult = {
  ldm: 0.4,
  vehicle: { name: '13.6m Artic Trailer', lengthM: 13.6, maxPayloadKg: 24000 },
  utilisationPercent: 2.94,
  palletSpaces: { used: 1, available: 33 },
  totalWeightKg: null,
  fits: true,
  warnings: [],
};

export default function LdmCalc() {
  const [palletType, setPalletType] = useState('euro');
  const [lengthMm, setLengthMm] = useState(1200);
  const [widthMm, setWidthMm] = useState(800);
  const [qty, setQty] = useState(1);
  const [stackable, setStackable] = useState(false);
  const [stackFactor, setStackFactor] = useState(2);
  const [weightPerPallet, setWeightPerPallet] = useState<string>('');
  const [vehicleId, setVehicleId] = useState('artic');
  const [customVehicleLen, setCustomVehicleLen] = useState<string>('');
  const [result, setResult] = useState<LdmResult>(defaultResult);

  // Load from URL params on mount
  useEffect(() => {
    const p = getUrlParams();
    if (p.pallet && PALLET_PRESET_MAP[p.pallet]) {
      setPalletType(p.pallet);
      setLengthMm(PALLET_PRESET_MAP[p.pallet].lengthMm);
      setWidthMm(PALLET_PRESET_MAP[p.pallet].widthMm);
    }
    if (p.qty) setQty(parseInt(p.qty, 10) || 1);
    if (p.stackable === '1') setStackable(true);
    if (p.stack) setStackFactor(parseInt(p.stack, 10) || 2);
    if (p.weight) setWeightPerPallet(p.weight);
    if (p.vehicle) setVehicleId(p.vehicle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state to URL
  useUrlSync({
    pallet: palletType !== 'custom' ? palletType : undefined,
    qty: qty > 1 ? qty : undefined,
    stackable: stackable || undefined,
    stack: stackable && stackFactor !== 2 ? stackFactor : undefined,
    weight: weightPerPallet || undefined,
    vehicle: vehicleId !== 'artic' ? vehicleId : undefined,
  });

  const recalculate = useCallback(() => {
    const res = calculateLdm({
      lengthMm,
      widthMm,
      qty,
      stackable,
      stackFactor,
      weightPerPalletKg: weightPerPallet !== '' ? parseFloat(weightPerPallet) : null,
      vehicleId: vehicleId !== 'custom' ? vehicleId : undefined,
      customVehicleLengthM: vehicleId === 'custom' && customVehicleLen !== ''
        ? parseFloat(customVehicleLen)
        : null,
    });
    setResult(res);
  }, [lengthMm, widthMm, qty, stackable, stackFactor, weightPerPallet, vehicleId, customVehicleLen]);

  useEffect(() => { recalculate(); }, [recalculate]);

  const handlePalletTypeChange = (val: string) => {
    setPalletType(val);
    const preset = PALLET_PRESET_MAP[val];
    if (preset) {
      setLengthMm(preset.lengthMm);
      setWidthMm(preset.widthMm);
    }
  };

  const isCustomPallet = palletType === 'custom';
  const isCustomVehicle = vehicleId === 'custom';
  const utilPct = Math.min(result.utilisationPercent, 100);
  const progressClass = result.utilisationPercent > 100 ? 'danger' : result.utilisationPercent > 85 ? 'high' : '';

  const s = {
    main: { maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' } as React.CSSProperties,
    hero: { background: '#1a2332', padding: '40px 20px 48px', textAlign: 'center' as const },
    h1: { fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 12 },
    card: { background: '#fff', border: '1px solid #d8dce6', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)', overflow: 'hidden' } as React.CSSProperties,
    cardHeader: { background: '#1a2332', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 10 } as React.CSSProperties,
    cardBody: { padding: 24 } as React.CSSProperties,
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 } as React.CSSProperties,
    formGroup: { display: 'flex', flexDirection: 'column' as const, gap: 6 },
    divider: { gridColumn: '1 / -1', border: 'none', borderTop: '1px solid #eef0f4', margin: '4px 0' } as React.CSSProperties,
    toggleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f7f8fa', border: '1.5px solid #d8dce6', borderRadius: 8 } as React.CSSProperties,
    ldmDisplay: { textAlign: 'center' as const, padding: '28px 24px 20px', borderBottom: '1px solid #eef0f4' },
    ldmNumber: { fontSize: 'clamp(52px, 12vw, 72px)', fontWeight: 800, color: '#1a2332', lineHeight: 1, letterSpacing: -2 } as React.CSSProperties,
    utilSection: { padding: '20px 24px', borderBottom: '1px solid #eef0f4' } as React.CSSProperties,
    statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#eef0f4' } as React.CSSProperties,
    statCell: { background: '#fff', padding: '16px 20px' } as React.CSSProperties,
  };

  return (
    <>
      {/* Hero */}
      <div style={s.hero}>
        <h1 style={s.h1}>
          Loading Metres <span style={{ color: '#e87722' }}>Calculator</span>
        </h1>
        <p style={{ fontSize: 16, color: '#8f9ab0', maxWidth: 500, margin: '0 auto' }}>
          Calculate loading metres for road freight — European and North American trailer standards
        </p>
      </div>

      <main style={s.main}>
        {/* ── INPUT CARD ── */}
        <section style={s.card} aria-label="LDM calculator inputs">
          <div style={s.cardHeader}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0 }}>Inputs</h2>
            <span style={{ background: '#e87722', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Real-time</span>
          </div>
          <div style={s.cardBody}>
            <div style={s.formGrid}>

              {/* Pallet type */}
              <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                <label htmlFor="palletType">Pallet Type</label>
                <select id="palletType" value={palletType} onChange={e => handlePalletTypeChange(e.target.value)}>
                  {PALLET_PRESETS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                  <option value="custom">Custom dimensions…</option>
                </select>
              </div>

              {/* Length */}
              <div style={s.formGroup}>
                <label htmlFor="palletLength">Length <span style={{ fontWeight: 400, textTransform: 'none', color: '#8f9ab0', letterSpacing: 0 }}>(mm)</span></label>
                <input
                  type="number" id="palletLength"
                  value={lengthMm}
                  onChange={e => setLengthMm(Number(e.target.value))}
                  readOnly={!isCustomPallet}
                  style={{ background: isCustomPallet ? '#fff' : '#f7f8fa' }}
                  min={1} max={9999}
                />
              </div>

              {/* Width */}
              <div style={s.formGroup}>
                <label htmlFor="palletWidth">Width <span style={{ fontWeight: 400, textTransform: 'none', color: '#8f9ab0', letterSpacing: 0 }}>(mm)</span></label>
                <input
                  type="number" id="palletWidth"
                  value={widthMm}
                  onChange={e => setWidthMm(Number(e.target.value))}
                  readOnly={!isCustomPallet}
                  style={{ background: isCustomPallet ? '#fff' : '#f7f8fa' }}
                  min={1} max={9999}
                />
              </div>

              {/* Quantity */}
              <div style={s.formGroup}>
                <label htmlFor="palletQty">Number of Pallets</label>
                <input type="number" id="palletQty" value={qty} onChange={e => setQty(Number(e.target.value))} min={1} max={999} />
              </div>

              {/* Weight */}
              <div style={s.formGroup}>
                <label htmlFor="weightPerPallet">Weight per Pallet <span style={{ fontWeight: 400, textTransform: 'none', color: '#8f9ab0', letterSpacing: 0 }}>(kg, optional)</span></label>
                <input type="number" id="weightPerPallet" value={weightPerPallet} onChange={e => setWeightPerPallet(e.target.value)} placeholder="e.g. 500" min={0} />
              </div>

              <hr style={s.divider} />

              {/* Stackable toggle */}
              <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                <label>Stackable?</label>
                <div style={s.toggleRow}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e2535' }}>Pallets can be stacked</div>
                    <div style={{ fontSize: 12, color: '#5a6478', marginTop: 1 }}>Halves the floor space needed when enabled</div>
                  </div>
                  <label style={{ position: 'relative', width: 44, height: 24, flexShrink: 0, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={stackable}
                      onChange={e => setStackable(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                    />
                    <span style={{
                      position: 'absolute', inset: 0,
                      background: stackable ? '#e87722' : '#d8dce6',
                      borderRadius: 12,
                      transition: 'background 0.2s',
                    }}>
                      <span style={{
                        position: 'absolute',
                        width: 18, height: 18,
                        left: stackable ? 23 : 3,
                        top: 3,
                        background: '#fff',
                        borderRadius: '50%',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                      }} />
                    </span>
                  </label>
                </div>
              </div>

              {/* Stack factor */}
              {stackable && (
                <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                  <label htmlFor="stackFactor">Max Stack Height</label>
                  <select id="stackFactor" value={stackFactor} onChange={e => setStackFactor(Number(e.target.value))}>
                    <option value={2}>2 high (double stack)</option>
                    <option value={3}>3 high (triple stack)</option>
                  </select>
                </div>
              )}

              <hr style={s.divider} />

              {/* Vehicle */}
              <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                <label htmlFor="vehicleType">Vehicle Type</label>
                <select id="vehicleType" value={vehicleId} onChange={e => setVehicleId(e.target.value)}>
                  {VEHICLES.map(v => (
                    <option key={v.id} value={v.id}>{v.name} — {v.euroPalletsFloor} euro pallets, {v.maxPayloadKg.toLocaleString()} kg max</option>
                  ))}
                  <option value="custom">Custom vehicle length…</option>
                </select>
              </div>

              {/* Custom vehicle length */}
              {isCustomVehicle && (
                <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                  <label htmlFor="customVehicleLength">Custom Vehicle Length <span style={{ fontWeight: 400, textTransform: 'none', color: '#8f9ab0', letterSpacing: 0 }}>(metres)</span></label>
                  <input type="number" id="customVehicleLength" value={customVehicleLen} onChange={e => setCustomVehicleLen(e.target.value)} placeholder="e.g. 8.0" min={0.5} max={30} step={0.1} />
                </div>
              )}

            </div>
          </div>
        </section>

        {/* ── RESULTS CARD ── */}
        <section style={{ ...s.card, marginTop: 20 }} aria-label="LDM calculation results" aria-live="polite">
          <div style={{ ...s.cardHeader, background: '#243044' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0 }}>Results</h2>
          </div>

          {/* LDM headline */}
          <div style={s.ldmDisplay}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#5a6478', marginBottom: 8 }}>
              Loading Metres Required
            </div>
            <div style={s.ldmNumber}>
              {result.ldm.toFixed(2)}
              <span style={{ fontSize: 22, fontWeight: 600, color: '#8f9ab0', letterSpacing: 0 }}> LDM</span>
            </div>
          </div>

          {/* Utilisation */}
          <div style={s.utilSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#5a6478', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Vehicle Utilisation</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#1a2332' }}>{result.utilisationPercent.toFixed(1)}%</span>
            </div>
            <div style={{ fontSize: 13, color: '#5a6478', marginBottom: 10 }}>
              {result.vehicle.name} ({result.vehicle.lengthM !== null ? `${result.vehicle.lengthM}m available` : 'enter length above'})
            </div>
            <div className="progress-track">
              <div
                className={`progress-fill ${progressClass}`}
                style={{ width: `${utilPct}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div style={s.statsGrid}>
            <div style={s.statCell}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5a6478', marginBottom: 4 }}>Pallet Spaces</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1a2332' }}>
                {result.palletSpaces.available
                  ? `${result.palletSpaces.used} of ${result.palletSpaces.available}`
                  : result.palletSpaces.used > 0 ? `${result.palletSpaces.used}` : '—'}
              </div>
              <div style={{ fontSize: 12, color: '#5a6478', marginTop: 2 }}>floor positions used</div>
            </div>
            <div style={s.statCell}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5a6478', marginBottom: 4 }}>Total Weight</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1a2332' }}>
                {result.totalWeightKg !== null ? `${result.totalWeightKg.toLocaleString('en-GB')} kg` : '—'}
              </div>
              <div style={{ fontSize: 12, color: '#5a6478', marginTop: 2 }}>
                {result.totalWeightKg !== null && result.vehicle.maxPayloadKg
                  ? `of ${result.vehicle.maxPayloadKg.toLocaleString('en-GB')} kg capacity`
                  : 'enter weight per pallet'}
              </div>
            </div>
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.warnings.map((w, i) => (
                <div key={i} className={`warning-badge ${w.type}`}>
                  <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.3 }}>
                    {w.type === 'danger' ? '⚠️' : w.type === 'warn' ? '⚡' : 'ℹ️'}
                  </span>
                  <span>{w.message}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── SEO CONTENT ── */}
        <div style={{ marginTop: 48 }}>

          {/* What are loading metres */}
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
              What Are Loading Metres?
            </h2>
            <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 14, lineHeight: 1.7 }}>
              A <strong style={{ color: '#1e2535' }}>loading metre (LDM)</strong> is the standard unit used to measure the floor space a consignment occupies in a road freight trailer. One loading metre represents a strip of trailer floor that is <strong style={{ color: '#1e2535' }}>1 metre long and the full width of the trailer</strong>.
            </p>
            <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 14, lineHeight: 1.7 }}>
              The standard European trailer width is 2.4m (EN 283), while North American 53ft trailers are 2.59m (102 inches) wide. This calculator automatically adjusts the divisor based on your selected vehicle type. Unlike CBM (cubic metres), which measures total volume, LDM measures only floor area — a tall, light pallet takes up the same LDM as a short, heavy one.
            </p>

            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a2332', margin: '20px 0 8px' }}>The Loading Metres Formula</h3>
            <div className="code-block">
              LDM = (Length × Width × Quantity) ÷ 2.4<br/>
              <span className="comment">— Where Length and Width are in metres, 2.4m = standard trailer width</span><br/>
              <br/>
              <span className="comment">If stackable:</span><br/>
              LDM = (Length × Width × Quantity) ÷ 2.4 ÷ Stack Factor
            </div>

            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a2332', margin: '20px 0 8px' }}>Common Pallet LDM Reference</h3>
            <div className="ref-table-wrap">
              <table className="ref-table">
                <thead>
                  <tr>
                    <th>Pallet Type</th>
                    <th>Dimensions</th>
                    <th>1 Pallet</th>
                    <th>5 Pallets</th>
                    <th>10 Pallets</th>
                    <th>33 Pallets</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Euro Pallet (EUR 1)</td><td>1200 × 800 mm</td><td className="highlight">0.40 LDM</td><td>2.00 LDM</td><td>4.00 LDM</td><td className="highlight">13.20 LDM</td></tr>
                  <tr><td>UK Standard (EUR 2)</td><td>1200 × 1000 mm</td><td className="highlight">0.50 LDM</td><td>2.50 LDM</td><td>5.00 LDM</td><td>16.50 LDM</td></tr>
                  <tr><td>Half Pallet (EUR 6)</td><td>800 × 600 mm</td><td className="highlight">0.20 LDM</td><td>1.00 LDM</td><td>2.00 LDM</td><td>6.60 LDM</td></tr>
                  <tr><td>Quarter Pallet</td><td>600 × 400 mm</td><td className="highlight">0.10 LDM</td><td>0.50 LDM</td><td>1.00 LDM</td><td>3.30 LDM</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Vehicle table */}
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
              How Many Pallets Fit in a Truck?
            </h2>
            <div className="ref-table-wrap">
              <table className="ref-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Internal Length</th>
                    <th>Max LDM</th>
                    <th>Euro Pallets (floor)</th>
                    <th>Max Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {VEHICLES.map(v => (
                    <tr key={v.id}>
                      <td>{v.name}</td>
                      <td>{v.lengthM} m</td>
                      <td className="highlight">{v.lengthM} LDM</td>
                      <td>{v.euroPalletsFloor}</td>
                      <td>{v.maxPayloadKg.toLocaleString('en-GB')} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Groupage Pricing & LDM */}
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
              Loading Metres and Groupage Pricing
            </h2>
            <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 14, lineHeight: 1.7 }}>
              In European groupage (LTL) freight, loading metres are the primary unit for quoting and invoicing. Unlike full truckload (FTL) shipments where you pay a flat rate for the whole vehicle, groupage shipments share trailer space with other consignments. The carrier needs a fair way to allocate costs, and LDM provides that by measuring exactly how much floor space your goods occupy.
            </p>
            <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 14, lineHeight: 1.7 }}>
              Most European freight exchanges and carrier rate cards quote a per-LDM rate. A typical groupage rate might be quoted as, for example, &pound;35 per LDM for a UK-to-Germany lane. If your consignment measures 2.4 LDM, the freight charge would be 2.4 &times; &pound;35 = &pound;84, before fuel surcharges and other accessorial charges. This makes accurate LDM calculation directly relevant to your transport budget.
            </p>
            <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 14, lineHeight: 1.7 }}>
              Many carriers also apply a minimum charge, often expressed as a minimum LDM (commonly 1 LDM or 2 LDM) or a minimum weight threshold. Even if your single pallet only measures 0.4 LDM, you may be charged for 1 LDM minimum. Understanding this helps you decide whether to consolidate shipments to get better value from the minimum charge.
            </p>

            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a2332', margin: '20px 0 8px' }}>How Stackability Affects LDM and Cost</h3>
            <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 14, lineHeight: 1.7 }}>
              Stackability has a direct impact on your freight cost because it halves (or thirds) the floor space your consignment uses. When a carrier can double-stack pallets, two pallets occupy the floor space of one. This means your LDM is divided by the stack factor: a stack factor of 2 halves the LDM, and a stack factor of 3 reduces it to one third.
            </p>
            <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 14, lineHeight: 1.7 }}>
              For pallets to be genuinely stackable, the goods must be able to bear the weight of another pallet on top without damage, the pallet height must allow stacking within the trailer&apos;s internal height (typically 2.65m to 2.70m for a standard curtainsider), and the goods must be stable enough to remain safe during transit. Fragile goods, top-heavy loads, and irregularly shaped items are generally non-stackable regardless of physical dimensions.
            </p>
            <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 14, lineHeight: 1.7 }}>
              When booking groupage freight, always confirm stackability with your carrier in advance. Declaring goods as stackable when they are not creates a safety risk and may result in damage claims or surcharges. Conversely, failing to declare stackable goods as such means you pay for more floor space than you need.
            </p>

            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a2332', margin: '20px 0 8px' }}>Worked Example: Groupage Quote</h3>
            <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 14, lineHeight: 1.7 }}>
              Consider a shipment of 8 Euro pallets (1200 &times; 800 mm), each weighing 400 kg, non-stackable, from Manchester to Munich. First, calculate the LDM: 8 pallets &times; 0.4 LDM each = 3.2 LDM. The total weight is 3,200 kg. A carrier quoting &pound;45 per LDM with a 1 LDM minimum would charge 3.2 &times; &pound;45 = &pound;144. However, many carriers also check whether the weight exceeds a per-LDM weight threshold (commonly 1,750 kg per LDM or 1,850 kg per LDM). At 3,200 kg across 3.2 LDM, that is exactly 1,000 kg per LDM &mdash; well within typical thresholds, so no weight surcharge applies.
            </p>
            <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 14, lineHeight: 1.7 }}>
              Now consider the same 8 pallets but stackable (stack factor 2). The LDM drops to 1.6 LDM, and the freight charge becomes 1.6 &times; &pound;45 = &pound;72 &mdash; exactly half the cost. However, the weight per LDM now rises to 2,000 kg per LDM, which may trigger a weight surcharge depending on the carrier&apos;s policy. This illustrates why both space and weight must be considered together when planning freight.
            </p>
          </div>

          {/* FAQ */}
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#1a2332', marginBottom: 16, letterSpacing: '-0.3px' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <details className="faq-item">
                <summary>How do I calculate loading metres?</summary>
                <div className="faq-answer">
                  Loading metres are calculated using: <strong>LDM = (Length × Width × Quantity) ÷ 2.4</strong>, where Length and Width are in metres, and 2.4m is the standard trailer width. For a single Euro pallet (1.2m × 0.8m): LDM = (1.2 × 0.8 × 1) ÷ 2.4 = <strong>0.4 LDM</strong>.
                </div>
              </details>
              <details className="faq-item">
                <summary>What is 1 LDM?</summary>
                <div className="faq-answer">
                  One loading metre (1 LDM) represents a strip of trailer floor that is exactly 1 metre long and 2.4 metres wide — the full internal width of a standard European trailer. To put it in context: 2.5 Euro pallets side-by-side equal approximately 1 LDM.
                </div>
              </details>
              <details className="faq-item">
                <summary>How many Euro pallets fit in a 13.6m trailer?</summary>
                <div className="faq-answer">
                  A standard 13.6m articulated trailer can carry <strong>33 Euro pallets</strong> (1200 × 800mm) in a single floor layer. If double-stacked, up to 66 Euro pallets can be carried, subject to height and weight limits.
                </div>
              </details>
              <details className="faq-item">
                <summary>What is the difference between LDM and CBM?</summary>
                <div className="faq-answer">
                  <strong>LDM (Loading Metres)</strong> measures the floor space a consignment occupies in a trailer — used for European road freight. <strong>CBM (Cubic Metres)</strong> measures total volume and is used in air and sea freight. For road freight across the UK and EU, LDM is the standard pricing unit.
                </div>
              </details>
            </div>
          </div>

        </div>

        <DataTimestamp text="Vehicle specifications per EN 283/ISO standards, last verified March 2026" />
        <RelatedTools tools={[
          { href: '/cbm', label: 'Calculate CBM for sea freight' },
          { href: '/pallet', label: 'How many boxes fit on your pallets?' },
          { href: '/containers', label: 'Check container dimensions' },
          { href: '/adr', label: 'Shipping dangerous goods? Check ADR' },
        ]} />

        {/* Ad unit */}
        <AdUnit format="auto" />

      </main>
    </>
  );
}
