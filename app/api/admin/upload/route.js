import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { isAdminRequest } from '../../../../lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary is not configured' }, { status: 500 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!file.type?.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are supported' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be smaller than 10MB' }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'travelenfield';
  const signature = crypto
    .createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const dataUri = `data:${file.type};base64,${base64}`;

  const uploadForm = new FormData();
  uploadForm.set('file', dataUri);
  uploadForm.set('api_key', apiKey);
  uploadForm.set('timestamp', String(timestamp));
  uploadForm.set('folder', folder);
  uploadForm.set('signature', signature);

  let cloudinaryResponse;
  try {
    cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadForm,
    });
  } catch (error) {
    console.error('Cloudinary request failed:', error);
    return NextResponse.json({ error: 'Could not reach Cloudinary. Please try again.' }, { status: 502 });
  }

  const result = await cloudinaryResponse.json().catch(() => null);
  if (!cloudinaryResponse.ok || !result?.secure_url) {
    console.error('Cloudinary upload failed:', result);
    return NextResponse.json({ error: result?.error?.message || 'Image upload failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, url: result.secure_url });
}
