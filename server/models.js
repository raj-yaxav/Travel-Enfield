import mongoose from 'mongoose';

const options = { timestamps: true, strict: true };
const Destination = mongoose.models.Destination || mongoose.model('Destination', new mongoose.Schema({
  name: { type: String, required: true }, slug: { type: String, required: true, unique: true, index: true },
  category: { type: String, enum: ['domestic', 'international'], required: true }, image: String,
  tagline: String, summary: String, startingPrice: Number, bestTime: String,
  seoTitle: String, seoDescription: String, overview: String, planningNotes: String,
  idealDuration: String, gettingThere: String, localInsight: String,
  highlights: [String], thingsToDo: [String], travelTips: [String], faq: [{ question: String, answer: String }],
  recommendationMode: { type: String, enum: ['auto', 'manual'], default: 'auto' },
  relatedTripSlugs: [String], recommendedHotelSlugs: [String], recommendedBlogSlugs: [String],
}, options));
// Keep destination recommendation controls available during development when
// Mongoose reuses a model compiled before these fields were introduced.
if (!Destination.schema.path('recommendationMode')) {
  Destination.schema.add({
    recommendationMode: { type: String, enum: ['auto', 'manual'], default: 'auto' },
    relatedTripSlugs: [String], recommendedHotelSlugs: [String], recommendedBlogSlugs: [String],
  });
}
const Trip = mongoose.models.Trip || mongoose.model('Trip', new mongoose.Schema({
  title: { type: String, required: true }, slug: { type: String, required: true, unique: true, index: true },
  destinationSlug: { type: String, required: true, index: true }, categories: [String], image: String,
  duration: String, nights: Number, price: Number, oldPrice: Number, discount: String, badge: String,
  summary: String, groupSize: String, pickup: String, dates: [String], showDates: { type: Boolean, default: true },
  itinerary: [{ day: Number, title: String, details: [String] }], inclusions: [String], exclusions: [String],
  notes: [String],
  itineraryPdfIntro: { type: String, maxlength: 1800 },
  itineraryPdfMap: { type: String, maxlength: 2048 },
  itineraryPdfBookingNote: { type: String, maxlength: 700 },
  itineraryPdfHighlights: [{ type: String, maxlength: 180 }],
  itineraryPdfArrivalNote: { type: String, maxlength: 700 },
  itineraryPdfStayNote: { type: String, maxlength: 700 },
  itineraryPdfCancellationNote: { type: String, maxlength: 900 },
  featured: { type: Boolean, default: false },
  recommendationMode: { type: String, enum: ['auto', 'manual'], default: 'auto' },
  relatedTripSlugs: [String], recommendedHotelSlugs: [String], recommendedBlogSlugs: [String],
}, options));
// Mongoose preserves compiled models during Next development hot reloads. Keep
// the new field available even if a Trip model was compiled before this change.
if (!Trip.schema.path('showDates')) {
  Trip.schema.add({ showDates: { type: Boolean, default: true } });
}
// Keep recommendation fields available when Next hot reload reuses a previously
// compiled Mongoose model.
if (!Trip.schema.path('recommendationMode')) {
  Trip.schema.add({
    recommendationMode: { type: String, enum: ['auto', 'manual'], default: 'auto' },
    relatedTripSlugs: [String], recommendedHotelSlugs: [String], recommendedBlogSlugs: [String],
  });
}
// PDF itinerary fields are optional and can be filled per trip from the admin.
// Add them during development too when Mongoose has reused an older model.
if (!Trip.schema.path('itineraryPdfIntro')) {
  Trip.schema.add({
    itineraryPdfIntro: { type: String, maxlength: 1800 },
    itineraryPdfMap: { type: String, maxlength: 2048 },
    itineraryPdfBookingNote: { type: String, maxlength: 700 },
    itineraryPdfHighlights: [{ type: String, maxlength: 180 }],
    itineraryPdfArrivalNote: { type: String, maxlength: 700 },
    itineraryPdfStayNote: { type: String, maxlength: 700 },
    itineraryPdfCancellationNote: { type: String, maxlength: 900 },
  });
}
if (!Trip.schema.indexes().some(([fields]) => fields.destinationSlug === 1 && fields.categories === 1)) Trip.schema.index({ destinationSlug: 1, categories: 1 });
if (!Trip.schema.indexes().some(([fields]) => fields.categories === 1 && fields.featured === 1)) Trip.schema.index({ categories: 1, featured: 1 });
const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
  name: String, slug: { type: String, unique: true }, title: String, description: String, image: String, eyebrow: String, filters: [String],
  faq: [{ question: String, answer: String }],
}, options));
const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', new mongoose.Schema({
  name: { type: String, required: true }, slug: { type: String, required: true, unique: true, index: true },
  destinationSlug: { type: String, index: true }, location: String, area: String,
  star: { type: Number, default: 4 }, rating: { type: Number, default: 4.5 }, reviews: Number,
  image: String, gallery: [String], badge: String, tagline: String, summary: String,
  pricePerNight: Number, oldPricePerNight: Number, roomType: String,
  amenities: [String], highlights: [String], nearby: [String],
  rooms: [{ name: String, occupancy: String, size: String, bed: String, view: String, perks: [String], price: Number, oldPrice: Number }],
  policies: { checkIn: String, checkOut: String, cancellation: String },
  faq: [{ question: String, answer: String }], featured: { type: Boolean, default: false },
}, options));
if (!Hotel.schema.indexes().some(([fields]) => fields.destinationSlug === 1 && fields.rating === -1)) Hotel.schema.index({ destinationSlug: 1, rating: -1 });
const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({
  title: String, slug: { type: String, unique: true }, excerpt: String, image: String, category: String,
  author: String, readTime: String, publishedAt: Date, seoTitle: String, seoDescription: String,
  sections: [{ heading: String, body: String, bullets: [String] }],
}, options));
if (!Blog.schema.indexes().some(([fields]) => fields.publishedAt === -1)) Blog.schema.index({ publishedAt: -1 });
const Page = mongoose.models.Page || mongoose.model('Page', new mongoose.Schema({
  slug: { type: String, unique: true }, title: String, eyebrow: String, intro: String,
  sections: [{ heading: String, body: String }],
}, options));
const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', new mongoose.Schema({
  type: { type: String, default: 'general' }, name: String, phone: String, email: String, destination: String,
  travelDate: String, travellers: Number, budget: String, message: String, status: { type: String, default: 'new' },
}, options));
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  name: String, email: { type: String, unique: true, lowercase: true }, phone: String, passwordHash: String,
  otpHash: String, otpExpiresAt: Date, otpAttempts: { type: Number, default: 0 }, otpVerifiedAt: Date,
}, options));

