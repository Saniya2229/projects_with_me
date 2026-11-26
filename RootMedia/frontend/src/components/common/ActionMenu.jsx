import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

export default function ActionMenu({ onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const menuHeight = 100; // approximate max height of 3 items
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight + 8;

    setPos({
      top: openUpward ? rect.top - menuHeight : rect.bottom + 4,
      left: rect.right - 112, // w-28 = 7rem = 112px, align right edge to button
    });
  }, []);

  const handleToggle = () => {
    if (!open) updatePosition();
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const handleScroll = () => setOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        aria-label="Open row actions"
        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
            className="w-28 border rounded-lg shadow-xl py-1 z-[9999] text-left"
          >
            {onView && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onView();
                }}
                className="w-full text-left px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              >
                View
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                className="w-full text-left px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
                className="w-full text-left px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              >
                Delete
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
