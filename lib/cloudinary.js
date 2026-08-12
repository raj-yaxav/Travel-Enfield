import crypto from 'crypto';

export function cloudinaryEnv() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  };
}

export function isCloudinaryUrl(url) {
  return typeof url === 'string' && /^https?:\/\/[^/]*res\.cloudinary\.com\//i.test(url);
}

// Converts a Cloudinary asset URL into its public_id.
// https://res.cloudinary.com/<cloud>/<type>/upload/v<version>/<path>/<file>.<ext>
export function publicIdFromUrl(url) {
  if (!isCloudinaryUrl(url)) return null;
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split('/').filter(Boolean);
    const versionIndex = parts.findIndex(part => /^v\d+$/.test(part));
    if (versionIndex === -1) return null;
    const publicId = parts.slice(versionIndex + 1).join('/').replace(/\.[^.]+$/, '');
    return publicId || null;
  } catch {
    return null;
  }
}

// Destroys the Cloudinary assets behind the given URLs. Missing/not-found
// assets count as successfully removed. Never throws.
export async function destroyCloudinaryImages(urls) {
  const { cloudName, apiKey, apiSecret } = cloudinaryEnv();
  const uniqueIds = [...new Set((urls || []).map(publicIdFromUrl).filter(Boolean))];
  if (!uniqueIds.length || !cloudName || !apiKey || !apiSecret) return { deleted: [], failed: [] };

  const deleted = [];
  const failed = [];

  for (const publicId of uniqueIds) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const form = new FormData();
    form.set('public_id', publicId);
    form.set('api_key', apiKey);
    form.set('timestamp', String(timestamp));
    form.set('signature', signature);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: 'POST',
        body: form,
      });
      const result = await response.json().catch(() => ({}));
      if (result.result === 'ok' || result.result === 'not found') deleted.push(publicId);
      else failed.push(publicId);
    } catch (error) {
      console.error('Cloudinary destroy failed for', publicId, error);
      failed.push(publicId);
    }
  }

  return { deleted, failed };
}
