import { Button } from '../../ui/Button';

const limitOptions = [10, 20, 50, 100];

export function PagePagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}) {
  const safeTotalPages = Math.max(totalPages, 0);
  const firstVisible = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastVisible = Math.min(page * limit, total);
  const hasPrevious = page > 1;
  const hasNext = safeTotalPages > 0 && page < safeTotalPages;

  return (
    <nav
      aria-label="Paginacion"
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <span className="font-medium text-zinc-900">
          {firstVisible}-{lastVisible}
        </span>{' '}
        de <span className="font-medium text-zinc-900">{total}</span> registros
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2">
          <span>Por pagina</span>
          <select
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          >
            {limitOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrevious}
          >
            Anterior
          </Button>
          <span className="min-w-24 text-center text-zinc-700">
            Pagina {safeTotalPages === 0 ? 0 : page} de {safeTotalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNext}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </nav>
  );
}
