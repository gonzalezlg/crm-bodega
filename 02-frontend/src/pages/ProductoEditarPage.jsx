import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductoForm from '../components/productos/ProductoForm';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Loading } from '../components/ui/Loading';
import { obtenerCategorias } from '../services/categoriasService';
import {
  actualizarProducto,
  obtenerProductoPorId,
} from '../services/productosService';

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : 'No se pudo completar la operación.';
}

function buildInitialValues(producto) {
  return {
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    categoriaId: producto?.categoriaId ?? producto?.categoria?.id ?? '',
  };
}

function mergeCategoriaActual(categoriasActivas, producto) {
  const categoriaActual = producto?.categoria;

  if (!categoriaActual?.id) {
    return categoriasActivas;
  }

  const exists = categoriasActivas.some(
    (categoria) => categoria.id === categoriaActual.id,
  );

  if (exists) {
    return categoriasActivas;
  }

  return [...categoriasActivas, categoriaActual];
}

function ProductoEditarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [categoriasLoading, setCategoriasLoading] = useState(false);
  const [categoriasError, setCategoriasError] = useState('');
  const [isLoadingProducto, setIsLoadingProducto] = useState(false);
  const [productoError, setProductoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoadingProducto(true);
      setCategoriasLoading(true);
      setProductoError('');
      setCategoriasError('');
      setSubmitError('');

      try {
        const [productoResult, categoriasResult] = await Promise.allSettled([
          obtenerProductoPorId(id),
          obtenerCategorias({ activo: true }),
        ]);

        if (!isMounted) {
          return;
        }

        if (productoResult.status === 'rejected' || !productoResult.value?.id) {
          setProducto(null);
          setInitialValues(null);
          setProductoError(
            productoResult.status === 'rejected'
              ? getErrorMessage(productoResult.reason)
              : 'Producto no encontrado.',
          );
          return;
        }

        const productoData = productoResult.value;
        const categoriasActivas =
          categoriasResult.status === 'fulfilled' &&
          Array.isArray(categoriasResult.value)
            ? categoriasResult.value
            : [];

        if (categoriasResult.status === 'rejected') {
          setCategoriasError(getErrorMessage(categoriasResult.reason));
        }

        setProducto(productoData);
        setInitialValues(buildInitialValues(productoData));
        setCategorias(mergeCategoriaActual(categoriasActivas, productoData));
      } finally {
        if (isMounted) {
          setIsLoadingProducto(false);
          setCategoriasLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleSubmit(data) {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await actualizarProducto(id, data);

      if (!response?.id) {
        setSubmitError(
          'El producto fue actualizado, pero no se recibió un ID válido.',
        );
        return;
      }

      navigate(`/productos/${response.id}`);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    navigate(`/productos/${id}`);
  }

  if (isLoadingProducto) {
    return (
      <PageContainer>
        <Loading />
      </PageContainer>
    );
  }

  if (productoError || !producto) {
    return (
      <PageContainer>
        <EmptyState
          title="Producto no encontrado"
          description={
            productoError || 'No se pudo encontrar el producto solicitado.'
          }
          action={
            <button
              type="button"
              onClick={() => navigate('/productos')}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-200 focus:ring-offset-2"
            >
              Volver
            </button>
          }
        />
      </PageContainer>
    );
  }

  if (!initialValues) {
    return (
      <PageContainer>
        <Loading />
      </PageContainer>
    );
  }

  const invalidCategoriaId =
    producto.categoria?.activo === false ? producto.categoria.id : '';

  return (
    <PageContainer>
      <PageHeader
        title="Editar producto"
        subtitle="Actualizá la información básica del producto."
      />

      <ProductoForm
        initialValues={initialValues}
        categorias={categorias}
        categoriasLoading={categoriasLoading}
        categoriasError={categoriasError}
        invalidCategoriaId={invalidCategoriaId}
        isSubmitting={isSubmitting}
        errorMessage={submitError}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </PageContainer>
  );
}

export default ProductoEditarPage;
