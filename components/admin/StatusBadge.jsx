const STYLES = {
  new: 'bg-brand-purple/10 text-brand-purple',
  contacted: 'bg-amber-100 text-amber-700',
  closed: 'bg-gray-100 text-gray-500',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${STYLES[status] || STYLES.new}`}>
      {status || 'new'}
    </span>
  );
}
