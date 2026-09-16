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

// This endpoint is intentionally limited to the three public fields used by
// the site chrome. It never serialises internal settings or user data.
export async function GET() {
  try {
    await connectDatabase();
    const settings = await SiteSettings.findOne({ key: 'site' }).lean();
    return NextResponse.json({
      announcementEnabled: settings?.announcementEnabled ?? DEFAULT_ANNOUNCEMENT.announcementEnabled,
      announcementText: settings?.announcementText || DEFAULT_ANNOUNCEMENT.announcementText,
      announcementHref: settings?.announcementHref || DEFAULT_ANNOUNCEMENT.announcementHref,
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    // The static fallback in the HTML remains usable if the catalogue database
    // is temporarily unavailable, so a banner never blocks page rendering.
    console.error('Unable to load site settings:', error);
    return NextResponse.json(DEFAULT_ANNOUNCEMENT, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  }
}
