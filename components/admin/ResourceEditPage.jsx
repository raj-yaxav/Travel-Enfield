'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ADMIN_RESOURCE_CONFIG } from '../../lib/admin-resource-config';
import { adminFetch } from '../../lib/admin-api';
import ResourceForm from './ResourceForm';
import { IconChevronLeft, IconTrash } from './Icons';

export default function ResourceEditPage({ resourceKey, id }) {
  const config = ADMIN_RESOURCE_CONFIG[resourceKey];
  const router = useRouter();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminFetch(`${resourceKey}/${id}`).then(setDoc).catch(err => setError(err.message));
  }, [resourceKey, id]);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(timer);
  }, [saved]);

  async function handleSubmit(value) {
    const updated = await adminFetch(`${resourceKey}/${id}`, { method: 'PUT', body: JSON.stringify(value) });
    setDoc(updated);
    setSaved(true);
  }

  async function handleDelete() {
    if (!window.confirm(`Delete this ${config.singular.toLowerCase()}? This cannot be undone.`)) return;
    await adminFetch(`${resourceKey}/${id}`, { method: 'DELETE' });
    router.push(`/admin/${resourceKey}`);
  }

  return (
    <div>
      <Link href={`/admin/${resourceKey}`} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-brand-deep">
        <IconChevronLeft className="h-4 w-4" /> Back to {config.label.toLowerCase()}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-2xl font-extrabold text-brand-deep">Edit {config.singular}</h1>
        {saved && <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">Saved</span>}
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {!doc && !error ? (
        <p className="mt-6 text-sm text-gray-400">Loading…</p>
      ) : doc ? (
        <div className="mt-6 max-w-3xl rounded-2xl border border-gray-200 bg-white p-6">
          <ResourceForm
            config={config}
            initialValue={doc}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
            extraActions={(
              <button type="button" onClick={handleDelete} className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">
                <IconTrash className="h-4 w-4" /> Delete
              </button>
            )}
          />
        </div>
      ) : null}
    </div>
  );
}
