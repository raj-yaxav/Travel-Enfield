import { connectDatabase } from '../lib/mongodb';
import { Blog, Destination, Hotel, Trip } from '../server/models';
import { blogs as seedBlogs, destinations as seedDestinations, hotels as seedHotels, trips as seedTrips } from '../server/seed';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.travelenfield.in').replace(/\/$/, '');
const validSlug = value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ''));
const absoluteUrl = value => {
  if (!value) return undefined;
  try { return new URL(value, siteUrl).toString(); } catch { return undefined; }
};
const asDate = value => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : undefined;
};
const mergeBySlug = (databaseItems, fallbackItems) => {
  const stored = new Map((databaseItems || []).filter(item => validSlug(item.slug)).map(item => [item.slug, item]));
  (fallbackItems || []).filter(item => validSlug(item.slug) && !stored.has(item.slug)).forEach(item => stored.set(item.slug, item));
  return [...stored.values()];
};
const entry = (path, lastModified, changeFrequency, priority, image) => ({
  url: `${siteUrl}${path}`,
  ...(asDate(lastModified) ? { lastModified: asDate(lastModified) } : {}),
  ...(absoluteUrl(image) ? { images: [absoluteUrl(image)] } : {}),
  changeFrequency,
  priority,
});

// This remains available during a temporary database outage: seeded pages are
// still listed, while the next cached generation picks up all admin additions.
export default async function sitemap() {
  const staticEntries = [
    entry('/', undefined, 'weekly', 1),
    entry('/upcoming-trips', undefined, 'daily', 0.9),
    entry('/trips', undefined, 'weekly', 0.9),
    entry('/domestic-trips', undefined, 'weekly', 0.9),
    entry('/international-trips', undefined, 'weekly', 0.9),
    entry('/weekend-trips', undefined, 'weekly', 0.8),
    entry('/bike-trips', undefined, 'weekly', 0.8),
    entry('/backpacking-trips', undefined, 'weekly', 0.8),
    entry('/trekking-trips', undefined, 'weekly', 0.8),
    entry('/deals', undefined, 'weekly', 0.8),
    entry('/destinations', undefined, 'weekly', 0.9),
    entry('/hotels', undefined, 'weekly', 0.8),
    entry('/blog', undefined, 'weekly', 0.8),
    entry('/corporate-tours', undefined, 'monthly', 0.7),
    entry('/custom-trip', undefined, 'monthly', 0.7),
    entry('/about-us', undefined, 'monthly', 0.6),
    entry('/reviews', undefined, 'monthly', 0.6),
    entry('/contact-us', undefined, 'yearly', 0.5),
    entry('/privacy-policy', undefined, 'yearly', 0.3),
    entry('/cancellation-policy', undefined, 'yearly', 0.3),
    entry('/terms-and-conditions', undefined, 'yearly', 0.3),
  ];

  let database = { trips: [], destinations: [], hotels: [], blogs: [] };
  try {
    await connectDatabase();
    const [trips, destinations, hotels, blogs] = await Promise.all([
      Trip.find({}, { slug: 1, image: 1, updatedAt: 1 }).lean(),
      Destination.find({}, { slug: 1, image: 1, updatedAt: 1 }).lean(),
      Hotel.find({}, { slug: 1, image: 1, updatedAt: 1 }).lean(),
      Blog.find({}, { slug: 1, image: 1, updatedAt: 1, publishedAt: 1 }).lean(),
    ]);
    database = { trips, destinations, hotels, blogs };
  } catch (error) {
    console.warn(`Sitemap database read failed; using seeded URLs: ${error.message}`);
  }

  const tripEntries = mergeBySlug(database.trips, seedTrips)
    .map(item => entry(`/trips/${item.slug}`, item.updatedAt, 'weekly', 0.8, item.image));
  const destinationEntries = mergeBySlug(database.destinations, seedDestinations)
    .map(item => entry(`/destinations/${item.slug}`, item.updatedAt, 'weekly', 0.8, item.image));
  const hotelEntries = mergeBySlug(database.hotels, seedHotels)
    .map(item => entry(`/hotels/${item.slug}`, item.updatedAt, 'weekly', 0.7, item.image));
  const blogEntries = mergeBySlug(database.blogs, seedBlogs)
    .map(item => entry(`/blog/${item.slug}`, item.updatedAt || item.publishedAt, 'monthly', 0.7, item.image));

  return [...staticEntries, ...tripEntries, ...destinationEntries, ...hotelEntries, ...blogEntries];
}
