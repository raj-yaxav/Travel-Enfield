import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import TripItineraryPdf from '../../../../components/pdf/TripItineraryPdf';
import { connectDatabase } from '../../../../lib/mongodb';
import { Destination, Trip } from '../../../../server/models';
import { destinations, trips } from '../../../../server/seed';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const safeSlug = value => String(value || '').trim().toLowerCase();
const validSlug = value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const fileName = value => `${safeSlug(value).replace(/[^a-z0-9-]/g, '') || 'trip'}-itinerary.pdf`;

export async function GET(_request, context) {
  const { slug: rawSlug } = await context.params;
  const slug = safeSlug(rawSlug);
  if (!validSlug(slug)) return NextResponse.json({ error: 'Invalid trip itinerary.' }, { status: 400 });

  let trip;
  let destination;
  try {
    await connectDatabase();
    trip = await Trip.findOne({ slug }).lean();
    if (trip?.destinationSlug) destination = await Destination.findOne({ slug: trip.destinationSlug }).lean();
  } catch (error) {
    console.warn(`Could not read ${slug} from MongoDB while rendering its itinerary:`, error.message);
  }
  trip ||= trips.find(item => item.slug === slug);
  if (!trip) return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
  destination ||= destinations.find(item => item.slug === trip.destinationSlug);

  try {
    const pdf = await renderToBuffer(<TripItineraryPdf trip={trip} destination={destination} />);
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName(trip.slug || trip.title)}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Itinerary PDF generation failed:', error);
    return NextResponse.json({ error: 'Could not generate the itinerary PDF. Please try again.' }, { status: 500 });
  }
}
