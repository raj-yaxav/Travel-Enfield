'use client';

import { ADMIN_RESOURCE_CONFIG } from '../../lib/admin-resource-config';
import ResourceTable from './ResourceTable';

export default function ResourceListPage({ resourceKey }) {
  const config = ADMIN_RESOURCE_CONFIG[resourceKey];
  return (
    <div>
      <h1 className="font-heading text-2xl font-extrabold text-brand-deep">{config.label}</h1>
      <p className="mt-1 text-sm text-gray-500">Manage all {config.label.toLowerCase()}.</p>
      <div className="mt-6">
        <ResourceTable resourceKey={resourceKey} config={config} />
      </div>
    </div>
  );
}
