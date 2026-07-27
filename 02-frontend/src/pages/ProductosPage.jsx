import { useEffect, useState } from 'react';
import ProductCard from '../components/productos/ProductCard';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { PagePagination } from '../components/layout/PagePagination';
import { PageToolbar } from '../components/layout/PageToolbar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Loading } from '../components/ui/Loading';
import { obtenerCategorias } from '../services/categoriasService';
import { obtenerProductos } from '../services/productosService';

function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [activo, setActivo] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriasLoading, setCategoriasLoading] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  useEffect(() => {
    let isMounted = true;

    async function loadCategorias() {
      setCategoriasLoading(true);

      try {
        const data = await obtenerCategorias({
          activo: true,
        });

        if (!isMounted) {
          return;
        }

        setCategorias(Array.isArray(data) ? data : []);
      } catch {
        if (!isMounted) {
          return;
        }

        setCategorias([]);
      } finally {
        if (isMounted) {
          setCategoriasLoading(false);
        }
      }
    }

    loadCategorias();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProductos() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await obtenerProductos({
          page,
          limit: 10,
          search: debouncedSearch,
          categoriaId: categoriaId || undefined,
          activo: activo === '' ? undefined : activo === 'true',
        });

        if (!isMounted) {
          return;
        }

        setProductos(Array.isArray(response?.data) ? response.data : []);
        setMeta(response?.meta ?? null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setProductos([]);
        setMeta(null);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar los productos.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProductos();

    return () => {
      isMounted = false;
    };
  }, [page, debouncedSearch, categoriaId, activo]);

  function handleCategoriaChange(event) {
    setCategoriaId(event.target.value);
    setPage(1);
  }

  function handleActivoChange(event) {
    setActivo(event.target.value);
    setPage(1);
  }

  const shouldShowPagination =
      Boolean(meta) &&
      !isLoading &&
      !errorMessage &&
      meta.totalPages > 1;

  return (
    <PageContainer>
      <PageHeader
        title="Productos"
        subtitle="Portfolio de productos de la bodega"
        actions={<Button disabled>Nuevo producto</Button>}
      />

      <PageToolbar>
        <div className="w-full md:flex-1">
          <label className="sr-only" htmlFor="productos-search">
            Buscar productos
          </label>
          <input
            id="productos-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre..."
            aria-label="Buscar productos por nombre"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          />
        </div>

        <div className="w-full md:w-56">
          <label className="sr-only" htmlFor="productos-categoria">
            Filtrar por categoría
          </label>
          <select
            id="productos-categoria"
            value={categoriaId}
            onChange={handleCategoriaChange}
            disabled={categoriasLoading}
            aria-label="Filtrar productos por categoría"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500"
          >
            <option value="">
              {categoriasLoading
                ? 'Cargando categorías...'
                : 'Todas las categorías'}
            </option>

            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="sr-only" htmlFor="productos-activo">
            Filtrar por estado
          </label>
          <select
            id="productos-activo"
            value={activo}
            onChange={handleActivoChange}
            aria-label="Filtrar productos por estado"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </PageToolbar>

      <ProductosList
        productos={productos}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />

      {shouldShowPagination && (
        <PagePagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={setPage}
        />
      )}
    </PageContainer>
  );
}

function ProductosList({ productos, isLoading, errorMessage }) {
  if (isLoading) {
    return <Loading />;
  }

  if (errorMessage) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {errorMessage}
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay productos registrados"
        description="Los productos que se carguen en la bodega aparecerán en este listado."
      />
    );
  }

  return (
    <div className="space-y-3">
      {productos.map((producto) => (
        <ProductCard key={producto.id} producto={producto} />
      ))}
    </div>
  );
}

export default ProductosPage;
