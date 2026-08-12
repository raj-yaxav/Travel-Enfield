export const metadata = {
  title: { default: 'Admin', template: '%s · TravelEnfield Admin' },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <div className="min-h-dvh bg-gray-50 text-brand-ink">{children}</div>;
}
