'use client';

import { useEffect } from 'react';

export default function PostmanButton() {
  useEffect(() => {
    if (document.getElementById('_pmPostmanRunObject')) return;
    const script = document.createElement('script');
    script.src = 'https://run.pstmn.io/button.js';
    script.async = true;
    script.id = '_pmPostmanRunObject';
    document.head.appendChild(script);
    return () => {
      const existing = document.getElementById('_pmPostmanRunObject');
      if (existing) existing.remove();
    };
  }, []);

  return (
    <div
      className="postman-run-button"
      data-postman-action="collection/fork"
      data-postman-visibility="public"
      data-postman-var-1="32320553-1e28de38-e73a-4302-b6a4-caad305aabe5"
      data-postman-collection-url="entityId=32320553-1e28de38-e73a-4302-b6a4-caad305aabe5&entityType=collection&workspaceId=76a655ce-5f37-4dd7-8a3b-adbc90dead25"
      style={{ display: 'inline-block', margin: '8px 0' }}
    />
  );
}
