'use client';

import { useRef, useState } from 'react';
import { adminFetch } from '../../lib/admin-api';
import { IconUpload, IconX } from './Icons';

export default function VideoUploader({ value, onChange, label = 'Upload video' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true); setError('');
    try {
      const formData = new FormData();
      formData.set('file', file);
      const data = await adminFetch('upload', { method: 'POST', body: formData });
      onChange(data.url);
    } catch (err) {
      setError(err.message || 'Video upload failed');
    } finally { setBusy(false); }
  }

  return <div>
    {value ? <div className="space-y-2">
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-black"><video src={value} controls preload="metadata" className="h-32 w-full object-cover" /><button type="button" onClick={() => onChange('')} className="absolute right-2 top-2 rounded-full bg-white p-1 text-gray-600 shadow hover:text-red-600" aria-label="Remove video"><IconX className="h-4 w-4" /></button></div>
      <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="min-h-10 rounded-lg border border-gray-300 px-3 text-xs font-bold text-gray-700 transition hover:border-brand-purple hover:text-brand-purple disabled:opacity-60">{busy ? 'Uploading…' : 'Replace video'}</button>
    </div> : <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="flex min-h-24 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 px-4 text-gray-500 transition hover:border-brand-purple hover:text-brand-purple disabled:opacity-60">{busy ? <span className="text-xs font-semibold">Uploading…</span> : <><IconUpload className="h-5 w-5" /><span className="text-xs font-semibold">{label}</span><span className="text-[11px] text-gray-400">MP4, WebM or MOV · max 50MB</span></>}</button>}
    <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleFile} />
    {error && <p role="alert" className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>}
  </div>;
}
