import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../lib/mongodb';
import { isAdminRequest } from '../../../../lib/admin-auth';
import { destroyCloudinaryImages } from '../../../../lib/cloudinary';
import { ADMIN_RESOURCES, sanitizeDoc } from '../../../../server/admin-resources';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (data, status = 200) => NextResponse.json(data, { status });

function collectImageUrls(fields, doc) {
  if (!doc) return [];
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const urls = [];
  fields.forEach(field => {
    const value = plain[field.name];
    if (field.type === 'image' && typeof value === 'string') urls.push(value);
    else if (field.type === 'imageArray' && Array.isArray(value)) urls.push(...value);
  });
  return urls.filter(Boolean);
}

function imageFieldsFor(config) {
  return (config.fields || []).filter(field => field.type === 'image' || field.type === 'imageArray');
}

async function deleteReplacedImages(config, existingDoc, updatedDoc) {
  try {
    const fields = imageFieldsFor(config);
    if (!fields.length) return;
    const oldUrls = collectImageUrls(fields, existingDoc);
    const newUrls = collectImageUrls(fields, updatedDoc);
    const removed = oldUrls.filter(url => !newUrls.includes(url));
    if (removed.length) {
      const result = await destroyCloudinaryImages(removed);
      if (result.failed.length) console.warn('Could not delete some Cloudinary images:', result.failed);
    }
  } catch (error) {
    console.error('Auto-delete of replaced images failed:', error);
  }
}

function pickAllowedFields(config, body) {
  const allowed = {};
  config.fields.forEach(field => {
    if (Object.prototype.hasOwnProperty.call(body, field.name)) {
      allowed[field.name] = body[field.name];
    }
  });
  return allowed;
}

function buildSearchQuery(config, search) {
  if (!search || !config.searchFields?.length) return {};
  const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return { $or: config.searchFields.map(field => ({ [field]: regex })) };
}

async function handleStats() {
  const counts = await Promise.all(
    Object.entries(ADMIN_RESOURCES).map(async ([key, config]) => [key, await config.model.countDocuments()])
  );
  const recentEnquiries = (await ADMIN_RESOURCES.enquiries.model.find().sort({ createdAt: -1 }).limit(6).lean())
    .map(item => sanitizeDoc('enquiries', item));
  return json({ counts: Object.fromEntries(counts), recentEnquiries });
}

export async function GET(request, context) {
  if (!isAdminRequest(request)) return json({ error: 'Not authenticated' }, 401);
  try {
    await connectDatabase();
    const { route = [] } = await context.params;
    if (route[0] === 'stats' && route.length === 1) return await handleStats();

    const [resourceKey, id] = route;
    const config = ADMIN_RESOURCES[resourceKey];
    if (!config) return json({ error: 'Unknown resource' }, 404);

    if (id) {
      const doc = await config.model.findById(id).catch(() => null);
      if (!doc) return json({ error: `${config.singular} not found` }, 404);
      return json(sanitizeDoc(resourceKey, doc));
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
    const query = buildSearchQuery(config, search);

    const [items, total] = await Promise.all([
      config.model.find(query).sort(config.sort || { _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      config.model.countDocuments(query),
    ]);

    return json({
      items: items.map(item => sanitizeDoc(resourceKey, item)),
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error('Admin API GET failed:', error);
    return json({ error: 'Something went wrong. Please try again shortly.' }, 500);
  }
}

export async function POST(request, context) {
  if (!isAdminRequest(request)) return json({ error: 'Not authenticated' }, 401);
  try {
    await connectDatabase();
    const { route = [] } = await context.params;
    const [resourceKey] = route;
    const config = ADMIN_RESOURCES[resourceKey];
    if (!config) return json({ error: 'Unknown resource' }, 404);

    const body = await request.json().catch(() => null);
    if (!body) return json({ error: 'A valid JSON request body is required' }, 400);

    const data = pickAllowedFields(config, body);
    const created = await config.model.create(data);
    return json(sanitizeDoc(resourceKey, created), 201);
  } catch (error) {
    if (error?.code === 11000) return json({ error: 'A record with that slug/email already exists' }, 409);
    console.error('Admin API POST failed:', error);
    return json({ error: error.message || 'Something went wrong. Please try again shortly.' }, 500);
  }
}

export async function PUT(request, context) {
  if (!isAdminRequest(request)) return json({ error: 'Not authenticated' }, 401);
  try {
    await connectDatabase();
    const { route = [] } = await context.params;
    const [resourceKey, id] = route;
    const config = ADMIN_RESOURCES[resourceKey];
    if (!config) return json({ error: 'Unknown resource' }, 404);
    if (!id) return json({ error: 'Missing id' }, 400);

    const body = await request.json().catch(() => null);
    if (!body) return json({ error: 'A valid JSON request body is required' }, 400);

    const existing = await config.model.findById(id);
    if (!existing) return json({ error: `${config.singular} not found` }, 404);

    const data = pickAllowedFields(config, body);
    const updated = await config.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updated) return json({ error: `${config.singular} not found` }, 404);

    await deleteReplacedImages(config, existing, updated);

    return json(sanitizeDoc(resourceKey, updated));
  } catch (error) {
    if (error?.code === 11000) return json({ error: 'A record with that slug/email already exists' }, 409);
    console.error('Admin API PUT failed:', error);
    return json({ error: error.message || 'Something went wrong. Please try again shortly.' }, 500);
  }
}

export async function DELETE(request, context) {
  if (!isAdminRequest(request)) return json({ error: 'Not authenticated' }, 401);
  try {
    await connectDatabase();
    const { route = [] } = await context.params;
    const [resourceKey, id] = route;
    const config = ADMIN_RESOURCES[resourceKey];
    if (!config) return json({ error: 'Unknown resource' }, 404);
    if (!id) return json({ error: 'Missing id' }, 400);

    const existing = await config.model.findById(id);
    const deleted = await config.model.findByIdAndDelete(id);
    if (!deleted) return json({ error: `${config.singular} not found` }, 404);

    const removed = collectImageUrls(imageFieldsFor(config), existing);
    if (removed.length) {
      const result = await destroyCloudinaryImages(removed);
      if (result.failed.length) console.warn('Could not delete some Cloudinary images:', result.failed);
    }

    return json({ ok: true });
  } catch (error) {
    console.error('Admin API DELETE failed:', error);
    return json({ error: error.message || 'Something went wrong. Please try again shortly.' }, 500);
  }
}
