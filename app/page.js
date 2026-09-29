import LegacyDocument from '../components/LegacyDocument';
import { readLegacyBody } from '../lib/legacy-document';

export const metadata = {
  title: 'Group Trips & Custom Tour Packages',
  description: 'Explore fixed departures, bike trips, weekend getaways and personalised holidays across India and beyond with transparent pricing and expert support.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'TravelEnfield: Group Trips & Custom Tour Packages',
    description: 'Explore fixed departures, bike trips, weekend getaways and personalised holidays across India and beyond with transparent pricing and expert support.',
    url: '/',
    images: [{
      url: 'https://res.cloudinary.com/rgw1moxc/image/upload/f_auto,q_auto,w_1600,dpr_auto/travelenfield/group-trips-himalaya-hero.jpg',
      width: 1600,
      height: 900,
      alt: 'TravelEnfield group trips and curated travel experiences',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TravelEnfield: Group Trips & Custom Tour Packages',
    description: 'Explore fixed departures, bike trips, weekend getaways and personalised holidays across India and beyond.',
    images: ['https://res.cloudinary.com/rgw1moxc/image/upload/f_auto,q_auto,w_1600,dpr_auto/travelenfield/group-trips-himalaya-hero.jpg'],
  },
};

export default function HomePage() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': 'https://www.travelenfield.in/#organization',
    name: 'TravelEnfield',
    url: 'https://www.travelenfield.in',
    logo: 'https://www.travelenfield.in/logo.png',
    description: 'Curated group trips, fixed departures and customised holidays across India and beyond.',
    areaServed: 'IN',
    contactPoint: [{ '@type': 'ContactPoint', telephone: '+91-98736-56044', contactType: 'customer service', availableLanguage: ['en', 'hi'] }],
    sameAs: ['https://www.instagram.com/travelenfield.in', 'https://www.facebook.com/share/1U6md2aqrC/'],
  };
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://www.travelenfield.in/#website',
    name: 'TravelEnfield',
    url: 'https://www.travelenfield.in',
    publisher: { '@id': 'https://www.travelenfield.in/#organization' },
    inLanguage: 'en-IN',
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, '\\u003c') }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, '\\u003c') }} />
    <LegacyDocument entry="home" html={readLegacyBody('home')} />
  </>;
}
