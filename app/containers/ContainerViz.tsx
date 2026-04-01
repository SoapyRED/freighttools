'use client';

const SVG_W = 400;
const SVG_H = 260;
const PAD = 20;
const GAP = 2;

interface Props {
  itemsPerRow: number;
  itemsPerCol: number;
  layers: number;
  totalItemsFit: number;
  containerWidthCm: number;
  containerHeightCm: number;
  itemWidthCm: number;
  itemHeightCm: number;
  volumeUtilisation: number;
}

export default function ContainerViz({
  itemsPerRow, itemsPerCol, layers, totalItemsFit,
  containerWidthCm, containerHeightCm,
  itemWidthCm, itemHeightCm, volumeUtilisation,
}: Props) {
  // Scale container to fit SVG
  const innerW = SVG_W - PAD * 2;
  const innerH = SVG_H - PAD * 2;
  const scaleX = innerW / containerWidthCm;
  const scaleY = innerH / containerHeightCm;
  const scale = Math.min(scaleX, scaleY);
  const cw = containerWidthCm * scale;
  const ch = containerHeightCm * scale;
  const cx = (SVG_W - cw) / 2;
  const cy = (SVG_H - ch) / 2;

  // Item sizes in SVG units
  const iw = itemWidthCm * scale;
  const ih = itemHeightCm * scale;

  // Build item rects — front face view (width × height)
  const items: { x: number; y: number; w: number; h: number }[] = [];
  for (let row = 0; row < layers; row++) {
    for (let col = 0; col < itemsPerRow; col++) {
      const x = cx + col * iw;
      const y = cy + ch - (row + 1) * ih; // stack from bottom
      if (x + iw <= cx + cw + 0.5 && y >= cy - 0.5) {
        items.push({ x: x + GAP / 2, y: y + GAP / 2, w: iw - GAP, h: ih - GAP });
      }
    }
  }

  return (
    <div style={{
      padding: '16px 20px', borderBottom: '1px solid #eef0f4',
      background: '#0f1724', textAlign: 'center',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#8f9ab0', marginBottom: 8 }}>
        Front-Face Cross Section &middot; {itemsPerRow} across &times; {layers} high &middot; {itemsPerCol} deep
      </div>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Container outline */}
        <rect x={cx} y={cy} width={cw} height={ch} rx={3} fill="#1e2a3d" stroke="#374151" strokeWidth={1.5} />

        {/* Door frame indicators */}
        <rect x={cx} y={cy} width={3} height={ch} fill="#374151" />
        <rect x={cx + cw - 3} y={cy} width={3} height={ch} fill="#374151" />
        <rect x={cx} y={cy} width={cw} height={3} fill="#374151" />

        {/* Items */}
        {items.map((item, i) => (
          <rect key={i} x={item.x} y={item.y} width={item.w} height={item.h} rx={1} fill="#EF9F27" opacity={0.85} />
        ))}
      </svg>
      <div style={{ fontSize: 12, color: '#8f9ab0', marginTop: 8 }}>
        <strong style={{ color: '#EF9F27' }}>{totalItemsFit}</strong> items fit &middot; <strong>{volumeUtilisation}%</strong> volume utilisation
      </div>
    </div>
  );
}
