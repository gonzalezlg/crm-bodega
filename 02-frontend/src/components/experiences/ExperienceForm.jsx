import { useEffect, useState } from 'react';

const initialValues = {
  name: '',
  description: '',
  durationMinutes: '',
  active: true,
};

function validate(values) {
  const errors = {};
  const name = values.name.trim();
  const duration = Number(values.durationMinutes);

  if (!name) {
    errors.name = 'Este campo es obligatorio.';
  }

  if (!values.durationMinutes) {
    errors.durationMinutes = 'Este campo es obligatorio.';
  } else if (!Number.isInteger(duration)) {
    errors.durationMinutes = 'Debe ser un numero entero.';
  } else if (duration < 1) {
    errors.durationMinutes = 'Debe ser mayor o igual a 1.';
  }

  return errors;
}

function ExperienceForm({ experience, isSaving, onCancel, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const isEditing = Boolean(experience);

  useEffect(() => {
    setValues({
      name: experience?.name ?? '',
      description: experience?.description ?? '',
      durationMinutes:
        experience?.durationMinutes === undefined
          ? ''
          : String(experience.durationMinutes),
      active: experience?.active ?? true,
    });
    setErrors({});
  }, [experience]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value,
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

    const payload = {
      name: values.name.trim(),
      durationMinutes: Number(values.durationMinutes),
    };

    const description = values.description.trim();

    if (description) {
      payload.description = description;
    }

    if (isEditing) {
      payload.active = values.active;
      if (!description) {
        payload.description = '';
      }
    }

    onSubmit(payload);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:p-6"
    >
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-zinc-950">
          {isEditing ? 'Editar experiencia' : 'Nueva experiencia'}
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Nombre"
          name="name"
          value={values.name}
          error={errors.name}
          onChange={handleChange}
          disabled={isSaving}
          required
        />

        <Field
          label="Duracion (minutos)"
          name="durationMinutes"
          type="number"
          min="1"
          step="1"
          value={values.durationMinutes}
          error={errors.durationMinutes}
          onChange={handleChange}
          disabled={isSaving}
          required
        />

        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-zinc-700"
          >
            Descripcion
          </label>
          <textarea
            id="description"
            name="description"
            value={values.description}
            onChange={handleChange}
            disabled={isSaving}
            rows={4}
            className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-100"
          />
        </div>

        {isEditing && (
          <label className="flex items-center gap-3 text-sm font-medium text-zinc-700">
            <input
              type="checkbox"
              name="active"
              checked={values.active}
              onChange={handleChange}
              disabled={isSaving}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-300 disabled:cursor-not-allowed"
            />
            Activa
          </label>
        )}
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
              : 'Guardar experiencia'}
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
  min,
  step,
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
        min={min}
        step={step}
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

export default ExperienceForm;
