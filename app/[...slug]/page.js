import LegacyDocument from '../../components/LegacyDocument';
import { cache } from 'react';
import { readLegacyBody } from '../../lib/legacy-document';
import { connectDatabase } from '../../lib/mongodb';
import { notFound } from 'next/navigation';
import { Blog, Destination, Hotel, Trip } from '../../server/models';
import { blogs, destinations, hotels, trips } from '../../server/seed';

export const dynamic = 'force-dynamic';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.travelenfield.in').replace(/\/$/, '');
const readable = value => String(value || '').replaceAll('-', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
const validSlug = value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ''));
const findSeed = (items, slug) => items.find(item => item.slug === slug) || null;
const defaultImage = 'https://res.cloudinary.com/rgw1moxc/image/upload/f_auto,q_auto,w_1600,dpr_auto/travelenfield/group-trips-himalaya-hero.jpg';
const absoluteUrl = value => {
  if (!value) return defaultImage;
  try { return new URL(value, siteUrl).toString(); } catch { return defaultImage; }
};
const titleWithoutBrand = value => String(value || '').replace(/\s*[|â€”â€“-]\s*TravelEnfield\s*$/i, '').trim();

const listingMetadata = {
  trips: ['Group Trip Packages', 'Compare curated group trips, fixed departures, dates, itineraries and prices with TravelEnfield.'],
  'upcoming-trips': ['Upcoming Group Trips', 'Find upcoming group trip departures, travel dates, prices and curated experiences with TravelEnfield.'],
  'domestic-trips': ['Domestic Tour Packages', 'Explore curated domestic tour packages across India, with fixed departures, transparent prices and expert trip support.'],
  'international-trips': ['International Tour Packages', 'Explore international group tours and customised holidays with practical itineraries, clear pricing and expert support.'],
  'weekend-trips': ['Weekend Getaway Packages', 'Plan a quick weekend escape with curated group trips, clear inclusions and convenient departures.'],
  'bike-trips': ['Bike Trip Packages', 'Explore guided bike trips with scenic routes, experienced trip captains and practical travel support.'],
  'backpacking-trips': ['Backpacking Trip Packages', 'Join social backpacking trips with curated stays, flexible experiences and a welcoming travel community.'],
  'trekking-trips': ['Trekking Trip Packages', 'Discover guided trekking trips with route planning, experienced support and unforgettable mountain experiences.'],
  'family-vacations': ['Family Vacation Packages', 'Plan comfortable family holidays with thoughtful stays, shared experiences and flexible itineraries from TravelEnfield.'],
  'india-escapes': ['India Escape Packages', 'Explore curated India escapes across mountains, coastlines and culture-rich destinations with TravelEnfield.'],
  'world-journeys': ['International Holiday Packages', 'Discover curated international holidays with practical itineraries, memorable stays and expert support.'],
  'romance-honeymoons': ['Romantic Getaways & Honeymoons', 'Plan a beautiful honeymoon or romantic escape with memorable stays and thoughtful travel details.'],
  'short-breaks-staycations': ['Short Breaks & Staycations', 'Find refreshing short breaks, staycations and quick getaways designed for your next days off.'],
  'spiritual-journeys': ['Spiritual Journey Packages', 'Explore meaningful spiritual journeys with serene routes, thoughtful planning and unhurried travel.'],
  deals: ['Travel Deals & Offers', 'Browse current TravelEnfield offers on group departures, weekend trips and curated holidays.'],
  destinations: ['Travel Destinations', 'Explore destination guides, tour packages, best times to visit and curated trips across India and beyond.'],
  hotels: ['Handpicked Hotels & Stays', 'Browse handpicked hotels and stays for memorable trips, from mountain escapes to beachside holidays.'],
  blog: ['Travel Blog & Destination Guides', 'Read destination guides, route advice, packing tips and practical travel stories from TravelEnfield.'],
  'corporate-tours': ['Corporate Tours & Team Offsites', 'Plan corporate offsites, team retreats and group travel experiences tailored to your team’s goals.'],
  'custom-trip': ['Customised Tour Packages', 'Plan a personalised trip around your dates, destination, pace, budget and travel style.'],
  'about-us': ['About TravelEnfield', 'Meet the travel community behind thoughtful group journeys, shared experiences and memorable stories.'],
  reviews: ['Traveller Reviews', 'Read real traveller reviews and stories from TravelEnfield group trips and holidays.'],
  'contact-us': ['Contact TravelEnfield', 'Contact TravelEnfield to plan a group trip, customised holiday, corporate offsite or travel enquiry.'],
  'privacy-policy': ['Privacy Policy', 'Read the TravelEnfield privacy policy and how we handle your information.'],
  'cancellation-policy': ['Cancellation & Refund Policy', 'Read TravelEnfield cancellation, refund and rescheduling terms before booking your trip.'],
  'terms-and-conditions': ['Terms & Conditions', 'Read the TravelEnfield terms and conditions for travel bookings and website use.'],
};

