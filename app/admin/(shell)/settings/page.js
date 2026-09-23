'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '../../../../lib/admin-api';
import { IconLoader, IconPlus, IconTrash } from '../../../../components/admin/Icons';
import ImageUploader from '../../../../components/admin/ImageUploader';
import VideoUploader from '../../../../components/admin/VideoUploader';

const STARTING_VALUES = {
  announcementEnabled: true,
  announcementText: 'Monsoon Sale is LIVE — Flat ₹5,000 Off',
  announcementHref: '/announcement',
  datesAvailableMessage: 'All dates available — send an enquiry for your preferred date.',
  announcementLanding: { eyebrow: 'Limited-time offer', title: 'Explore India', description: 'From Himalayan roads to tropical backwaters, discover curated journeys closer to home.', image: 'https://res.cloudinary.com/rgw1moxc/image/upload/travelenfield/destinations/ladakh.jpg', tripSlugs: [] },
  aboutFounder: {
    name: 'TravelEnfield Team', role: 'Founder & CEO, TravelEnfield', image: '/images/reviews/yash.webp',
    instagramUrl: '', linkedinUrl: '', bio: 'TravelEnfield is built around a simple belief: the best journeys connect people, places and stories worth bringing home.',
  },
  aboutTeam: [
    { name: 'Sumit Jha', role: 'Co-Founder & CTO', image: '/images/reviews/yash.webp' },
    { name: 'Vishal Kapoor', role: 'Sales Head', image: '/images/reviews/virender-singh.webp' },
    { name: 'Shazan Abbas', role: 'International Operations Head', image: '/images/reviews/suleman-ahmad.webp' },
    { name: 'Piyush Verma', role: 'Domestic Operations Head', image: '/images/reviews/dishant-soni.webp' },
  ],
  activities: { eyebrow: 'Explore. Experience. Enrich.', title: 'Our Activities', description: 'From breathtaking landscapes to thrilling adventures, discover the experiences that make every journey unforgettable.', items: [
    { title: 'Mountain Diaries', description: 'Little moments from the road, the trails and the views that stay with you.', video: 'https://res.cloudinary.com/rgw1moxc/video/upload/travelenfield/activity/112040-695204669-medium.mp4' },
    { title: 'Ride With Us', description: 'Open roads, good company and the kind of ride you keep talking about.', video: 'https://res.cloudinary.com/rgw1moxc/video/upload/travelenfield/activity/1408-147169812-small.mp4' },
    { title: 'The Group Vibe', description: 'Meet the people who turn every itinerary into a shared story.', video: 'https://res.cloudinary.com/rgw1moxc/video/upload/travelenfield/activity/197898-905833761-medium.mp4' },
  ] },
  footerTripGroups: {
    domestic: { title: 'Domestic Trips', links: [['Ladakh Tour Packages', '/destinations/ladakh'], ['Spiti Tour Packages', '/destinations/spiti'], ['Manali Tour Packages', '/destinations/manali'], ['Meghalaya Tour Packages', '/destinations/meghalaya'], ['Kerala Tour Packages', '/destinations/kerala'], ['Kashmir Tour Packages', '/destinations/kashmir'], ['Himachal Tour Packages', '/destinations/himachal'], ['Uttarakhand Tour Packages', '/destinations/uttarakhand'], ['Rajasthan Tour Packages', '/destinations/rajasthan'], ['Andaman Tour Packages', '/destinations/andaman']].map(([label, href]) => ({ label, href })) },
    international: { title: 'International Trips', links: [['Bali Tour Packages', '/destinations/bali'], ['Thailand Tour Packages', '/destinations/thailand'], ['Nepal Tour Packages', '/destinations/nepal'], ['Vietnam Tour Packages', '/destinations/vietnam'], ['Sri Lanka Tour Packages', '/destinations/sri-lanka'], ['Bhutan Tour Packages', '/destinations/bhutan'], ['Dubai Tour Packages', '/destinations/dubai'], ['Maldives Tour Packages', '/destinations/maldives'], ['Singapore Tour Packages', '/destinations/singapore']].map(([label, href]) => ({ label, href })) },
  },
};

