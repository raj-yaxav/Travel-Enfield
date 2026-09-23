import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../lib/mongodb';
import { SiteSettings } from '../../../server/models';

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
  domestic: { title: 'Domestic Trips', links: [
    ['Ladakh Tour Packages', '/destinations/ladakh'], ['Spiti Tour Packages', '/destinations/spiti'], ['Manali Tour Packages', '/destinations/manali'], ['Meghalaya Tour Packages', '/destinations/meghalaya'], ['Kerala Tour Packages', '/destinations/kerala'], ['Kashmir Tour Packages', '/destinations/kashmir'], ['Himachal Tour Packages', '/destinations/himachal'], ['Uttarakhand Tour Packages', '/destinations/uttarakhand'], ['Rajasthan Tour Packages', '/destinations/rajasthan'], ['Andaman Tour Packages', '/destinations/andaman'],
  ].map(([label, href]) => ({ label, href })) },
  international: { title: 'International Trips', links: [
    ['Bali Tour Packages', '/destinations/bali'], ['Thailand Tour Packages', '/destinations/thailand'], ['Nepal Tour Packages', '/destinations/nepal'], ['Vietnam Tour Packages', '/destinations/vietnam'], ['Sri Lanka Tour Packages', '/destinations/sri-lanka'], ['Bhutan Tour Packages', '/destinations/bhutan'], ['Dubai Tour Packages', '/destinations/dubai'], ['Maldives Tour Packages', '/destinations/maldives'], ['Singapore Tour Packages', '/destinations/singapore'],
  ].map(([label, href]) => ({ label, href })) },
};
const footerTripGroups = settings => Object.fromEntries(Object.entries(DEFAULT_FOOTER_TRIP_GROUPS).map(([key, fallback]) => {
  const group = settings?.footerTripGroups?.[key];
  return [key, Array.isArray(group?.links) && group.links.length ? { ...fallback, ...group } : fallback];
}));

// This endpoint is intentionally limited to the three public fields used by
// the site chrome. It never serialises internal settings or user data.
export async function GET() {
  try {
    await connectDatabase();
    const settings = await SiteSettings.findOne({ key: 'site' }).lean();
    return NextResponse.json({
      announcementEnabled: settings?.announcementEnabled ?? DEFAULT_ANNOUNCEMENT.announcementEnabled,
      announcementText: settings?.announcementText || DEFAULT_ANNOUNCEMENT.announcementText,
      announcementHref: '/announcement',
      datesAvailableMessage: settings?.datesAvailableMessage || DEFAULT_DATES_AVAILABLE_MESSAGE,
      announcementLanding: { ...DEFAULT_ANNOUNCEMENT_LANDING, ...(settings?.announcementLanding || {}) },
      aboutFounder: { ...DEFAULT_FOUNDER, ...(settings?.aboutFounder || {}) },
      aboutTeam: Array.isArray(settings?.aboutTeam) && settings.aboutTeam.length ? settings.aboutTeam : DEFAULT_TEAM,
      footerTripGroups: footerTripGroups(settings),
      activities: settings?.activities?.items?.length ? settings.activities : DEFAULT_ACTIVITIES,
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    // The static fallback in the HTML remains usable if the catalogue database
    // is temporarily unavailable, so a banner never blocks page rendering.
    console.error('Unable to load site settings:', error);
    return NextResponse.json({ ...DEFAULT_ANNOUNCEMENT, announcementHref: '/announcement', datesAvailableMessage: DEFAULT_DATES_AVAILABLE_MESSAGE, announcementLanding: DEFAULT_ANNOUNCEMENT_LANDING, aboutFounder: DEFAULT_FOUNDER, aboutTeam: DEFAULT_TEAM, footerTripGroups: DEFAULT_FOOTER_TRIP_GROUPS, activities: DEFAULT_ACTIVITIES }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  }
}
