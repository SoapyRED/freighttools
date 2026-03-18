import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get('title') || 'FreightUtils.com';
  const description = searchParams.get('desc') || 'Free Freight Calculators & APIs';
  const api = searchParams.get('api') || '';
  const badge = searchParams.get('badge') || '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#1a1a1a',
          padding: '60px 70px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top: logo + brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Slash logo mark */}
          <div
            style={{
              width: 52,
              height: 52,
              background: '#EF9F27',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 800,
              color: '#412402',
              fontFamily: 'monospace',
            }}
          >
            /
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#9CA3AF' }}>
              Freight
            </span>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#EF9F27' }}>
              Utils
            </span>
            <span style={{ fontSize: 28, fontWeight: 400, color: '#6B7280' }}>
              .com
            </span>
          </div>
        </div>

        {/* Middle: title + description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {badge && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  background: '#EF9F27',
                  color: '#fff',
                  fontSize: 22,
                  fontWeight: 800,
                  padding: '6px 18px',
                  borderRadius: 8,
                  fontFamily: 'monospace',
                  letterSpacing: 1,
                }}
              >
                {badge}
              </div>
            </div>
          )}
          <div
            style={{
              fontSize: badge ? 42 : 52,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              letterSpacing: -1,
              maxWidth: 900,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 22,
              color: '#9CA3AF',
              lineHeight: 1.5,
              maxWidth: 800,
            }}
          >
            {description}
          </div>
        </div>

        {/* Bottom: API endpoint + tools list */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {api ? (
            <div
              style={{
                background: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 18,
                color: '#EF9F27',
                fontFamily: 'monospace',
              }}
            >
              {api}
            </div>
          ) : (
            <div
              style={{
                fontSize: 16,
                color: '#6B7280',
                letterSpacing: 2,
              }}
            >
              LDM · CBM · ADR · Chargeable Weight · Pallet
            </div>
          )}
          <div style={{ fontSize: 14, color: '#4B5563' }}>
            freightutils.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
