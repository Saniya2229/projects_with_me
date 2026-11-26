import { AlertTriangle } from 'lucide-react';

export default function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-400 dark:border-red-800 text-sm font-medium text-red-800 dark:text-red-300">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
      <span>{message}</span>
    </div>
  );
}

