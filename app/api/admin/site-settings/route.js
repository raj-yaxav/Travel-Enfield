import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../lib/mongodb';
import { isAdminRequest } from '../../../../lib/admin-auth';
import { SiteSettings } from '../../../../server/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_ANNOUNCEMENT = {
  announcementEnabled: true,
  announcementText: 'Monsoon Sale is LIVE — Flat ₹5,000 Off',
  announcementHref: '/deals',
};

const json = (data, status = 200) => NextResponse.json(data, { status });

function publicSettings(settings) {
  return {
    announcementEnabled: settings?.announcementEnabled ?? DEFAULT_ANNOUNCEMENT.announcementEnabled,
    announcementText: settings?.announcementText || DEFAULT_ANNOUNCEMENT.announcementText,
    announcementHref: settings?.announcementHref || DEFAULT_ANNOUNCEMENT.announcementHref,
  };
}

function validateAnnouncement(body) {
  const announcementText = String(body?.announcementText || '').trim().replace(/\s+/g, ' ');
  const announcementHref = String(body?.announcementHref || '').trim();

  if (!announcementText) throw new Error('Banner message is required');
  if (announcementText.length > 140) throw new Error('Banner message must be 140 characters or fewer');
  if (!announcementHref) throw new Error('A banner destination is required');

  if (announcementHref.startsWith('/')) {
    if (announcementHref.startsWith('//')) throw new Error('Use an internal path or a complete HTTPS URL');
  } else {
    let destination;
    try { destination = new URL(announcementHref); } catch { throw new Error('Enter a valid internal path or complete HTTPS URL'); }
    if (!['http:', 'https:'].includes(destination.protocol)) throw new Error('Only HTTP or HTTPS links are allowed');
  }

  return {
    announcementEnabled: Boolean(body?.announcementEnabled),
    announcementText,
    announcementHref,
  };
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
    const values = validateAnnouncement(await request.json());
    await connectDatabase();
    const settings = await SiteSettings.findOneAndUpdate(
      { key: 'site' },
      { $set: values, $setOnInsert: { key: 'site' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    return json(publicSettings(settings));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save site settings';
    return json({ error: message }, 400);
  }
}
