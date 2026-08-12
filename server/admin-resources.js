import { Destination, Trip, Category, Hotel, Blog, Page, Enquiry, User } from './models';
import { ADMIN_RESOURCE_CONFIG } from '../lib/admin-resource-config';

const MODELS = { destinations: Destination, trips: Trip, categories: Category, hotels: Hotel, blogs: Blog, pages: Page, enquiries: Enquiry, users: User };

const SEARCH_FIELDS = {
  destinations: ['name', 'slug', 'summary'],
  trips: ['title', 'slug', 'destinationSlug'],
  categories: ['name', 'slug', 'title'],
  hotels: ['name', 'slug', 'location'],
  blogs: ['title', 'slug', 'category', 'author'],
  pages: ['title', 'slug'],
  enquiries: ['name', 'email', 'phone', 'destination'],
  users: ['name', 'email', 'phone'],
};

const SORT = {
  destinations: { name: 1 },
  trips: { createdAt: -1 },
  categories: { name: 1 },
  hotels: { createdAt: -1 },
  blogs: { publishedAt: -1 },
  pages: { title: 1 },
  enquiries: { createdAt: -1 },
  users: { createdAt: -1 },
};

const HIDDEN = { users: ['passwordHash', 'otpHash', 'otpAttempts'] };

export const ADMIN_RESOURCES = Object.fromEntries(
  Object.entries(ADMIN_RESOURCE_CONFIG).map(([key, meta]) => [
    key,
    {
      ...meta,
      model: MODELS[key],
      searchFields: SEARCH_FIELDS[key] || [],
      sort: SORT[key] || { _id: -1 },
      hidden: HIDDEN[key] || [],
    },
  ])
);

export function sanitizeDoc(resourceKey, doc) {
  const config = ADMIN_RESOURCES[resourceKey];
  if (!doc) return doc;
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  if (!config?.hidden?.length) return plain;
  const clean = { ...plain };
  config.hidden.forEach(field => { delete clean[field]; });
  return clean;
}
