'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ADMIN_RESOURCE_CONFIG } from '../../lib/admin-resource-config';
import { adminFetch } from '../../lib/admin-api';
import ResourceForm from './ResourceForm';
import { IconChevronLeft } from './Icons';

export default function ResourceCreatePage({ resourceKey }) {
  const config = ADMIN_RESOURCE_CONFIG[resourceKey];
  const router = useRouter();

  async function handleSubmit(value) {
    await adminFetch(resourceKey, { method: 'POST', body: JSON.stringify(value) });
    router.push(`/admin/${resourceKey}`);
  }

  return (
    <div>
      <Link href={`/admin/${resourceKey}`} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-brand-deep">
        <IconChevronLeft className="h-4 w-4" /> Back to {config.label.toLowerCase()}
      </Link>
      <h1 className="font-heading text-2xl font-extrabold text-brand-deep">Add {config.singular}</h1>
      <div className="mt-6 max-w-3xl rounded-2xl border border-gray-200 bg-white p-6">
        <ResourceForm config={config} onSubmit={handleSubmit} submitLabel={`Create ${config.singular}`} />
      </div>
    </div>
  );
}
