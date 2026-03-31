interface Props {
  text: string;
}

export default function ToolDisclaimer({ text }: Props) {
  return (
    <p style={{
      fontSize: 12,
      color: 'var(--text-faint, #8f9ab0)',
      marginTop: 4,
      marginBottom: 4,
      lineHeight: 1.5,
      fontStyle: 'italic',
    }}>
      {text}
    </p>
  );
}
