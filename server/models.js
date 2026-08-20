import mongoose from 'mongoose';

const options = { timestamps: true, strict: true };
const Destination = mongoose.models.Destination || mongoose.model('Destination', new mongoose.Schema({
  name: { type: String, required: true }, slug: { type: String, required: true, unique: true, index: true },
  category: { type: String, enum: ['domestic', 'international'], required: true }, image: String,
  tagline: String, summary: String, startingPrice: Number, bestTime: String,
  seoTitle: String, seoDescription: String, overview: String, planningNotes: String,
  idealDuration: String, gettingThere: String, localInsight: String,
  highlights: [String], thingsToDo: [String], travelTips: [String], faq: [{ question: String, answer: String }],
}, options));
const Trip = mongoose.models.Trip || mongoose.model('Trip', new mongoose.Schema({
  title: { type: String, required: true }, slug: { type: String, required: true, unique: true, index: true },
  destinationSlug: { type: String, required: true, index: true }, categories: [String], image: String,
  duration: String, nights: Number, price: Number, oldPrice: Number, discount: String, badge: String,
  summary: String, groupSize: String, pickup: String, dates: [String],
  itinerary: [{ day: Number, title: String, details: [String] }], inclusions: [String], exclusions: [String],
  notes: [String], featured: { type: Boolean, default: false },
}, options));
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
const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({
  title: String, slug: { type: String, unique: true }, excerpt: String, image: String, category: String,
  author: String, readTime: String, publishedAt: Date, sections: [{ heading: String, body: String }],
}, options));
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

export { Destination, Trip, Category, Hotel, Blog, Page, Enquiry, User };
