'use client';

interface SegmentedControlProps {
  options: { label: string; value: string }[];
  activeValue: string;
  onChange: (value: string) => void;
}

/**
 * Pill-shaped mode switcher (Air/Sea, Road/Air/Sea, Lookup/Calculator).
 * Active segment gets accent background. Uses useState in parent — this
 * is a button group, NOT a nav dropdown.
 */
export default function SegmentedControl({ options, activeValue, onChange }: SegmentedControlProps) {
  return (
    <div style={{
      display: 'inline-flex',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 4,
      gap: 2,
    }}>
      {options.map(opt => {
        const active = opt.value === activeValue;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '8px 20px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              fontFamily: "'Outfit', sans-serif",
              background: active ? 'var(--page-cat, var(--accent))' : 'transparent',
              color: active ? '#fff' : 'var(--text-muted)',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
