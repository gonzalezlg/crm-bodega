import { useEffect, useState } from 'react';
import { WEEKDAYS } from './weekdays';

const initialValues = {
  weekday: '',
  startTime: '',
  maxPeople: '',
  active: true,
};

function validate(values) {
  const errors = {};
  const maxPeople = Number(values.maxPeople);

  if (!values.weekday) {
    errors.weekday = 'Este campo es obligatorio.';
  }

  if (!values.startTime) {
    errors.startTime = 'Este campo es obligatorio.';
  } else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(values.startTime)) {
    errors.startTime = 'Debe tener formato HH:mm.';
  }

  if (!values.maxPeople) {
    errors.maxPeople = 'Este campo es obligatorio.';
  } else if (!Number.isInteger(maxPeople)) {
    errors.maxPeople = 'Debe ser un numero entero.';
  } else if (maxPeople < 1) {
    errors.maxPeople = 'Debe ser mayor o igual a 1.';
  }

  return errors;
}

function TimeSlotForm({ timeSlot, isSaving, onCancel, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const isEditing = Boolean(timeSlot);

  useEffect(() => {
    setValues({
      weekday: timeSlot?.weekday ?? '',
      startTime: timeSlot?.startTime ?? '',
      maxPeople:
        timeSlot?.maxPeople === undefined ? '' : String(timeSlot.maxPeople),
      active: timeSlot?.active ?? true,
    });
    setErrors({});
  }, [timeSlot]);

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
      weekday: values.weekday,
      startTime: values.startTime,
      maxPeople: Number(values.maxPeople),
    };

    if (isEditing) {
      payload.active = values.active;
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
          {isEditing ? 'Editar horario' : 'Nuevo horario'}
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label
            htmlFor="weekday"
            className="text-sm font-medium text-zinc-700"
          >
            Día <span className="text-red-600">*</span>
          </label>
          <select
            id="weekday"
            name="weekday"
            value={values.weekday}
            onChange={handleChange}
            disabled={isSaving}
            className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-100 ${
              errors.weekday
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                : 'border-zinc-300 focus:border-zinc-500 focus:ring-zinc-200'
            }`}
          >
            <option value="">Seleccionar día</option>
            {WEEKDAYS.map((weekday) => (
              <option key={weekday.value} value={weekday.value}>
                {weekday.label}
              </option>
            ))}
          </select>
          {errors.weekday && (
            <p className="mt-1 text-xs text-red-600">{errors.weekday}</p>
          )}
        </div>

        <Field
          label="Hora de inicio"
          name="startTime"
          type="time"
          value={values.startTime}
          error={errors.startTime}
          onChange={handleChange}
          disabled={isSaving}
          required
        />

        <Field
          label="Cupo máximo"
          name="maxPeople"
          type="number"
          min="1"
          step="1"
          value={values.maxPeople}
          error={errors.maxPeople}
          onChange={handleChange}
          disabled={isSaving}
          required
        />

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
            Activo
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
              : 'Guardar horario'}
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

export default TimeSlotForm;