export default function SiteSettingsPage() {
  const [values, setValues] = useState(STARTING_VALUES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [tripOptions, setTripOptions] = useState([]);

  useEffect(() => {
    let active = true;
    adminFetch('site-settings')
      .then(data => { if (active) setValues({ ...STARTING_VALUES, ...data }); })
      .catch(loadError => { if (active) setError(loadError.message || 'Unable to load site settings'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    adminFetch('trips?limit=100')
      .then(data => { if (active) setTripOptions(data.items || []); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  function update(field, value) {
    setValues(current => ({ ...current, [field]: value }));
    setNotice('');
    setError('');
  }
  function updateAnnouncementLanding(field, value) { setValues(current => ({ ...current, announcementLanding: { ...STARTING_VALUES.announcementLanding, ...(current.announcementLanding || {}), [field]: value } })); setNotice(''); setError(''); }
  function toggleAnnouncementTrip(slug) { updateAnnouncementLanding('tripSlugs', (values.announcementLanding?.tripSlugs || []).includes(slug) ? values.announcementLanding.tripSlugs.filter(item => item !== slug) : [...(values.announcementLanding?.tripSlugs || []), slug]); }
  function updateFounder(field, value) {
    setValues(current => ({ ...current, aboutFounder: { ...STARTING_VALUES.aboutFounder, ...(current.aboutFounder || {}), [field]: value } }));
    setNotice('');
    setError('');
  }
  function updateTeamMember(index, field, value) {
    setValues(current => ({ ...current, aboutTeam: (current.aboutTeam || []).map((member, memberIndex) => memberIndex === index ? { ...member, [field]: value } : member) }));
    setNotice('');
    setError('');
  }
  function addTeamMember() {
    setValues(current => ({ ...current, aboutTeam: [...(current.aboutTeam || []), { name: '', role: '', image: '' }] }));
    setNotice('');
    setError('');
  }
  function removeTeamMember(index) {
    setValues(current => ({ ...current, aboutTeam: (current.aboutTeam || []).filter((_, memberIndex) => memberIndex !== index) }));
    setNotice('');
    setError('');
  }
  function updateActivities(field, value) { setValues(current => ({ ...current, activities: { ...STARTING_VALUES.activities, ...(current.activities || {}), [field]: value } })); setNotice(''); setError(''); }
  function updateActivity(index, field, value) { setValues(current => ({ ...current, activities: { ...STARTING_VALUES.activities, ...(current.activities || {}), items: (current.activities?.items || []).map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) } })); setNotice(''); setError(''); }
  function addActivity() { setValues(current => ({ ...current, activities: { ...STARTING_VALUES.activities, ...(current.activities || {}), items: [...(current.activities?.items || []), { title: '', description: '', video: '' }] } })); setNotice(''); setError(''); }
  function removeActivity(index) { setValues(current => ({ ...current, activities: { ...STARTING_VALUES.activities, ...(current.activities || {}), items: (current.activities?.items || []).filter((_, itemIndex) => itemIndex !== index) } })); setNotice(''); setError(''); }
  function updateFooterGroup(groupKey, field, value) {
    setValues(current => ({ ...current, footerTripGroups: { ...STARTING_VALUES.footerTripGroups, ...(current.footerTripGroups || {}), [groupKey]: { ...STARTING_VALUES.footerTripGroups[groupKey], ...(current.footerTripGroups?.[groupKey] || {}), [field]: value } } }));
    setNotice(''); setError('');
  }
  function updateFooterLink(groupKey, index, field, value) {
    setValues(current => ({ ...current, footerTripGroups: { ...STARTING_VALUES.footerTripGroups, ...(current.footerTripGroups || {}), [groupKey]: { ...STARTING_VALUES.footerTripGroups[groupKey], ...(current.footerTripGroups?.[groupKey] || {}), links: (current.footerTripGroups?.[groupKey]?.links || []).map((link, linkIndex) => linkIndex === index ? { ...link, [field]: value } : link) } } }));
    setNotice(''); setError('');
  }
  function addFooterLink(groupKey) {
    setValues(current => ({ ...current, footerTripGroups: { ...STARTING_VALUES.footerTripGroups, ...(current.footerTripGroups || {}), [groupKey]: { ...STARTING_VALUES.footerTripGroups[groupKey], ...(current.footerTripGroups?.[groupKey] || {}), links: [...(current.footerTripGroups?.[groupKey]?.links || []), { label: '', href: '' }] } } }));
    setNotice(''); setError('');
  }
  function removeFooterLink(groupKey, index) {
    setValues(current => ({ ...current, footerTripGroups: { ...STARTING_VALUES.footerTripGroups, ...(current.footerTripGroups || {}), [groupKey]: { ...STARTING_VALUES.footerTripGroups[groupKey], ...(current.footerTripGroups?.[groupKey] || {}), links: (current.footerTripGroups?.[groupKey]?.links || []).filter((_, linkIndex) => linkIndex !== index) } } }));
    setNotice(''); setError('');
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    setError('');
    try {
      const saved = await adminFetch('site-settings', { method: 'PUT', body: JSON.stringify(values) });
      setValues(current => ({ ...current, ...saved }));
      setNotice('Site settings saved. Refresh any open website tab to see the changes immediately.');
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
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-brand-deep">Site settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Control the sale message, About page profiles and editable footer destination links across the website.</p>
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

        <section className="mt-6 border-t border-gray-100 pt-7" aria-labelledby="announcement-page-settings"><p className="text-sm font-bold uppercase tracking-[.18em] text-brand-purple">Announcement landing page</p><h2 id="announcement-page-settings" className="mt-2 font-heading text-xl font-extrabold text-brand-deep">Offer page content</h2><p className="mt-1 text-sm leading-6 text-gray-500">The banner always opens <code>/announcement</code>. This page uses the same listing template as Domestic Trips, without changing any existing page or slug.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-gray-700">Eyebrow<input required maxLength={80} value={values.announcementLanding?.eyebrow || ''} onChange={event => updateAnnouncementLanding('eyebrow', event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base font-normal text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label><label className="text-sm font-bold text-gray-700">Page title<input required maxLength={120} value={values.announcementLanding?.title || ''} onChange={event => updateAnnouncementLanding('title', event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base font-normal text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label></div><label className="mt-4 block text-sm font-bold text-gray-700">Description<textarea required maxLength={500} rows={4} value={values.announcementLanding?.description || ''} onChange={event => updateAnnouncementLanding('description', event.target.value)} className="mt-1.5 w-full resize-y rounded-xl border border-gray-300 px-3 py-2.5 text-base font-normal leading-6 text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label><div className="mt-4"><p className="mb-2 text-sm font-bold text-gray-700">Hero image</p><ImageUploader value={values.announcementLanding?.image || ''} onChange={url => updateAnnouncementLanding('image', url)} label="Upload hero" /></div><div className="mt-6"><p className="text-sm font-bold text-gray-700">Cards shown on this offer page</p><p className="mt-1 text-xs leading-5 text-gray-400">Select the exact trips to display. Selection order is used on the public page.</p><div className="mt-3 grid max-h-72 gap-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/70 p-3 sm:grid-cols-2">{tripOptions.map(trip => { const checked = (values.announcementLanding?.tripSlugs || []).includes(trip.slug); return <label key={trip.slug} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-sm font-medium ${checked ? 'bg-brand-purple/10 text-brand-purple' : 'text-gray-700 hover:bg-white'}`}><input type="checkbox" checked={checked} onChange={() => toggleAnnouncementTrip(trip.slug)} className="h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" /><span className="min-w-0 truncate">{trip.title}</span></label>; })}</div></div></section>

        <section className="mt-8 border-t border-gray-100 pt-7" aria-labelledby="about-founder-settings">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-brand-purple">About page</p>
          <h2 id="about-founder-settings" className="mt-2 font-heading text-xl font-extrabold text-brand-deep">Founder profile</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">This profile appears in the founder section on the About Us page. Upload a portrait or paste a secure image URL.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-[120px_minmax(0,1fr)]">
            <div><p className="mb-2 text-sm font-bold text-gray-700">Profile photo</p><ImageUploader value={values.aboutFounder?.image || ''} onChange={url => updateFounder('image', url)} label="Upload photo" /></div>
            <div className="grid gap-4">
              <label className="text-sm font-bold text-gray-700">Name<input required maxLength={100} value={values.aboutFounder?.name || ''} onChange={event => updateFounder('name', event.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-base font-normal text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label>
              <label className="text-sm font-bold text-gray-700">Role / designation<input required maxLength={140} value={values.aboutFounder?.role || ''} onChange={event => updateFounder('role', event.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-base font-normal text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label>
            </div>
          </div>
          <label className="mt-4 block text-sm font-bold text-gray-700">Short bio<textarea required maxLength={2400} rows={6} value={values.aboutFounder?.bio || ''} onChange={event => updateFounder('bio', event.target.value)} className="mt-2 w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-base font-normal leading-6 text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-gray-700">Instagram URL <span className="font-normal text-gray-400">(optional)</span><input type="url" value={values.aboutFounder?.instagramUrl || ''} onChange={event => updateFounder('instagramUrl', event.target.value)} placeholder="https://instagram.com/..." className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-base font-normal text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label>
            <label className="text-sm font-bold text-gray-700">LinkedIn URL <span className="font-normal text-gray-400">(optional)</span><input type="url" value={values.aboutFounder?.linkedinUrl || ''} onChange={event => updateFounder('linkedinUrl', event.target.value)} placeholder="https://linkedin.com/in/..." className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-base font-normal text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label>
          </div>
        </section>

        <section className="mt-8 border-t border-gray-100 pt-7" aria-labelledby="about-team-settings">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-sm font-bold uppercase tracking-[.18em] text-brand-purple">About page</p><h2 id="about-team-settings" className="mt-2 font-heading text-xl font-extrabold text-brand-deep">Meet our team</h2><p className="mt-1 text-sm leading-6 text-gray-500">Add up to 12 team members. Each card needs a photo, name and role.</p></div>
            <button type="button" disabled={(values.aboutTeam || []).length >= 12} onClick={addTeamMember} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-brand-purple/20 px-4 text-sm font-extrabold text-brand-purple transition hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-50"><IconPlus className="h-4 w-4" /> Add member</button>
          </div>
          <div className="mt-5 grid gap-4">
            {(values.aboutTeam || []).map((member, index) => <article key={`${index}-${member.image || 'new'}`} className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:items-start">
              <ImageUploader value={member.image || ''} onChange={url => updateTeamMember(index, 'image', url)} label="Photo" />
              <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold text-gray-700">Name<input required maxLength={100} value={member.name || ''} onChange={event => updateTeamMember(index, 'name', event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-base font-normal text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label><label className="text-sm font-bold text-gray-700">Role<input required maxLength={140} value={member.role || ''} onChange={event => updateTeamMember(index, 'role', event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-base font-normal text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label></div>
              <button type="button" onClick={() => removeTeamMember(index)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-200 px-3 text-red-600 transition hover:bg-red-50" aria-label={`Remove ${member.name || 'team member'}`}><IconTrash className="h-4 w-4" /></button>
            </article>)}
          </div>
        </section>

        <section className="mt-8 border-t border-gray-100 pt-7" aria-labelledby="footer-trip-links-settings">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-brand-purple">Website footer</p>
          <h2 id="footer-trip-links-settings" className="mt-2 font-heading text-xl font-extrabold text-brand-deep">Destination trip links</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Edit the Domestic and International trip groups shown in the public footer. Add a label and the page each link should open.</p>
          <div className="mt-5 grid gap-6">
            {['domestic', 'international'].map(groupKey => {
              const group = values.footerTripGroups?.[groupKey] || STARTING_VALUES.footerTripGroups[groupKey];
              return <article key={groupKey} className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 sm:p-5">
                <div className="flex flex-wrap items-end justify-between gap-3"><label className="min-w-0 flex-1 text-sm font-bold text-gray-700">{groupKey === 'domestic' ? 'Domestic links heading' : 'International links heading'}<input required maxLength={60} value={group.title || ''} onChange={event => updateFooterGroup(groupKey, 'title', event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-base font-normal text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label><button type="button" disabled={(group.links || []).length >= 14} onClick={() => addFooterLink(groupKey)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-brand-purple/20 px-4 text-sm font-extrabold text-brand-purple transition hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-50"><IconPlus className="h-4 w-4" /> Add link</button></div>
                <div className="mt-4 grid gap-3">{(group.links || []).map((link, index) => <div key={`${groupKey}-${index}`} className="grid gap-3 sm:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)_auto] sm:items-end"><label className="text-sm font-bold text-gray-700">Link text<input required maxLength={100} value={link.label || ''} onChange={event => updateFooterLink(groupKey, index, 'label', event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-base font-normal text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label><label className="text-sm font-bold text-gray-700">Destination URL<input required value={link.href || ''} onChange={event => updateFooterLink(groupKey, index, 'href', event.target.value)} placeholder="/destinations/bali" className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-base font-normal text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label><button type="button" disabled={(group.links || []).length <= 1} onClick={() => removeFooterLink(groupKey, index)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-200 px-3 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Remove ${link.label || 'footer link'}`}><IconTrash className="h-4 w-4" /></button></div>)}</div>
              </article>;
            })}
          </div>
        </section>

        <section className="mt-8 border-t border-gray-100 pt-7" aria-labelledby="activities-settings">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-brand-purple">Homepage & shared sections</p><h2 id="activities-settings" className="mt-2 font-heading text-xl font-extrabold text-brand-deep">Our Activities</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Edit the rail heading and cards used across the site. Replacing or removing a saved Cloudinary video removes the old file after save.</p></div><button type="button" disabled={(values.activities?.items || []).length >= 8} onClick={addActivity} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-brand-purple/20 px-4 text-sm font-extrabold text-brand-purple transition hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-50"><IconPlus className="h-4 w-4" /> Add activity</button></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-gray-700">Eyebrow<input required maxLength={80} value={values.activities?.eyebrow || ''} onChange={event => updateActivities('eyebrow', event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base font-normal text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label><label className="text-sm font-bold text-gray-700">Heading<input required maxLength={100} value={values.activities?.title || ''} onChange={event => updateActivities('title', event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base font-normal text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label></div>
          <label className="mt-4 block text-sm font-bold text-gray-700">Description<textarea required maxLength={320} rows={3} value={values.activities?.description || ''} onChange={event => updateActivities('description', event.target.value)} className="mt-1.5 w-full resize-y rounded-xl border border-gray-300 px-3 py-2.5 text-base font-normal leading-6 text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label>
          <div className="mt-5 grid gap-4">{(values.activities?.items || []).map((item, index) => <article key={`${index}-${item.video || 'new'}`} className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-start"><VideoUploader value={item.video || ''} onChange={url => updateActivity(index, 'video', url)} label="Upload activity video" /><div className="grid gap-3"><label className="text-sm font-bold text-gray-700">Card title<input required maxLength={100} value={item.title || ''} onChange={event => updateActivity(index, 'title', event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-base font-normal text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label><label className="text-sm font-bold text-gray-700">Card description<textarea required maxLength={280} rows={3} value={item.description || ''} onChange={event => updateActivity(index, 'description', event.target.value)} className="mt-1.5 w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-base font-normal leading-6 text-gray-900 outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10" /></label></div><button type="button" disabled={(values.activities?.items || []).length <= 1} onClick={() => removeActivity(index)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-200 px-3 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Remove ${item.title || 'activity'}`}><IconTrash className="h-4 w-4" /></button></article>)}</div>
        </section>

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
