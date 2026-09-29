const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.travelenfield.in').replace(/\/$/, '');

// Keep private, account-only and machine endpoints out of search while making
// every public travel page discoverable through the sitemap below.
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/login', '/signup', '/profile'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