const withTimeout = (promise, timeoutMs = 1500) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error('Metadata lookup timed out')), timeoutMs)),
]);

// The same item is required by both generateMetadata and the JSON-LD block.
// React cache shares that lookup for the request, and the short timeout keeps a
// slow database from delaying a public route; seed content remains the fallback.
const findContent = cache(async (collection, fallback, slug) => {
  if (!validSlug(slug)) return null;
  try {
    const item = await withTimeout((async () => {
      await connectDatabase();
      return collection.findOne({ slug }).lean();
    })());
    if (item) return item;
  } catch {
    // Seed content keeps metadata available during a temporary DB outage.
  }
  return findSeed(fallback, slug);
});

const metadataFor = (title, description, image, pathname, type = 'website') => ({
  title: titleWithoutBrand(title),
  description,
  alternates: { canonical: `${siteUrl}${pathname}` },
  openGraph: {
    title: `${title} | TravelEnfield`, description, url: `${siteUrl}${pathname}`,
    siteName: 'TravelEnfield', locale: 'en_IN', type,
    images: [{ url: absoluteUrl(image), width: 1600, height: 900, alt: title }],
  },
  twitter: { card: 'summary_large_image', title: `${title} | TravelEnfield`, description, images: [absoluteUrl(image)] },
});

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  const [section, itemSlug] = slug;
  const pathname = `/${slug.join('/')}` || '/';

  if (['login', 'signup', 'profile', 'admin', 'announcement'].includes(section)) return { robots: { index: false, follow: false } };

  if (section === 'trips' && itemSlug) {
    const trip = await findContent(Trip, trips, itemSlug);
    if (!trip) return { title: 'Trip not found', robots: { index: false, follow: false } };
    return metadataFor(trip.seoTitle || `${trip.title} | ${trip.duration || 'Group Tour Package'}`, trip.seoDescription || trip.summary || `Explore the ${trip.title} with itinerary, trip dates, inclusions and transparent pricing from TravelEnfield.`, trip.image, pathname);
  }
  if (section === 'destinations' && itemSlug) {
    const destination = await findContent(Destination, destinations, itemSlug);
    if (!destination) return { title: 'Destination not found', robots: { index: false, follow: false } };
    return metadataFor(destination.seoTitle || `${destination.name} Tour Packages & Travel Guide`, destination.seoDescription || destination.summary || `Plan your ${destination.name} holiday with highlights, the best time to visit and curated tour packages.`, destination.image, pathname);
  }
  if (section === 'hotels' && itemSlug) {
    const hotel = await findContent(Hotel, hotels, itemSlug);
    if (!hotel) return { title: 'Hotel not found', robots: { index: false, follow: false } };
    return metadataFor(`${hotel.name}${hotel.location ? ` in ${hotel.location}` : ''} | Hotel Stay`, hotel.summary || hotel.tagline || `View rooms, amenities, location and stay details for ${hotel.name} with TravelEnfield.`, hotel.image, pathname);
  }
  if (section === 'blog' && itemSlug) {
    const blog = await findContent(Blog, blogs, itemSlug);
    if (!blog) return { title: 'Article not found', robots: { index: false, follow: false } };
    return metadataFor(blog.seoTitle || blog.title, blog.seoDescription || blog.excerpt || `Read ${blog.title}, a practical travel guide from TravelEnfield.`, blog.image, pathname, 'article');
  }

  const listing = listingMetadata[section];
  if (listing && slug.length === 1) return metadataFor(listing[0], listing[1], defaultImage, pathname);
  return metadataFor(readable(slug.at(-1)) || 'Explore Travel', 'Explore curated trips, destination guides and travel experiences with TravelEnfield.', defaultImage, pathname);
}

