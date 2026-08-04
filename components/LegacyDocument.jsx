'use client';

import { useEffect, useRef } from 'react';

export default function LegacyDocument({ html, entry }) {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    if (entry === 'home') import('../src/scripts/main.js');
    else import('../src/scripts/app.js');
  }, [entry]);

  return <div className="legacy-document-bridge min-h-dvh w-full overflow-x-clip" dangerouslySetInnerHTML={{ __html: html }} />;
}
