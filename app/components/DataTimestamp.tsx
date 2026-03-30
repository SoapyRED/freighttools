interface Props {
  text: string;
}

export default function DataTimestamp({ text }: Props) {
  return (
    <div style={{
      fontSize: 12, color: 'var(--text-faint, #8f9ab0)',
      marginTop: 8, marginBottom: 4,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{ opacity: 0.7 }}>&#128197;</span>
      {text}
    </div>
  );
}
