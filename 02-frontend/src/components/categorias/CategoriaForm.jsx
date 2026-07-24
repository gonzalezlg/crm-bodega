import { useEffect, useState } from 'react';

const initialValues = {
  nombre: '',
  descripcion: '',
};

function validate(values) {
  const errors = {};
  const nombre = values.nombre.trim();
  const descripcion = values.descripcion.trim();

  if (!nombre) {
    errors.nombre = 'Este campo es obligatorio.';
  } else if (nombre.length < 2) {
    errors.nombre = 'Debe tener al menos 2 caracteres.';
  } else if (nombre.length > 60) {
    errors.nombre = 'Debe tener como maximo 60 caracteres.';
  }

  if (descripcion.length > 300) {
    errors.descripcion = 'Debe tener como maximo 300 caracteres.';
  }

  return errors;
}

function CategoriaForm({ categoria, isSaving, onCancel, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const isEditing = Boolean(categoria);

  useEffect(() => {
    setValues({
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    });
    setErrors({});
  }, [categoria]);

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [name]: undefined,
      }));
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit({
      nombre: values.nombre.trim(),
      descripcion:
        values.descripcion.trim() || (isEditing ? null : undefined),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:p-6"
    >
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-zinc-950">
          {isEditing ? 'Editar categoria' : 'Nueva categoria'}
        </h3>
      </div>

      <div className="grid gap-4">
        <Field
          label="Nombre"
          name="nombre"
          value={values.nombre}
          error={errors.nombre}
          onChange={handleChange}
          disabled={isSaving}
          required
        />
        <div>
          <label
            htmlFor="descripcion"
            className="text-sm font-medium text-zinc-700"
          >
            Descripcion
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={values.descripcion}
            onChange={handleChange}
            disabled={isSaving}
            rows={4}
            className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-100 ${
              errors.descripcion
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                : 'border-zinc-300 focus:border-zinc-500 focus:ring-zinc-200'
            }`}
          />
          {errors.descripcion && (
            <p className="mt-1 text-xs text-red-600">
              {errors.descripcion}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving
            ? 'Guardando...'
            : isEditing
              ? 'Guardar cambios'
              : 'Guardar categoria'}
        </button>
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

export default CategoriaForm;
