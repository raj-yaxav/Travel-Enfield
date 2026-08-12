'use client';

import { useRef, useState } from 'react';
import { adminFetch } from '../../lib/admin-api';
import { IconUpload, IconX } from './Icons';

export default function ImageUploader({ value, onChange, label }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const formData = new FormData();
      formData.set('file', file);
      const data = await adminFetch('upload', { method: 'POST', body: formData });
      onChange(data.url);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-24 w-24 rounded-lg border border-gray-200 object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-gray-500 shadow ring-1 ring-gray-200 hover:text-red-600"
            aria-label="Remove image"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-brand-purple hover:text-brand-purple disabled:opacity-60"
        >
          {busy ? (
            <span className="text-[11px] font-semibold">Uploading…</span>
          ) : (
            <>
              <IconUpload className="h-5 w-5" />
              <span className="text-[11px] font-semibold">{label || 'Upload'}</span>
            </>
          )}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {error && <p className="mt-1.5 max-w-24 text-[11px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}
