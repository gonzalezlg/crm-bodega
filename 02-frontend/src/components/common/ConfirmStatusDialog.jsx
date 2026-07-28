const confirmButtonVariants = {
  danger: 'bg-red-700 hover:bg-red-800',
  success: 'bg-emerald-700 hover:bg-emerald-800',
};

function ConfirmStatusDialog({
  title,
  message,
  confirmLabel,
  isLoading,
  confirmVariant = 'danger',
  onCancel,
  onConfirm,
}) {
  const confirmButtonClass =
    confirmButtonVariants[confirmVariant] ?? confirmButtonVariants.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-zinc-950">{title}</h3>
        <p className="mt-2 text-sm text-zinc-600">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${confirmButtonClass}`}
          >
            {isLoading ? 'Guardando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmStatusDialog;
