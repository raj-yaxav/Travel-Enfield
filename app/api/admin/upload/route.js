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
  const isImage = file.type?.startsWith('image/');
  const isVideo = ['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type);
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: 'Upload an image, MP4, WebM or MOV video' }, { status: 400 });
  }
  const sizeLimit = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > sizeLimit) {
    return NextResponse.json({ error: isVideo ? 'Video must be smaller than 50MB' : 'Image must be smaller than 10MB' }, { status: 400 });
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
    cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? 'video' : 'image'}/upload`, {
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
    return NextResponse.json({ error: result?.error?.message || `${isVideo ? 'Video' : 'Image'} upload failed` }, { status: 502 });
  }

  return NextResponse.json({ ok: true, url: result.secure_url });
}
