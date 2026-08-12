'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '../../lib/admin-api';
import StatusBadge from './StatusBadge';
import { IconSearch, IconPencil, IconTrash, IconPlus, IconChevronLeft, IconChevronRight, IconImage } from './Icons';

function ColumnCell({ col, value }) {
  if (col.type === 'image') {
    return value
      ? <img src={value} alt="" className="h-10 w-14 rounded-md object-cover" />
      : <span className="flex h-10 w-14 items-center justify-center rounded-md bg-gray-100 text-gray-300"><IconImage className="h-4 w-4" /></span>;
  }
  if (col.type === 'boolean') {
    return value ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">Yes</span> : <span className="text-gray-300">—</span>;
  }
  if (col.type === 'date') {
    return value ? new Date(value).toLocaleDateString() : '—';
  }
  if (col.key === 'status') {
    return <StatusBadge status={value} />;
  }
  return value === undefined || value === null || value === '' ? <span className="text-gray-300">—</span> : String(value);
}

function RowActions({ resourceKey, item, onDelete }) {
  return (
    <div className="inline-flex items-center gap-1">
      <Link href={`/admin/${resourceKey}/${item._id}`} className="rounded-lg p-2.5 text-gray-500 hover:bg-gray-100 hover:text-brand-purple" aria-label="Edit">
        <IconPencil className="h-4 w-4" />
      </Link>
      <button
        onClick={() => onDelete(item._id, item.name || item.title || item.email || 'this item')}
        className="rounded-lg p-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
        aria-label="Delete"
      >
        <IconTrash className="h-4 w-4" />
      </button>
    </div>
  );
}

function MobileCard({ item, resourceKey, columns, onDelete }) {
  const imageCol = columns.find(col => col.type === 'image');
  const restCols = columns.filter(col => col !== imageCol);
  const [titleCol, ...detailCols] = restCols;

  return (
    <div className="flex gap-3 p-4">
      {imageCol && (
        item[imageCol.key]
          ? <img src={item[imageCol.key]} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
          : <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-300"><IconImage className="h-5 w-5" /></span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate font-bold text-brand-deep">
            {titleCol ? <ColumnCell col={titleCol} value={item[titleCol.key]} /> : '—'}
          </p>
          <RowActions resourceKey={resourceKey} item={item} onDelete={onDelete} />
        </div>
        <dl className="mt-1.5 space-y-1 text-sm text-gray-500">
          {detailCols.map(col => (
            <div key={col.key} className="flex items-baseline gap-1.5">
              <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-400">{col.label || col.key}</dt>
              <dd className="min-w-0 truncate"><ColumnCell col={col} value={item[col.key]} /></dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export default function ResourceTable({ resourceKey, config }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (p, s) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (s) params.set('search', s);
      const data = await adminFetch(`${resourceKey}?${params.toString()}`);
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
      setPage(data.page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [resourceKey]);

  useEffect(() => { load(1, ''); }, [load]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    load(1, search);
  }

  async function handleDelete(id, label) {
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    try {
      await adminFetch(`${resourceKey}/${id}`, { method: 'DELETE' });
      load(page, search);
    } catch (err) {
      window.alert(err.message);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${config.label.toLowerCase()}…`}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
          />
        </form>
        <Link href={`/admin/${resourceKey}/new`} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-purple px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-deep">
          <IconPlus className="h-4 w-4" /> Add {config.singular}
        </Link>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {/* Table view: sm and up */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white sm:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
            <tr>
              {config.columns.map(col => <th key={col.key} className="px-5 py-3 font-semibold">{col.label || col.key}</th>)}
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={config.columns.length + 1} className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={config.columns.length + 1} className="px-5 py-10 text-center text-gray-400">No {config.label.toLowerCase()} yet.</td></tr>
            ) : items.map(item => (
              <tr key={item._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                {config.columns.map(col => (
                  <td key={col.key} className="px-5 py-3 align-middle text-gray-700">
                    <ColumnCell col={col} value={item[col.key]} />
                  </td>
                ))}
                <td className="px-5 py-3 text-right">
                  <RowActions resourceKey={resourceKey} item={item} onDelete={handleDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card view: below sm */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white sm:hidden">
        {loading ? (
          <p className="px-4 py-10 text-center text-sm text-gray-400">Loading…</p>
        ) : items.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-gray-400">No {config.label.toLowerCase()} yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map(item => (
              <MobileCard key={item._id} item={item} resourceKey={resourceKey} columns={config.columns} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
          <span>{total} total</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => load(page - 1, search)} className="rounded-lg border border-gray-200 p-2 disabled:opacity-40" aria-label="Previous page">
              <IconChevronLeft className="h-4 w-4" />
            </button>
            <span>Page {page} of {pages}</span>
            <button disabled={page >= pages} onClick={() => load(page + 1, search)} className="rounded-lg border border-gray-200 p-2 disabled:opacity-40" aria-label="Next page">
              <IconChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
