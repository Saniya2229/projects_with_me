import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  totalPages,
  totalItems,
  limit,
  itemLabel = 'items',
  onPageChange,
}) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const start = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalItems);

  const pages = Array.from({ length: safeTotalPages }, (_, i) => i + 1);

  return (
    <div
      style={{ color: 'var(--text-secondary)' }}
      className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-sm"
    >
      <div>
        Showing {start}-{end} of {totalItems} {itemLabel}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          className="p-1.5 rounded-md border disabled:opacity-40 hover:opacity-80 transition cursor-pointer disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p) => {
          const active = p === page;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              style={
                active
                  ? {
                      backgroundColor: 'var(--accent-primary)',
                      borderColor: 'var(--accent-primary)',
                      color: '#ffffff',
                    }
                  : {
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-subtle)',
                    }
              }
              className="px-3 py-1 rounded-md border text-sm font-medium transition cursor-pointer"
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= safeTotalPages}
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          className="p-1.5 rounded-md border disabled:opacity-40 hover:opacity-80 transition cursor-pointer disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

