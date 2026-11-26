export default function ConfirmModal({
  open,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Delete',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        className="border rounded-xl max-w-md w-full p-6 shadow-2xl"
      >
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-6">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            style={{ borderColor: 'var(--border-subtle)' }}
            className="px-4 py-2 rounded-lg text-sm font-medium border hover:opacity-80 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

