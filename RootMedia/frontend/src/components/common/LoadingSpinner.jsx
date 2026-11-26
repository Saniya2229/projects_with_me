import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <span style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">
        {label}
      </span>
    </div>
  );
}