// A deliberately small, singleton document for public-facing site controls.
// Keep it separate from editable page content so the announcement can be
// fetched safely by the legacy home and route renderers without exposing any
// private administration data.
const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'site' },
  announcementEnabled: { type: Boolean, default: true },
  announcementText: { type: String, default: 'Monsoon Sale is LIVE — Flat ₹5,000 Off', maxlength: 140 },
  announcementHref: { type: String, default: '/deals', maxlength: 2048 },
  datesAvailableMessage: { type: String, default: 'All dates available — send an enquiry for your preferred date.', maxlength: 220 },
  announcementLanding: { eyebrow: { type: String, maxlength: 80 }, title: { type: String, maxlength: 120 }, description: { type: String, maxlength: 500 }, image: { type: String, maxlength: 2048 }, tripSlugs: [String] },
  aboutFounder: {
    name: { type: String, default: 'TravelEnfield Team', maxlength: 100 },
    role: { type: String, default: 'Founder & CEO, TravelEnfield', maxlength: 140 },
    image: { type: String, default: '/images/reviews/yash.webp', maxlength: 2048 },
    instagramUrl: { type: String, default: '', maxlength: 2048 },
    linkedinUrl: { type: String, default: '', maxlength: 2048 },
    bio: { type: String, default: 'TravelEnfield is built around a simple belief: the best journeys connect people, places and stories worth bringing home.', maxlength: 2400 },
  },
  aboutTeam: [{ name: { type: String, maxlength: 100 }, role: { type: String, maxlength: 140 }, image: { type: String, maxlength: 2048 } }],
  footerTripGroups: {
    domestic: { title: { type: String, maxlength: 60 }, links: [{ label: { type: String, maxlength: 100 }, href: { type: String, maxlength: 2048 } }] },
    international: { title: { type: String, maxlength: 60 }, links: [{ label: { type: String, maxlength: 100 }, href: { type: String, maxlength: 2048 } }] },
  },
  activities: {
    eyebrow: { type: String, maxlength: 80 }, title: { type: String, maxlength: 100 }, description: { type: String, maxlength: 320 },
    items: [{ title: { type: String, maxlength: 100 }, description: { type: String, maxlength: 280 }, video: { type: String, maxlength: 2048 } }],
  },
}, options));
if (!SiteSettings.schema.path('announcementEnabled')) {
  SiteSettings.schema.add({
    announcementEnabled: { type: Boolean, default: true },
    announcementText: { type: String, default: 'Monsoon Sale is LIVE — Flat ₹5,000 Off', maxlength: 140 },
    announcementHref: { type: String, default: '/deals', maxlength: 2048 },
    datesAvailableMessage: { type: String, default: 'All dates available — send an enquiry for your preferred date.', maxlength: 220 },
    announcementLanding: { eyebrow: { type: String, maxlength: 80 }, title: { type: String, maxlength: 120 }, description: { type: String, maxlength: 500 }, image: { type: String, maxlength: 2048 }, tripSlugs: [String] },
    aboutFounder: {
      name: { type: String, default: 'TravelEnfield Team', maxlength: 100 }, role: { type: String, default: 'Founder & CEO, TravelEnfield', maxlength: 140 }, image: { type: String, default: '/images/reviews/yash.webp', maxlength: 2048 }, instagramUrl: { type: String, default: '', maxlength: 2048 }, linkedinUrl: { type: String, default: '', maxlength: 2048 }, bio: { type: String, default: 'TravelEnfield is built around a simple belief: the best journeys connect people, places and stories worth bringing home.', maxlength: 2400 },
    },
  });
}
if (!SiteSettings.schema.path('datesAvailableMessage')) SiteSettings.schema.add({ datesAvailableMessage: { type: String, default: 'All dates available — send an enquiry for your preferred date.', maxlength: 220 } });
if (!SiteSettings.schema.path('announcementLanding')) SiteSettings.schema.add({ announcementLanding: { eyebrow: { type: String, maxlength: 80 }, title: { type: String, maxlength: 120 }, description: { type: String, maxlength: 500 }, image: { type: String, maxlength: 2048 }, tripSlugs: [String] } });
if (!SiteSettings.schema.path('aboutFounder')) {
  SiteSettings.schema.add({
    aboutFounder: {
      name: { type: String, default: 'TravelEnfield Team', maxlength: 100 }, role: { type: String, default: 'Founder & CEO, TravelEnfield', maxlength: 140 }, image: { type: String, default: '/images/reviews/yash.webp', maxlength: 2048 }, instagramUrl: { type: String, default: '', maxlength: 2048 }, linkedinUrl: { type: String, default: '', maxlength: 2048 }, bio: { type: String, default: 'TravelEnfield is built around a simple belief: the best journeys connect people, places and stories worth bringing home.', maxlength: 2400 },
    },
  });
}
if (!SiteSettings.schema.path('aboutTeam')) {
  SiteSettings.schema.add({ aboutTeam: [{ name: { type: String, maxlength: 100 }, role: { type: String, maxlength: 140 }, image: { type: String, maxlength: 2048 } }] });
}
if (!SiteSettings.schema.path('footerTripGroups')) {
  SiteSettings.schema.add({
    footerTripGroups: {
      domestic: { title: { type: String, maxlength: 60 }, links: [{ label: { type: String, maxlength: 100 }, href: { type: String, maxlength: 2048 } }] },
      international: { title: { type: String, maxlength: 60 }, links: [{ label: { type: String, maxlength: 100 }, href: { type: String, maxlength: 2048 } }] },
    },
  });
}
if (!SiteSettings.schema.path('activities')) {
  SiteSettings.schema.add({
    activities: {
      eyebrow: { type: String, maxlength: 80 }, title: { type: String, maxlength: 100 }, description: { type: String, maxlength: 320 },
      items: [{ title: { type: String, maxlength: 100 }, description: { type: String, maxlength: 280 }, video: { type: String, maxlength: 2048 } }],
    },
  });
}

export { Destination, Trip, Category, Hotel, Blog, Page, Enquiry, User, SiteSettings };
