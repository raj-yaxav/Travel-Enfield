import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../lib/mongodb';
import { Destination, Trip, Category, Blog, Page, Enquiry, User } from '../../../server/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (data, status = 200) => NextResponse.json(data, { status });
const failure = error => {
  console.error('API request failed:', error);
  return json({ error: 'Something went wrong. Please try again shortly.' }, 500);
};

export async function GET(request, context) {
  try {
    const { route = [] } = await context.params;
    if (route[0] === 'health') {
      await connectDatabase();
      return json({ ok: true, database: 'connected' });
    }
    const pathname = route.join('/');
    const knownReadRoute = pathname === 'destinations'
      || pathname === 'trips'
      || pathname === 'blogs'
      || (['destinations', 'trips', 'categories', 'blogs', 'pages'].includes(route[0]) && Boolean(route[1]));
    if (!knownReadRoute) return json({ error: 'API route not found' }, 404);
    await connectDatabase();
    const url = new URL(request.url);

    if (pathname === 'destinations') return json(await Destination.find().lean());
    if (route[0] === 'destinations' && route[1]) {
      const item = await Destination.findOne({ slug: route[1] }).lean();
      return item ? json(item) : json({ error: 'Destination not found' }, 404);
    }
    if (pathname === 'trips') {
      const query = {};
      const category = url.searchParams.get('category');
      const destination = url.searchParams.get('destination');
      if (category && category !== 'all') query.categories = category;
      if (destination) query.destinationSlug = destination;
      return json(await Trip.find(query).lean());
    }
    if (route[0] === 'trips' && route[1]) {
      const item = await Trip.findOne({ slug: route[1] }).lean();
      return item ? json(item) : json({ error: 'Trip not found' }, 404);
    }
    if (route[0] === 'categories' && route[1]) {
      const item = await Category.findOne({ slug: route[1] }).lean();
      return item ? json(item) : json({ error: 'Category not found' }, 404);
    }
    if (pathname === 'blogs') return json(await Blog.find().sort({ publishedAt: -1 }).lean());
    if (route[0] === 'blogs' && route[1]) {
      const item = await Blog.findOne({ slug: route[1] }).lean();
      return item ? json(item) : json({ error: 'Article not found' }, 404);
    }
    if (route[0] === 'pages' && route[1]) {
      const item = await Page.findOne({ slug: route[1] }).lean();
      return item ? json(item) : json({ error: 'Page not found' }, 404);
    }
    return json({ error: 'API route not found' }, 404);
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request, context) {
  try {
    await connectDatabase();
    const { route = [] } = await context.params;
    const pathname = route.join('/');
    const body = await request.json().catch(() => null);
    if (!body) return json({ error: 'A valid JSON request body is required' }, 400);

    if (pathname === 'enquiries') {
      const enquiry = await Enquiry.create(body);
      return json({ ok: true, id: enquiry.id }, 201);
    }
    if (pathname === 'auth/signup') {
      const { name, email, phone, password } = body;
      if (!name || !email || !password || password.length < 6) return json({ error: 'Name, email and a 6+ character password are required' }, 400);
      const passwordHash = await bcrypt.hash(password, 10);
      try {
        const user = await User.create({ name, email, phone, passwordHash });
        return json({ ok: true, user: { id: user.id, name: user.name, email: user.email } }, 201);
      } catch (error) {
        if (error.code === 11000) return json({ error: 'Email already registered' }, 409);
        throw error;
      }
    }
    if (pathname === 'auth/login') {
      const user = await User.findOne({ email: body.email });
      const valid = user && await bcrypt.compare(body.password || '', user.passwordHash);
      return valid
        ? json({ ok: true, user: { id: user.id, name: user.name, email: user.email } })
        : json({ error: 'Invalid email or password' }, 401);
    }
    return json({ error: 'API route not found' }, 404);
  } catch (error) {
    return failure(error);
  }
}
