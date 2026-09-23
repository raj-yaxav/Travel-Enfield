import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../lib/mongodb';
import { isAdminRequest } from '../../../../lib/admin-auth';
import { destroyCloudinaryImages, destroyCloudinaryVideos } from '../../../../lib/cloudinary';
import { SiteSettings, Trip } from '../../../../server/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_ANNOUNCEMENT = {
  announcementEnabled: true,
  announcementText: 'Monsoon Sale is LIVE — Flat ₹5,000 Off',
  announcementHref: '/deals',
};
const DEFAULT_DATES_AVAILABLE_MESSAGE = 'All dates available — send an enquiry for your preferred date.';
const DEFAULT_ANNOUNCEMENT_LANDING = {
  eyebrow: 'Limited-time offer', title: 'Explore India', description: 'From Himalayan roads to tropical backwaters, discover curated journeys closer to home.',
  image: 'https://res.cloudinary.com/rgw1moxc/image/upload/travelenfield/destinations/ladakh.jpg', tripSlugs: [],
};
const DEFAULT_FOUNDER = {
  name: 'TravelEnfield Team', role: 'Founder & CEO, TravelEnfield', image: '/images/reviews/yash.webp',
  instagramUrl: '', linkedinUrl: '',
  bio: 'TravelEnfield is built around a simple belief: the best journeys connect people, places and stories worth bringing home.',
};
const DEFAULT_TEAM = [
  { name: 'Sumit Jha', role: 'Co-Founder & CTO', image: '/images/reviews/yash.webp' },
  { name: 'Vishal Kapoor', role: 'Sales Head', image: '/images/reviews/virender-singh.webp' },
  { name: 'Shazan Abbas', role: 'International Operations Head', image: '/images/reviews/suleman-ahmad.webp' },
  { name: 'Piyush Verma', role: 'Domestic Operations Head', image: '/images/reviews/dishant-soni.webp' },
];
const DEFAULT_ACTIVITIES = {
  eyebrow: 'Explore. Experience. Enrich.', title: 'Our Activities',
  description: 'From breathtaking landscapes to thrilling adventures, discover the experiences that make every journey unforgettable.',
  items: [
    ['Mountain Diaries', 'Little moments from the road, the trails and the views that stay with you.', 'https://res.cloudinary.com/rgw1moxc/video/upload/travelenfield/activity/112040-695204669-medium.mp4'],
    ['Ride With Us', 'Open roads, good company and the kind of ride you keep talking about.', 'https://res.cloudinary.com/rgw1moxc/video/upload/travelenfield/activity/1408-147169812-small.mp4'],
    ['The Group Vibe', 'Meet the people who turn every itinerary into a shared story.', 'https://res.cloudinary.com/rgw1moxc/video/upload/travelenfield/activity/197898-905833761-medium.mp4'],
  ].map(([title, description, video]) => ({ title, description, video })),
};
const DEFAULT_FOOTER_TRIP_GROUPS = {
  domestic: { title: 'Domestic Trips', links: [['Ladakh Tour Packages', '/destinations/ladakh'], ['Spiti Tour Packages', '/destinations/spiti'], ['Manali Tour Packages', '/destinations/manali'], ['Meghalaya Tour Packages', '/destinations/meghalaya'], ['Kerala Tour Packages', '/destinations/kerala'], ['Kashmir Tour Packages', '/destinations/kashmir'], ['Himachal Tour Packages', '/destinations/himachal'], ['Uttarakhand Tour Packages', '/destinations/uttarakhand'], ['Rajasthan Tour Packages', '/destinations/rajasthan'], ['Andaman Tour Packages', '/destinations/andaman']].map(([label, href]) => ({ label, href })) },
  international: { title: 'International Trips', links: [['Bali Tour Packages', '/destinations/bali'], ['Thailand Tour Packages', '/destinations/thailand'], ['Nepal Tour Packages', '/destinations/nepal'], ['Vietnam Tour Packages', '/destinations/vietnam'], ['Sri Lanka Tour Packages', '/destinations/sri-lanka'], ['Bhutan Tour Packages', '/destinations/bhutan'], ['Dubai Tour Packages', '/destinations/dubai'], ['Maldives Tour Packages', '/destinations/maldives'], ['Singapore Tour Packages', '/destinations/singapore']].map(([label, href]) => ({ label, href })) },
};
const footerTripGroups = settings => Object.fromEntries(Object.entries(DEFAULT_FOOTER_TRIP_GROUPS).map(([key, fallback]) => {
  const group = settings?.footerTripGroups?.[key];
  return [key, Array.isArray(group?.links) && group.links.length ? { ...fallback, ...group } : fallback];
}));

const json = (data, status = 200) => NextResponse.json(data, { status });