const jsonLd = value => JSON.stringify(value).replace(/</g, '\\u003c');
const breadcrumb = items => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${siteUrl}${item.path}`,
  })),
});
const organization = {
  '@type': 'TravelAgency',
  name: 'TravelEnfield',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
};

async function structuredDataFor(slug) {
  const [section, itemSlug] = slug;
  if (!itemSlug || !['trips', 'destinations', 'hotels', 'blog'].includes(section)) return [];
  const path = `/${slug.join('/')}`;
  const collection = { trips: Trip, destinations: Destination, hotels: Hotel, blog: Blog }[section];
  const seeds = { trips, destinations, hotels, blog: blogs }[section];
  const item = await findContent(collection, seeds, itemSlug);
  if (!item) return [];

  const sectionName = { trips: 'Trips', destinations: 'Destinations', hotels: 'Hotels', blog: 'Travel Blog' }[section];
  const schemas = [breadcrumb([
    { name: 'Home', path: '/' },
    { name: sectionName, path: section === 'blog' ? '/blog' : `/${section}` },
    { name: item.title || item.name, path },
  ])];
  const common = {
    '@context': 'https://schema.org',
    name: item.title || item.name,
    description: item.seoDescription || item.summary || item.excerpt || item.tagline,
    image: absoluteUrl(item.image),
    url: `${siteUrl}${path}`,
  };

  if (section === 'trips') schemas.push({
    ...common,
    '@type': 'TouristTrip',
    provider: organization,
    offers: item.price ? {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: item.price,
      url: `${siteUrl}${path}`,
      availability: 'https://schema.org/InStock',
    } : undefined,
  });
  if (section === 'destinations') schemas.push({ ...common, '@type': 'TouristDestination', touristType: 'Group travel' });
  if (section === 'hotels') schemas.push({
    ...common,
    '@type': 'Hotel',
    address: item.location ? { '@type': 'PostalAddress', addressLocality: item.location } : undefined,
    starRating: item.star ? { '@type': 'Rating', ratingValue: item.star } : undefined,
    priceRange: item.pricePerNight ? `₹${item.pricePerNight}` : undefined,
  });
  if (section === 'blog') schemas.push({
    ...common,
    '@type': 'BlogPosting',
    headline: item.title,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}${path}` },
    datePublished: item.publishedAt ? new Date(item.publishedAt).toISOString() : undefined,
    dateModified: item.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
    author: { '@type': 'Organization', name: item.author || 'TravelEnfield' },
    publisher: organization,
  });
  return schemas;
}

export default async function ContentPage({ params }) {
  const { slug = [] } = await params;
  const [section, itemSlug] = slug;
  const publicSingleRoutes = new Set(['trips', 'upcoming-trips', 'domestic-trips', 'international-trips', 'weekend-trips', 'deals', 'backpacking-trips', 'trekking-trips', 'bike-trips', 'family-vacations', 'india-escapes', 'world-journeys', 'romance-honeymoons', 'short-breaks-staycations', 'spiritual-journeys', 'destinations', 'hotels', 'custom-trip', 'corporate-tours', 'blog', 'reviews', 'about-us', 'contact-us', 'faq', 'privacy-policy', 'terms-and-conditions', 'cancellation-policy', 'profile', 'login', 'signup', 'announcement']);
  const detailRoute = ['trips', 'destinations', 'hotels', 'blog'].includes(section) && Boolean(itemSlug) && slug.length === 2;
  if ((!detailRoute && (slug.length !== 1 || !publicSingleRoutes.has(section))) || (['trips', 'destinations', 'hotels', 'blog'].includes(section) && !detailRoute)) notFound();
  const schemas = await structuredDataFor(slug);
  if (detailRoute && !schemas.length) notFound();
  return <>
    {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />)}
    <LegacyDocument entry="app" html={readLegacyBody('app')} />
  </>;
}
