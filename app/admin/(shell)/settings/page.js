'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminFetch } from '../../../../lib/admin-api';
import { IconLoader } from '../../../../components/admin/Icons';

const STARTING_VALUES = {
  announcementEnabled: true,
  announcementText: 'Monsoon Sale is LIVE — Flat ₹5,000 Off',
  announcementHref: '/deals',
};

const QUICK_LINKS = [
  ['/deals', 'Deals'],
  ['/upcoming-trips', 'Upcoming trips'],
  ['/domestic-trips', 'India trips'],
  ['/international-trips', 'International trips'],
  ['/weekend-trips', 'Weekend trips'],
  ['/hotels', 'Hotels'],
  ['/custom-trip', 'Custom trip enquiry'],
];

export default function SiteSettingsPage() {
  const [values, setValues] = useState(STARTING_VALUES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    adminFetch('site-settings')
      .then(data => { if (active) setValues({ ...STARTING_VALUES, ...data }); })
      .catch(loadError => { if (active) setError(loadError.message || 'Unable to load site settings'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const selectedQuickLink = useMemo(
    () => QUICK_LINKS.some(([href]) => href === values.announcementHref) ? values.announcementHref : 'custom',
    [values.announcementHref]
  );

  function update(field, value) {
    setValues(current => ({ ...current, [field]: value }));
    setNotice('');
    setError('');
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    setError('');
    try {
      const saved = await adminFetch('site-settings', { method: 'PUT', body: JSON.stringify(values) });
      setValues(current => ({ ...current, ...saved }));
      setNotice('Announcement bar saved. Refresh any open website tab to see it immediately.');
    } catch (saveError) {
      setError(saveError.message || 'Unable to save site settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex min-h-48 items-center justify-center text-sm font-semibold text-gray-500"><IconLoader className="mr-2 h-5 w-5 animate-spin" /> Loading site settings…</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-brand-purple">Site settings</p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-brand-deep">Announcement bar</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Control the sale message shown across the website and choose exactly where a click takes a traveller.</p>
      </div>

      <form onSubmit={save} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-purple/15 bg-brand-surface/50 p-4">
          <input type="checkbox" checked={values.announcementEnabled} onChange={event => update('announcementEnabled', event.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-purple" />
          <span><span className="block font-heading text-base font-extrabold text-brand-deep">Show announcement bar</span><span className="mt-1 block text-sm leading-5 text-gray-500">Turn this off to hide the bar on every public page without deleting its message.</span></span>
        </label>

        <div className="mt-6">
          <label htmlFor="announcement-text" className="text-sm font-bold text-gray-700">Banner message</label>
          <input id="announcement-text" required maxLength={140} value={values.announcementText} onChange={event => update('announcementText', event.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" />
          <p className="mt-1.5 text-xs text-gray-400">{values.announcementText.length}/140 characters</p>
        </div>

        <div className="mt-5">
          <label htmlFor="announcement-destination" className="text-sm font-bold text-gray-700">On click, take visitors to</label>
          <select value={selectedQuickLink} onChange={event => { if (event.target.value !== 'custom') update('announcementHref', event.target.value); }} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10">
            <option value="custom">Custom URL or internal page</option>
            {QUICK_LINKS.map(([href, label]) => <option key={href} value={href}>{label}</option>)}
          </select>
          <input id="announcement-destination" required value={values.announcementHref} onChange={event => update('announcementHref', event.target.value)} placeholder="/deals or https://example.com" className="mt-3 w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" />
          <p className="mt-1.5 text-xs leading-5 text-gray-400">Use an internal route such as <code>/deals</code>, or a complete <code>https://</code> URL.</p>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        {notice && <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</p>}

        <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-5">
          <button disabled={saving} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-purple px-5 text-sm font-extrabold text-white transition hover:bg-brand-deep disabled:cursor-wait disabled:opacity-60">
            {saving && <IconLoader className="mr-2 h-4 w-4 animate-spin" />}{saving ? 'Saving…' : 'Save announcement'}
          </button>
          <a href="/" target="_blank" rel="noreferrer" className="text-sm font-bold text-brand-purple hover:text-brand-deep">Preview website ↗</a>
        </div>
      </form>
    </div>
  );
}