function publicSettings(settings) {
  return {
    announcementEnabled: settings?.announcementEnabled ?? DEFAULT_ANNOUNCEMENT.announcementEnabled,
    announcementText: settings?.announcementText || DEFAULT_ANNOUNCEMENT.announcementText,
    announcementHref: '/announcement',
    datesAvailableMessage: settings?.datesAvailableMessage || DEFAULT_DATES_AVAILABLE_MESSAGE,
    announcementLanding: { ...DEFAULT_ANNOUNCEMENT_LANDING, ...(settings?.announcementLanding || {}) },
    aboutFounder: { ...DEFAULT_FOUNDER, ...(settings?.aboutFounder || {}) },
    aboutTeam: Array.isArray(settings?.aboutTeam) && settings.aboutTeam.length ? settings.aboutTeam : DEFAULT_TEAM,
    footerTripGroups: footerTripGroups(settings),
    activities: settings?.activities?.items?.length ? settings.activities : DEFAULT_ACTIVITIES,
  };
}

async function validateAnnouncement(body) {
  const announcementText = String(body?.announcementText || '').trim().replace(/\s+/g, ' ');
  const datesAvailableMessage = String(body?.datesAvailableMessage ?? DEFAULT_DATES_AVAILABLE_MESSAGE).trim().replace(/\s+/g, ' ');

  if (!announcementText) throw new Error('Banner message is required');
  if (announcementText.length > 140) throw new Error('Banner message must be 140 characters or fewer');
  if (!datesAvailableMessage || datesAvailableMessage.length > 220) throw new Error('Dates available message is required and must be 220 characters or fewer');
  return {
    announcementEnabled: Boolean(body?.announcementEnabled),
    announcementText,
    announcementHref: '/announcement',
    datesAvailableMessage,
    announcementLanding: await validateAnnouncementLanding(body?.announcementLanding),
    aboutFounder: validateFounder(body?.aboutFounder),
    aboutTeam: validateTeam(body?.aboutTeam),
    footerTripGroups: validateFooterTripGroups(body?.footerTripGroups),
    activities: validateActivities(body?.activities),
  };
}

async function validateAnnouncementLanding(landing) {
  const value = landing && typeof landing === 'object' ? landing : {};
  const text = (field, fallback, maximum) => {
    const result = String(value[field] ?? fallback).trim().replace(/\s+/g, ' ');
    if (!result || result.length > maximum) throw new Error(`Announcement page ${field} is required and must be ${maximum} characters or fewer`);
    return result;
  };
  const image = String(value.image ?? DEFAULT_ANNOUNCEMENT_LANDING.image).trim();
  try { const parsed = new URL(image); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(); } catch { throw new Error('Announcement page hero image must be a valid HTTP(S) URL'); }
  const tripSlugs = Array.isArray(value.tripSlugs) ? value.tripSlugs.map(slug => String(slug || '').trim()) : [];
  if (tripSlugs.length > 50 || tripSlugs.some(slug => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) || new Set(tripSlugs).size !== tripSlugs.length) throw new Error('Announcement page trip selection is invalid');
  if (tripSlugs.length) {
    const found = await Trip.find({ slug: { $in: tripSlugs } }, { slug: 1 }).lean();
    if (found.length !== tripSlugs.length) throw new Error('One or more selected announcement page trips no longer exist');
  }
  return { eyebrow: text('eyebrow', DEFAULT_ANNOUNCEMENT_LANDING.eyebrow, 80), title: text('title', DEFAULT_ANNOUNCEMENT_LANDING.title, 120), description: text('description', DEFAULT_ANNOUNCEMENT_LANDING.description, 500), image, tripSlugs };
}

function validateActivities(activities) {
  const value = activities && typeof activities === 'object' ? activities : DEFAULT_ACTIVITIES;
  const text = (field, fallback, maximum) => {
    const result = String(value[field] ?? fallback).trim().replace(/\s+/g, ' ');
    if (!result || result.length > maximum) throw new Error(`Activities ${field} is required and must be ${maximum} characters or fewer`);
    return result;
  };
  if (!Array.isArray(value.items) || value.items.length < 1 || value.items.length > 8) throw new Error('Add between 1 and 8 activity videos');
  const items = value.items.map((item, index) => {
    const title = String(item?.title || '').trim().replace(/\s+/g, ' ');
    const description = String(item?.description || '').trim().replace(/\s+/g, ' ');
    const video = String(item?.video || '').trim();
    if (!title || title.length > 100 || !description || description.length > 280 || !video || video.length > 2048) throw new Error(`Activity ${index + 1} needs a title, description and video`);
    try { const parsed = new URL(video); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(); } catch { throw new Error(`Activity ${index + 1} needs a valid video URL`); }
    return { title, description, video };
  });
  return { eyebrow: text('eyebrow', DEFAULT_ACTIVITIES.eyebrow, 80), title: text('title', DEFAULT_ACTIVITIES.title, 100), description: text('description', DEFAULT_ACTIVITIES.description, 320), items };
}

