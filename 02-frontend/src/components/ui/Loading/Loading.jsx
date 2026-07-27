export function Loading({ label = 'Cargando...' }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 rounded-md border border-zinc-200 bg-white px-4 py-8 text-sm text-zinc-600"
    >
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900"
      />
      <span>{label}</span>
    </div>
  );
}
