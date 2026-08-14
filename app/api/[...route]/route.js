
// opencode -s ses_02d4b5353ffejPKj1teaU8yne1
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../lib/mongodb';
import { Destination, Trip, Category, Blog, Page, Enquiry, User, Hotel } from '../../../server/models';
import { destinations, trips, categoryData, blogs, pageData, hotels } from '../../../server/seed';
import { sendOtpEmail, sendEnquiryAdminEmail } from '../../../server/mailer';
import { USER_SESSION_COOKIE, createUserSessionToken, getCurrentUserId } from '../../../lib/user-auth';

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_VERIFIED_TTL_MS = 15 * 60 * 1000;
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (data, status = 200) => NextResponse.json(data, { status });

const failure = error => {
  console.error('API request failed:', error);
  return json({ error: 'Something went wrong. Please try again shortly.' }, 500);
};

function localReadFallback(route, request) {
  const pathname = route.join('/');
  const url = new URL(request.url);
  if (pathname === 'destinations') return destinations;
  if (route[0] === 'destinations' && route[1]) return destinations.find(item => item.slug === route[1]);
  if (pathname === 'trips') {
    const category = url.searchParams.get('category');
    const destination = url.searchParams.get('destination');
    return trips.filter(item => (!category || category === 'all' || item.categories.includes(category)) && (!destination || item.destinationSlug === destination));
  }
  if (route[0] === 'trips' && route[1]) return trips.find(item => item.slug === route[1]);
  if (pathname === 'categories') return categoryData;
  if (route[0] === 'categories' && route[1]) return categoryData.find(item => item.slug === route[1]);
  if (pathname === 'blogs') return [...blogs].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  if (route[0] === 'blogs' && route[1]) return blogs.find(item => item.slug === route[1]);
  if (pathname === 'pages') return pageData;
  if (route[0] === 'pages' && route[1]) return pageData.find(item => item.slug === route[1]);
  if (pathname === 'hotels') {
    const destination = url.searchParams.get('destination');
    return hotels.filter(item => !destination || item.destinationSlug === destination);
  }
  if (route[0] === 'hotels' && route[1]) return hotels.find(item => item.slug === route[1]);
  return undefined;
}

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
      || pathname === 'categories'
      || pathname === 'blogs'
      || pathname === 'pages'
      || pathname === 'hotels'
      || (['destinations', 'trips', 'categories', 'blogs', 'pages', 'hotels'].includes(route[0]) && Boolean(route[1]))
      || (route[0] === 'profile' && Boolean(route[1]))
      || pathname === 'auth/me';
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
    if (pathname === 'categories') return json(await Category.find().lean());
    if (route[0] === 'categories' && route[1]) {
      const item = await Category.findOne({ slug: route[1] }).lean();
      return item ? json(item) : json({ error: 'Category not found' }, 404);
    }
    if (pathname === 'blogs') return json(await Blog.find().sort({ publishedAt: -1 }).lean());
    if (route[0] === 'blogs' && route[1]) {
      const item = await Blog.findOne({ slug: route[1] }).lean();
      return item ? json(item) : json({ error: 'Article not found' }, 404);
    }
    if (pathname === 'pages') return json(await Page.find().lean());
    if (route[0] === 'pages' && route[1]) {
      const item = await Page.findOne({ slug: route[1] }).lean();
      return item ? json(item) : json({ error: 'Page not found' }, 404);
    }
    if (pathname === 'auth/me') {
      const userId = getCurrentUserId(request);
      if (!userId) return json({ error: 'Not authenticated' }, 401);
      const user = await User.findById(userId).lean().catch(() => null);
      if (!user) return json({ error: 'User not found' }, 404);
      return json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone } });
    }
    if (pathname === 'hotels') {
      const query = {};
      const destination = url.searchParams.get('destination');
      if (destination) query.destinationSlug = destination;
      return json(await Hotel.find(query).sort({ rating: -1 }).lean());
    }
    if (route[0] === 'hotels' && route[1]) {
      const item = await Hotel.findOne({ slug: route[1] }).lean();
      return item ? json(item) : json({ error: 'Hotel not found' }, 404);
    }
    if (route[0] === 'profile' && route[1]) {
      const userId = getCurrentUserId(request);
      if (!userId) return json({ error: 'Not authenticated' }, 401);
      if (userId !== route[1]) return json({ error: 'Forbidden' }, 403);
      const user = await User.findById(route[1]).lean().catch(() => null);
      if (!user) return json({ error: 'Profile not found' }, 404);
      const enquiries = await Enquiry.find({
        $or: [
          ...(user.email ? [{ email: user.email }] : []),
          ...(user.phone ? [{ phone: user.phone }] : []),
        ],
      }).sort({ createdAt: -1 }).lean();
      return json({
        user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
        enquiries,
      });
    }
    return json({ error: 'API route not found' }, 404);
  } catch (error) {
    const { route = [] } = await context.params;
    const fallback = localReadFallback(route, request);
    if (fallback !== undefined) {
      console.warn(`MongoDB unavailable; serving local read fallback for /api/${route.join('/')}.`);
      return fallback ? json(fallback) : json({ error: 'Content not found' }, 404);
    }
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
      await sendEnquiryAdminEmail(enquiry.toObject());
      return json({ ok: true, id: enquiry.id }, 201);
    }
    if (pathname === 'auth/login') {
      const user = await User.findOne({ email: body.email });
      const valid = user && await bcrypt.compare(body.password || '', user.passwordHash);
      if (!valid) return json({ error: 'Invalid email or password' }, 401);
      const { token, maxAge } = createUserSessionToken(user.id);
      const response = json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
      response.cookies.set(USER_SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge,
      });
      return response;
    }
    if (pathname === 'auth/logout') {
      const response = json({ ok: true });
      response.cookies.delete(USER_SESSION_COOKIE);
      return response;
    }
    if (pathname === 'auth/request-otp') {
      const cleanName = (body.name || '').trim();
      const cleanEmail = (body.email || '').trim().toLowerCase();
      const cleanPhone = (body.phone || '').trim();
      if (!cleanName || !cleanEmail || !cleanPhone) return json({ error: 'Name, email and phone number are required' }, 400);
      if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return json({ error: 'Enter a valid email address' }, 400);
      if (!body.agree) return json({ error: 'Please accept the Terms & Privacy Policy to continue' }, 400);
      const code = generateOtp();
      const otpHash = await bcrypt.hash(code, 10);
      const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
      await User.findOneAndUpdate(
        { email: cleanEmail },
        { name: cleanName, email: cleanEmail, phone: cleanPhone, otpHash, otpExpiresAt, otpAttempts: 0 },
        { upsert: true, setDefaultsOnInsert: true }
      );
      try {
        await sendOtpEmail(cleanEmail, cleanName, code);
      } catch (mailError) {
        console.error('Failed to send OTP email:', mailError);
        return json({ error: mailError.message || 'Could not send the OTP email. Please try again shortly.' }, 502);
      }
      return json({ ok: true, email: cleanEmail });
    }
    if (pathname === 'auth/verify-signup-otp') {
      const cleanEmail = (body.email || '').trim().toLowerCase();
      const cleanCode = (body.code || '').trim();
      if (!cleanEmail || !cleanCode) return json({ error: 'Email and OTP code are required' }, 400);
      const user = await User.findOne({ email: cleanEmail });
      if (!user || !user.otpHash || !user.otpExpiresAt) return json({ error: 'Request a new OTP first' }, 400);
      if (user.otpExpiresAt.getTime() < Date.now()) return json({ error: 'This OTP has expired. Please request a new one.' }, 400);
      if (user.otpAttempts >= OTP_MAX_ATTEMPTS) return json({ error: 'Too many incorrect attempts. Please request a new OTP.' }, 429);
      const valid = await bcrypt.compare(cleanCode, user.otpHash);
      if (!valid) {
        user.otpAttempts += 1;
        await user.save();
        return json({ error: 'Incorrect code. Please try again.' }, 401);
      }
      user.otpHash = undefined;
      user.otpExpiresAt = undefined;
      user.otpAttempts = 0;
      user.otpVerifiedAt = new Date();
      await user.save();
      return json({ ok: true });
    }
    if (pathname === 'auth/set-password') {
      const cleanEmail = (body.email || '').trim().toLowerCase();
      const { password } = body;
      if (!cleanEmail || !password || password.length < 6) return json({ error: 'A 6+ character password is required' }, 400);
      const user = await User.findOne({ email: cleanEmail });
      if (!user || !user.otpVerifiedAt || Date.now() - user.otpVerifiedAt.getTime() > OTP_VERIFIED_TTL_MS) {
        return json({ error: 'Your verification has expired. Please verify your email again.' }, 400);
      }
      user.passwordHash = await bcrypt.hash(password, 10);
      user.otpVerifiedAt = undefined;
      await user.save();
      const { token, maxAge } = createUserSessionToken(user.id);
      const response = json({ ok: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
      response.cookies.set(USER_SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge,
      });
      return response;
    }
    return json({ error: 'API route not found' }, 404);
  } catch (error) {
    return failure(error);
  }
}
