import LegacyDocument from '../../components/LegacyDocument';
import { readLegacyBody } from '../../lib/legacy-document';

export const dynamic = 'force-dynamic';

export function generateMetadata({ params }) {
  return Promise.resolve(params).then(({ slug = [] }) => ({
    title: slug.map(part => part.replaceAll('-', ' ')).join(' · ') || 'Explore',
    robots: slug[0] === 'login' || slug[0] === 'signup' ? { index: false, follow: true } : undefined,
  }));
}

export default function ContentPage() {
  return <LegacyDocument entry="app" html={readLegacyBody('app')} />;
}
