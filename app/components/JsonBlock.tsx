'use client';

function highlightJson(json: string): string {
  return json.replace(
    /("(?:[^"\\]|\\.)*")\s*:/g,
    '<span class="json-key">$1</span>:'
  ).replace(
    /:\s*("(?:[^"\\]|\\.)*")/g,
    ': <span class="json-str">$1</span>'
  ).replace(
    /:\s*(\d+\.?\d*)/g,
    ': <span class="json-num">$1</span>'
  ).replace(
    /:\s*(true|false)/g,
    ': <span class="json-bool">$1</span>'
  ).replace(
    /:\s*(null)/g,
    ': <span class="json-null">$1</span>'
  ).replace(
    /\[(\s*")/g,
    '[<span class="json-str">$1'
  );
}

export default function JsonBlock({ json, style }: { json: string; style?: React.CSSProperties }) {
  return (
    <div
      className="code-block"
      style={style}
      dangerouslySetInnerHTML={{ __html: highlightJson(json) }}
    />
  );
}
