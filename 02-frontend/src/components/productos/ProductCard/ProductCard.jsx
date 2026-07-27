import { ChevronRight, Package } from 'lucide-react';
import { Badge } from '../../ui/Badge';

function getCategoriaNombre(producto) {
  return producto?.categoria?.nombre || producto?.categoriaNombre || 'Sin categoría';
}

function ProductCard({ producto }) {
  const categoriaNombre = getCategoriaNombre(producto);
  const sku = producto?.sku || 'Sin SKU';
  const isActive = producto?.activo === true;

  return (
    <article className="group rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-500">
          <Package className="h-6 w-6" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
            <h2 className="truncate text-base font-semibold text-zinc-950">
              {producto.nombre}
            </h2>
            <span className="text-sm text-zinc-500">SKU: {sku}</span>
          </div>

          <p className="mt-1 text-sm text-zinc-600">{categoriaNombre}</p>

          {producto.descripcion && (
            <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
              {producto.descripcion}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
          <Badge variant={isActive ? 'success' : 'neutral'}>
            {isActive ? 'Activo' : 'Inactivo'}
          </Badge>
          <ChevronRight
            className="h-5 w-5 text-zinc-400 transition group-hover:text-zinc-600"
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
