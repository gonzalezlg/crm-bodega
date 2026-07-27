import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Loading } from '../components/ui/Loading';
import {
  actualizarEstadoProducto,
  obtenerProductoPorId,
} from '../services/productosService';

function getCategoriaNombre(producto) {
  return producto?.categoria?.nombre || 'Sin categoría';
}

function ProductoDetallePage() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingEstado, setIsUpdatingEstado] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [estadoError, setEstadoError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProducto() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await obtenerProductoPorId(id);

        if (!isMounted) {
          return;
        }

        if (!data || !data.id) {
          setProducto(null);
          setErrorMessage('Producto no encontrado.');
          return;
        }

        setProducto(data);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setProducto(null);
        setErrorMessage(
          error instanceof Error ? error.message : 'No se pudo cargar el producto.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducto();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleEstadoChange() {
    if (isUpdatingEstado) {
      return;
    }

    const nextActivo = !producto.activo;

    if (
      !nextActivo &&
      !window.confirm(
        `¿Confirmás que querés desactivar "${producto.nombre}"?`,
      )
    ) {
      return;
    }

    setIsUpdatingEstado(true);
    setEstadoError('');

    try {
      const response = await actualizarEstadoProducto(producto.id, nextActivo);

      if (!response?.id) {
        setEstadoError('No se recibió una respuesta válida del servidor.');
        return;
      }

      setProducto(response);
    } catch (error) {
      setEstadoError(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el estado del producto.',
      );
    } finally {
      setIsUpdatingEstado(false);
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <Loading />
      </PageContainer>
    );
  }

  if (errorMessage || !producto) {
    return (
      <PageContainer>
        <EmptyState
          title="Producto no encontrado"
          description={errorMessage || 'No se pudo encontrar el producto solicitado.'}
          action={<VolverLink />}
        />
      </PageContainer>
    );
  }

  const categoriaNombre = getCategoriaNombre(producto);
  const estado = producto.activo ? 'Activo' : 'Inactivo';

  return (
    <PageContainer>
      <PageHeader
        title={producto.nombre}
        subtitle={categoriaNombre}
        actions={
          <>
            <Badge variant={producto.activo ? 'success' : 'neutral'}>
              {estado}
            </Badge>
            <Link
              to={`/productos/${producto.id}/editar`}
              aria-disabled={isUpdatingEstado}
              tabIndex={isUpdatingEstado ? -1 : undefined}
              onClick={(event) => {
                if (isUpdatingEstado) {
                  event.preventDefault();
                }
              }}
              className={`inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 ${
                isUpdatingEstado ? 'pointer-events-none opacity-70' : ''
              }`}
            >
              Editar
            </Link>
            <Button
              variant={producto.activo ? 'danger' : 'secondary'}
              loading={isUpdatingEstado}
              disabled={isUpdatingEstado}
              onClick={handleEstadoChange}
            >
              {producto.activo ? 'Desactivar' : 'Activar'}
            </Button>
            <VolverLink />
          </>
        }
      />

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-950">
          Información general
        </h2>

        <dl className="mt-5 grid gap-5 md:grid-cols-2">
          <DetalleItem label="Nombre" value={producto.nombre} />
          <DetalleItem label="Categoría" value={categoriaNombre} />
          <DetalleItem label="Estado" value={estado} />
          <DetalleItem
            label="Descripción"
            value={producto.descripcion || 'Sin descripción'}
            className="md:col-span-2"
          />
        </dl>

        {estadoError && (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {estadoError}
          </div>
        )}
      </section>
    </PageContainer>
  );
}

function DetalleItem({ label, value, className = '' }) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-zinc-950">{value}</dd>
    </div>
  );
}

function VolverLink() {
  return (
    <Link
      to="/productos"
      className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-200 focus:ring-offset-2"
    >
      Volver
    </Link>
  );
}

export default ProductoDetallePage;
