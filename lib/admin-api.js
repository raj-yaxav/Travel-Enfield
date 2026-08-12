export async function adminFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`/api/admin/${path}`, {
    ...options,
    headers: isFormData ? options.headers : { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/admin/login';
    throw new Error('Not authenticated');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: 'IconDashboard' },
  { href: '/admin/enquiries', label: 'Enquiries', icon: 'IconInbox' },
  { href: '/admin/destinations', label: 'Destinations', icon: 'IconMapPin' },
  { href: '/admin/trips', label: 'Trips', icon: 'IconRoute' },
  { href: '/admin/categories', label: 'Categories', icon: 'IconTags' },
  { href: '/admin/hotels', label: 'Hotels', icon: 'IconBed' },
  { href: '/admin/blogs', label: 'Blog', icon: 'IconNews' },
  { href: '/admin/pages', label: 'Pages', icon: 'IconFile' },
  { href: '/admin/users', label: 'Users', icon: 'IconUsers' },
];
