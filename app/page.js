import LegacyDocument from '../components/LegacyDocument';
import { readLegacyBody } from '../lib/legacy-document';

export const metadata = {
  title: 'Group Trips & Custom Tour Packages',
  description: 'Explore fixed departures, bike trips, weekend getaways and personalised holidays across India and beyond with transparent pricing and expert support.',
};

export default function HomePage() {
  return <LegacyDocument entry="home" html={readLegacyBody('home')} />;
}
