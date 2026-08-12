'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '../../../lib/admin-api';
import StatusBadge from '../../../components/admin/StatusBadge';

const CARD_META = [
  { key: 'enquiries', label: 'Enquiries', href: '/admin/enquiries' },
  { key: 'destinations', label: 'Destinations', href: '/admin/destinations' },
  { key: 'trips', label: 'Trips', href: '/admin/trips' },
  { key: 'categories', label: 'Categories', href: '/admin/categories' },
  { key: 'hotels', label: 'Hotels', href: '/admin/hotels' },
  { key: 'blogs', label: 'Blog articles', href: '/admin/blogs' },
  { key: 'pages', label: 'Pages', href: '/admin/pages' },
  { key: 'users', label: 'Registered users', href: '/admin/users' },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminFetch('stats').then(setStats).catch(err => setError(err.message));
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl font-extrabold text-brand-deep">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Overview of your site content and activity.</p>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {CARD_META.map(meta => (
          <Link key={meta.key} href={meta.href} className="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
            <p className="text-sm font-semibold text-gray-500">{meta.label}</p>
            <p className="mt-2 font-heading text-3xl font-extrabold text-brand-deep">{stats ? stats.counts[meta.key] ?? 0 : '–'}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-lg font-extrabold text-brand-deep">Recent enquiries</h2>
          <Link href="/admin/enquiries" className="text-sm font-semibold text-brand-purple hover:text-brand-deep">View all</Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {!stats ? (
            <p className="p-5 text-sm text-gray-400">Loading…</p>
          ) : stats.recentEnquiries.length === 0 ? (
            <p className="p-5 text-sm text-gray-400">No enquiries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 font-semibold">Destination</th>
                    <th className="px-5 py-3 font-semibold">Contact</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentEnquiries.map(item => (
                    <tr key={item._id} className="border-b border-gray-50 last:border-0">
                      <td className="px-5 py-3 font-medium text-brand-deep">{item.name || '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{item.destination || '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{item.email || item.phone || '—'}</td>
                      <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
