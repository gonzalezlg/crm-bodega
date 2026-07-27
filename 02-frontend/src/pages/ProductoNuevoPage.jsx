import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductoForm from '../components/productos/ProductoForm';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { obtenerCategorias } from '../services/categoriasService';
import { crearProducto } from '../services/productosService';

const initialValues = {
  nombre: '',
  descripcion: '',
  categoriaId: '',
};

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : 'No se pudo completar la operación.';
}

function ProductoNuevoPage() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [categoriasLoading, setCategoriasLoading] = useState(false);
  const [categoriasError, setCategoriasError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadCategorias() {
      setCategoriasLoading(true);
      setCategoriasError('');

      try {
        const data = await obtenerCategorias({
          activo: true,
        });

        if (!isMounted) {
          return;
        }

        setCategorias(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setCategorias([]);
        setCategoriasError(getErrorMessage(error));
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

  async function handleSubmit(data) {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await crearProducto(data);

      if (!response?.id) {
        setSubmitError('El producto fue creado, pero no se recibió un ID válido.');
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
    navigate('/productos');
  }

  return (
    <PageContainer>
      <PageHeader
        title="Nuevo producto"
        subtitle="Cargá la información básica para incorporar un producto al catálogo."
      />

      <ProductoForm
        initialValues={initialValues}
        categorias={categorias}
        categoriasLoading={categoriasLoading}
        categoriasError={categoriasError}
        isSubmitting={isSubmitting}
        errorMessage={submitError}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </PageContainer>
  );
}

export default ProductoNuevoPage;
