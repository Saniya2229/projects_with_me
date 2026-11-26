import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getValidNextStatuses } from '../../utils/constants';

const STATUS_BUTTON_STYLES = {
  Todo: 'bg-slate-600 text-white',
  'In Progress': 'bg-blue-600 text-white',
  Completed: 'bg-emerald-600 text-white',
  Cancelled: 'bg-amber-700 text-white',
};

export default function TaskStatusDropdown({ status, disabled = false, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const nextStatuses = getValidNextStatuses(status);
  const isTerminal = nextStatuses.length === 0;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        disabled={disabled || isTerminal}
        onClick={() => setOpen((prev) => !prev)}
        title={isTerminal ? 'Terminal status (locked)' : 'Change status'}
        className={`inline-flex items-center justify-between gap-2 min-w-[126px] px-3 py-1 rounded-md text-xs font-semibold shadow-xs transition ${
          STATUS_BUTTON_STYLES[status] || 'bg-slate-600 text-white'
        } ${
          isTerminal || disabled
            ? 'cursor-default opacity-90'
            : 'cursor-pointer hover:opacity-90'
        }`}
      >
        <span>{status}</span>
        {!isTerminal && <ChevronDown className="w-3.5 h-3.5 opacity-85" />}
      </button>

      {open && !isTerminal && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
          className="absolute left-0 mt-1 w-36 border rounded-lg shadow-xl py-1 z-30"
        >
          {nextStatuses.map((ns) => (
            <button
              key={ns}
              type="button"
              onClick={() => {
                setOpen(false);
                onChange(ns);
              }}
              className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
            >
              {ns}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

