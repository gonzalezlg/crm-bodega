import { useEffect, useState } from 'react';

const initialValues = {
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  ubicacion: '',
  observaciones: '',
};

function validate(values) {
  const errors = {};
  const requiredFields = ['nombre', 'apellido', 'telefono', 'email'];

  requiredFields.forEach((field) => {
    if (!values[field].trim()) {
      errors[field] = 'Este campo es obligatorio.';
    }
  });

  if (
    values.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
  ) {
    errors.email = 'Ingresá un email válido.';
  }

  return errors;
}

function ClienteForm({ cliente, isSaving, onCancel, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const isEditing = Boolean(cliente);

  useEffect(() => {
    setValues({
      nombre: cliente?.nombre ?? '',
      apellido: cliente?.apellido ?? '',
      telefono: cliente?.telefono ?? '',
      email: cliente?.email ?? '',
      ubicacion: cliente?.ubicacion ?? '',
      observaciones: cliente?.observaciones ?? '',
    });
    setErrors({});
  }, [cliente]);

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
      apellido: values.apellido.trim(),
      telefono: values.telefono.trim(),
      email: values.email.trim(),
      ubicacion: values.ubicacion.trim() || (isEditing ? null : undefined),
      observaciones:
        values.observaciones.trim() || (isEditing ? null : undefined),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:p-6"
    >
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-zinc-950">
          {isEditing ? 'Editar cliente' : 'Nuevo cliente'}
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Nombre"
          name="nombre"
          value={values.nombre}
          error={errors.nombre}
          onChange={handleChange}
          disabled={isSaving}
          required
        />
        <Field
          label="Apellido"
          name="apellido"
          value={values.apellido}
          error={errors.apellido}
          onChange={handleChange}
          disabled={isSaving}
          required
        />
        <Field
          label="Teléfono"
          name="telefono"
          value={values.telefono}
          error={errors.telefono}
          onChange={handleChange}
          disabled={isSaving}
          required
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={values.email}
          error={errors.email}
          onChange={handleChange}
          disabled={isSaving}
          required
        />
        <Field
          label="Ubicación"
          name="ubicacion"
          value={values.ubicacion}
          error={errors.ubicacion}
          onChange={handleChange}
          disabled={isSaving}
        />
        <div className="md:col-span-2">
          <label
            htmlFor="observaciones"
            className="text-sm font-medium text-zinc-700"
          >
            Observaciones
          </label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={values.observaciones}
            onChange={handleChange}
            disabled={isSaving}
            rows={4}
            className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-100"
          />
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
              : 'Guardar cliente'}
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

export default ClienteForm;
