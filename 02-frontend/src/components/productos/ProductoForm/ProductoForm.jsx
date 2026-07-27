import { useEffect, useState } from 'react';
import { FormActions } from '../../forms/FormActions';

const defaultInitialValues = {
  nombre: '',
  descripcion: '',
  categoriaId: '',
};

function validate(
  values,
  {
    categoriasLoading,
    categoriasError,
    hasCategoriasActivas,
    invalidCategoriaId,
  },
) {
  const errors = {};

  if (!values.nombre.trim()) {
    errors.nombre = 'Este campo es obligatorio.';
  }

  if (categoriasLoading) {
    errors.categoriaId = 'Esperá a que terminen de cargar las categorías.';
  } else if (categoriasError) {
    errors.categoriaId = 'No se pudieron cargar las categorías.';
  } else if (invalidCategoriaId && values.categoriaId === invalidCategoriaId) {
    errors.categoriaId =
      'La categoría actual está inactiva. Seleccioná una categoría activa.';
  } else if (!hasCategoriasActivas) {
    errors.categoriaId = 'No hay categorías activas disponibles.';
  } else if (!values.categoriaId) {
    errors.categoriaId = 'Seleccioná una categoría.';
  }

  return errors;
}

function ProductoForm({
  initialValues = defaultInitialValues,
  categorias = [],
  categoriasLoading = false,
  categoriasError = '',
  invalidCategoriaId = '',
  isSubmitting = false,
  errorMessage = '',
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(defaultInitialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues({
      nombre: initialValues.nombre ?? '',
      descripcion: initialValues.descripcion ?? '',
      categoriaId: initialValues.categoriaId ?? '',
    });
    setErrors({});
  }, [initialValues]);

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        delete nextErrors[name];
        return nextErrors;
      });
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validate(values, {
      categoriasLoading,
      categoriasError,
      hasCategoriasActivas,
      invalidCategoriaId,
    });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit({
      nombre: values.nombre.trim(),
      descripcion: values.descripcion.trim(),
      categoriaId: values.categoriaId,
    });
  }

  const hasCategorias = categorias.length > 0;
  const hasCategoriasActivas =
    hasCategorias &&
    categorias.some((categoria) => categoria.id !== invalidCategoriaId);
  const isInvalidCategoriaSelected =
    Boolean(invalidCategoriaId) && values.categoriaId === invalidCategoriaId;
  const submitDisabled =
    isSubmitting ||
    categoriasLoading ||
    Boolean(categoriasError) ||
    !hasCategoriasActivas ||
    isInvalidCategoriaSelected;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Nombre"
          name="nombre"
          value={values.nombre}
          error={errors.nombre}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        />

        <div>
          <label
            htmlFor="categoriaId"
            className="text-sm font-medium text-zinc-700"
          >
            Categoría <span className="text-red-600">*</span>
          </label>
          <select
            id="categoriaId"
            name="categoriaId"
            value={values.categoriaId}
            onChange={handleChange}
            disabled={
              isSubmitting || categoriasLoading || Boolean(categoriasError)
            }
            className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-100 ${
              errors.categoriaId
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                : 'border-zinc-300 focus:border-zinc-500 focus:ring-zinc-200'
            }`}
          >
            <option value="">
              {categoriasLoading
                ? 'Cargando categorías...'
                : 'Seleccionar categoría'}
            </option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.id === invalidCategoriaId
                  ? `${categoria.nombre} (inactiva)`
                  : categoria.nombre}
              </option>
            ))}
          </select>
          {errors.categoriaId && (
            <p className="mt-1 text-xs text-red-600">{errors.categoriaId}</p>
          )}
          {isInvalidCategoriaSelected &&
            hasCategoriasActivas &&
            !errors.categoriaId && (
              <p className="mt-1 text-xs text-amber-700">
                La categoría actual está inactiva. Seleccioná una categoría
                activa para guardar los cambios.
              </p>
            )}
          {isInvalidCategoriaSelected &&
            !hasCategoriasActivas &&
            !errors.categoriaId && (
              <p className="mt-1 text-xs text-amber-700">
                La categoría actual está inactiva y no hay categorías activas
                disponibles. No es posible guardar cambios.
              </p>
            )}
          {!categoriasLoading &&
            !categoriasError &&
            !hasCategoriasActivas &&
            !isInvalidCategoriaSelected &&
            !errors.categoriaId && (
              <p className="mt-1 text-xs text-amber-700">
                No hay categorías activas disponibles.
              </p>
            )}
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="descripcion"
            className="text-sm font-medium text-zinc-700"
          >
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={values.descripcion}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={4}
            className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-100"
          />
        </div>
      </div>

      {categoriasError && (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {categoriasError}
        </div>
      )}

      {errorMessage && (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mt-6">
        <FormActions
          onCancel={onCancel}
          submitDisabled={submitDisabled}
          submitLoading={isSubmitting}
        />
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  error,
  onChange,
  type = 'text',
  disabled = false,
  required = false,
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-100 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-zinc-300 focus:border-zinc-500 focus:ring-zinc-200'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default ProductoForm;
