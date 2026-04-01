'use client';

import { useMemo } from 'react';
import { VEHICLE_MAP } from '@/lib/data/vehicles';

interface LdmResult {
  ldm: number;
  vehicle: { name: string; lengthM: number | null; maxPayloadKg: number | null };
  utilisationPercent: number;
  palletSpaces: { used: number; available: number | null };
  fits: boolean;
  warnings: { type: string; message: string }[];
}

interface Props {
  lengthMm: number;
  widthMm: number;
  qty: number;
  stackable: boolean;
  stackFactor: number;
  vehicleId: string;
  result: LdmResult;
}

const PAD = 8;       // padding inside trailer outline
const GAP = 3;       // gap between pallets
const SVG_W = 620;   // viewBox width

export default function TrailerViz({ lengthMm, widthMm, qty, stackable, stackFactor, vehicleId, result }: Props) {
  const viz = useMemo(() => {
    const v = VEHICLE_MAP[vehicleId];
    const trailerL = v?.lengthM ?? result.vehicle.lengthM ?? 13.6;
    const trailerW = v?.widthM ?? 2.4;
    const palletL = lengthMm / 1000;
    const palletW = widthMm / 1000;

    // SVG dimensions — trailer drawn horizontally (length = x-axis, width = y-axis)
    const innerW = SVG_W - PAD * 2;
    const scale = innerW / trailerL;
    const innerH = trailerW * scale;
    const svgH = innerH + PAD * 2;

    // Pallet placement
    const palletsAcross = palletW > 0 ? Math.floor(trailerW / palletW) : 0;
    const floorQty = stackable && stackFactor > 1 ? Math.ceil(qty / stackFactor) : qty;

    const pallets: { x: number; y: number; w: number; h: number }[] = [];
    if (palletsAcross > 0 && palletL > 0 && floorQty > 0) {
      const pxW = palletW * scale;  // pallet width in SVG units (across trailer)
      const pxL = palletL * scale;  // pallet length in SVG units (along trailer)
      let placed = 0;
      let rowX = PAD;

      while (placed < floorQty && rowX + pxL <= PAD + innerW + 0.5) {
        for (let col = 0; col < palletsAcross && placed < floorQty; col++) {
          const x = rowX;
          const y = PAD + col * pxW;
          // Check the pallet fits within trailer width
          if (y + pxW <= PAD + innerH + 0.5) {
            pallets.push({ x, y, w: pxL - GAP, h: pxW - GAP });
            placed++;
          }
        }
        rowX += pxL;
      }
    }

    const used = result.palletSpaces.used;
    const available = result.palletSpaces.available;
    const ldm = result.ldm;
    const util = result.utilisationPercent;

    return { trailerL, trailerW, svgH, innerW, innerH, scale, pallets, palletsAcross, floorQty, used, available, ldm, util };
  }, [lengthMm, widthMm, qty, stackable, stackFactor, vehicleId, result]);

  const { svgH, pallets, ldm, util, used, available, trailerL } = viz;

  return (
    <section style={{ marginTop: 20 }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: '#1a2332', padding: '10px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Trailer Layout
          </span>
          <span style={{ fontSize: 12, color: '#8f9ab0' }}>
            {trailerL}m trailer · top-down view
          </span>
        </div>

        {/* SVG */}
        <div style={{ padding: '16px 20px', background: '#0f1724' }}>
          <svg
            viewBox={`0 0 ${SVG_W} ${svgH}`}
            width="100%"
            preserveAspectRatio="xMidYMin meet"
            style={{ display: 'block', maxHeight: 220 }}
          >
            {/* Trailer outline */}
            <rect
              x={PAD} y={PAD}
              width={viz.innerW} height={viz.innerH}
              rx={4} ry={4}
              fill="#1e2a3d" stroke="#374151" strokeWidth={1.5}
            />

            {/* Cab indicator (right side) */}
            <rect
              x={PAD + viz.innerW - 2} y={PAD + 4}
              width={6} height={viz.innerH - 8}
              rx={2} fill="#374151"
            />

            {/* Placed pallets */}
            {pallets.map((p, i) => (
              <g key={i}>
                <rect
                  x={p.x + 1} y={p.y + 1}
                  width={p.w - 1} height={p.h - 1}
                  rx={2} fill="#EF9F27" opacity={0.85}
                />
                {stackable && (
                  <text
                    x={p.x + p.w / 2} y={p.y + p.h / 2 + 1}
                    textAnchor="middle" dominantBaseline="central"
                    fill="#fff" fontSize={Math.min(p.w, p.h) * 0.35} fontWeight={700}
                    fontFamily="'Outfit', sans-serif"
                  >
                    ×{stackFactor}
                  </text>
                )}
              </g>
            ))}

            {/* Length label */}
            <text
              x={SVG_W / 2} y={svgH - 1}
              textAnchor="middle" fill="#6b7280" fontSize={10}
              fontFamily="'Outfit', sans-serif"
            >
              {trailerL}m
            </text>
          </svg>
        </div>

        {/* Summary bar */}
        <div style={{
          padding: '10px 20px', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap',
          fontSize: 13, color: 'var(--text-muted)',
        }}>
          <span>
            <strong style={{ color: 'var(--text)' }}>{used}</strong>
            {available ? ` of ${available}` : ''} pallet spaces
          </span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span>
            <strong style={{ color: '#EF9F27' }}>{ldm.toFixed(2)}</strong> LDM
          </span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span>
            <strong style={{ color: util > 85 ? '#f59e0b' : util > 100 ? '#ef4444' : 'var(--text)' }}>{util}%</strong> utilisation
          </span>
        </div>
      </div>
    </section>
  );
}