function validateFounder(founder) {
  const value = founder && typeof founder === 'object' ? founder : {};
  const text = (field, fallback, maximum) => {
    const result = String(value[field] ?? fallback).trim().replace(/\s+/g, ' ');
    if (!result) throw new Error(`${field} is required`);
    if (result.length > maximum) throw new Error(`${field} is too long`);
    return result;
  };
  const url = (field, fallback = '') => {
    const result = String(value[field] ?? fallback).trim();
    if (!result) return '';
    if (result.startsWith('/') && !result.startsWith('//')) return result;
    try {
      const parsed = new URL(result);
      if (['http:', 'https:'].includes(parsed.protocol)) return result;
    } catch {}
    throw new Error(`${field} must be an internal path or an HTTP(S) URL`);
  };
  return {
    name: text('name', DEFAULT_FOUNDER.name, 100), role: text('role', DEFAULT_FOUNDER.role, 140),
    image: url('image', DEFAULT_FOUNDER.image) || DEFAULT_FOUNDER.image,
    instagramUrl: url('instagramUrl'), linkedinUrl: url('linkedinUrl'), bio: text('bio', DEFAULT_FOUNDER.bio, 2400),
  };
}

function validateTeam(team) {
  if (!Array.isArray(team)) return DEFAULT_TEAM;
  if (team.length > 12) throw new Error('You can add up to 12 team members');
  return team.map((member, index) => {
    const value = member && typeof member === 'object' ? member : {};
    const name = String(value.name || '').trim().replace(/\s+/g, ' ');
    const role = String(value.role || '').trim().replace(/\s+/g, ' ');
    const image = String(value.image || '').trim();
    if (!name || !role || !image) throw new Error(`Team member ${index + 1} needs a name, role and profile photo`);
    if (name.length > 100 || role.length > 140 || image.length > 2048) throw new Error(`Team member ${index + 1} has a field that is too long`);
    if (image.startsWith('/') && !image.startsWith('//')) return { name, role, image };
    try {
      const parsed = new URL(image);
      if (['http:', 'https:'].includes(parsed.protocol)) return { name, role, image };
    } catch {}
    throw new Error(`Team member ${index + 1} needs a valid image URL`);
  });
}

function validateFooterTripGroups(groups) {
  const validUrl = (value, message) => {
    const href = String(value || '').trim();
    if (!href) throw new Error(message);
    if (href.startsWith('/') && !href.startsWith('//')) return href;
    try { const parsed = new URL(href); if (['http:', 'https:'].includes(parsed.protocol)) return href; } catch {}
    throw new Error(`${message} must be an internal path or HTTP(S) URL`);
  };
  return Object.fromEntries(Object.entries(DEFAULT_FOOTER_TRIP_GROUPS).map(([key, fallback]) => {
    const group = groups?.[key];
    if (!group || !Array.isArray(group.links)) return [key, fallback];
    const title = String(group.title || '').trim().replace(/\s+/g, ' ');
    if (!title || title.length > 60) throw new Error(`${key} footer heading is required and must be 60 characters or fewer`);
    if (!group.links.length || group.links.length > 14) throw new Error(`${title} needs between 1 and 14 links`);
    const links = group.links.map((link, index) => {
      const label = String(link?.label || '').trim().replace(/\s+/g, ' ');
      if (!label || label.length > 100) throw new Error(`${title} link ${index + 1} needs a label of 100 characters or fewer`);
      return { label, href: validUrl(link?.href, `${title} link ${index + 1}`) };
    });
    return [key, { title, links }];
  }));
}

export async function GET(request) {
  if (!isAdminRequest(request)) return json({ error: 'Not authenticated' }, 401);
  try {
    await connectDatabase();
    const settings = await SiteSettings.findOne({ key: 'site' }).lean();
    return json(publicSettings(settings));
  } catch (error) {
    console.error('Unable to load admin site settings:', error);
    return json({ error: 'Unable to load site settings' }, 500);
  }
}

export async function PUT(request) {
  if (!isAdminRequest(request)) return json({ error: 'Not authenticated' }, 401);
  try {
    await connectDatabase();
    const values = await validateAnnouncement(await request.json());
    const previous = await SiteSettings.findOne({ key: 'site' }).lean();
    const settings = await SiteSettings.findOneAndUpdate(
      { key: 'site' },
      { $set: values, $setOnInsert: { key: 'site' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    const previousFounderImage = previous?.aboutFounder?.image;
    const nextFounderImage = settings?.aboutFounder?.image;
    const stillUsedByTeam = Array.isArray(settings?.aboutTeam) && settings.aboutTeam.some(member => member?.image === previousFounderImage);
    if (previousFounderImage && previousFounderImage !== nextFounderImage && !stillUsedByTeam) {
      const result = await destroyCloudinaryImages([previousFounderImage]);
      if (result.failed.length) console.warn('Could not delete the replaced founder image:', result.failed);
    }
    const previousActivityVideos = (previous?.activities?.items || []).map(item => item?.video).filter(Boolean);
    const nextActivityVideos = (settings?.activities?.items || []).map(item => item?.video).filter(Boolean);
    const removedActivityVideos = previousActivityVideos.filter(video => !nextActivityVideos.includes(video));
    if (removedActivityVideos.length) {
      const result = await destroyCloudinaryVideos(removedActivityVideos);
      if (result.failed.length) console.warn('Could not delete some replaced activity videos:', result.failed);
    }
    return json(publicSettings(settings));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save site settings';
    return json({ error: message }, 400);
  }
}
