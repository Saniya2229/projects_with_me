const STATUS_STYLES = {
  // Task statuses
  Todo: 'bg-slate-600 text-white',
  'In Progress': 'bg-blue-600 text-white',
  Completed: 'bg-emerald-600 text-white',
  Cancelled: 'bg-amber-700 text-white',
  // Employee statuses
  Active: 'bg-emerald-600 text-white',
  Inactive: 'bg-slate-600 text-white',
  'On Leave': 'bg-amber-600 text-white',
};

export default function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || 'bg-slate-600 text-white';
  return (
    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

