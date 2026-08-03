import { useEffect, useMemo, useRef, useState } from 'react';
import { FormActions } from '../forms/FormActions';
import { obtenerExperiences } from '../../services/experiencesService';
import { getAvailability } from '../../services/reservationsService';

const defaultInitialValues = {
  experienceId: '',
  date: '',
  peopleCount: '',
  startTime: '',
  notes: '',
};

function getTodayDateString() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 10);
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : 'No se pudo completar la operación.';
}

function validate(values, { experiencesLoading, experiencesError }) {
  const errors = {};
  const peopleCount = Number(values.peopleCount);

  if (experiencesLoading) {
    errors.experienceId = 'Esperá a que terminen de cargar las experiencias.';
  } else if (experiencesError) {
    errors.experienceId = 'No se pudieron cargar las experiencias.';
  } else if (!values.experienceId) {
    errors.experienceId = 'Seleccioná una experiencia.';
  }

  if (!values.date) {
    errors.date = 'Este campo es obligatorio.';
  }

  if (!values.peopleCount) {
    errors.peopleCount = 'Este campo es obligatorio.';
  } else if (!Number.isInteger(peopleCount)) {
    errors.peopleCount = 'Debe ser un número entero.';
  } else if (peopleCount < 1) {
    errors.peopleCount = 'Debe ser mayor o igual a 1.';
  }

  if (!values.startTime) {
    errors.startTime = 'Seleccioná un horario.';
  }

  return errors;
}

function getStartTimePlaceholder({
  experienceId,
  date,
  hasValidPeopleCount,
  availabilityLoading,
}) {
  if (!experienceId) {
    return 'Seleccioná primero una experiencia';
  }

  if (!date) {
    return 'Seleccioná primero una fecha';
  }

  if (!hasValidPeopleCount) {
    return 'Ingresá la cantidad de personas';
  }

  if (availabilityLoading) {
    return 'Cargando horarios disponibles...';
  }

  return 'Seleccionar horario';
}

function shouldPreserveOriginalReservationSlot({
  currentValues,
  initialValues,
}) {
  return (
    Boolean(initialValues.startTime) &&
    currentValues.experienceId === initialValues.experienceId &&
    currentValues.date === initialValues.date &&
    currentValues.startTime === initialValues.startTime
  );
}

function ReservationForm({
  initialValues = defaultInitialValues,
  isSubmitting = false,
  primaryLabel = 'Guardar cambios',
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(defaultInitialValues);
  const [errors, setErrors] = useState({});
  const [experiences, setExperiences] = useState([]);
  const [experiencesLoading, setExperiencesLoading] = useState(false);
  const [experiencesError, setExperiencesError] = useState('');
  const [availability, setAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const skipNextAvailabilityReset = useRef(false);
  const [today] = useState(getTodayDateString);

  useEffect(() => {
    skipNextAvailabilityReset.current = true;
    setValues({
      experienceId: initialValues.experienceId ?? '',
      date: initialValues.date ?? '',
      peopleCount:
        initialValues.peopleCount === undefined ||
        initialValues.peopleCount === null
          ? ''
          : String(initialValues.peopleCount),
      startTime: initialValues.startTime ?? '',
      notes: initialValues.notes ?? '',
    });
    setErrors({});
  }, [initialValues]);

  useEffect(() => {
    let isMounted = true;

    async function loadExperiences() {
      setExperiencesLoading(true);
      setExperiencesError('');

      try {
        const data = await obtenerExperiences();

        if (!isMounted) {
          return;
        }

        setExperiences(
          Array.isArray(data)
            ? data.filter((experience) => experience.active)
            : [],
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setExperiences([]);
        setExperiencesError(getErrorMessage(error));
      } finally {
        if (isMounted) {
          setExperiencesLoading(false);
        }
      }
    }

    loadExperiences();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const peopleCount = Number(values.peopleCount);
    const shouldLoadAvailability =
      values.experienceId &&
      values.date &&
      Number.isInteger(peopleCount) &&
      peopleCount > 0;

    if (skipNextAvailabilityReset.current) {
      skipNextAvailabilityReset.current = false;
    } else {
      setValues((currentValues) => ({
        ...currentValues,
        startTime: shouldPreserveOriginalReservationSlot({
          currentValues,
          initialValues,
        })
          ? currentValues.startTime
          : '',
      }));
    }

    setAvailability([]);
    setAvailabilityError('');

    if (!shouldLoadAvailability) {
      setAvailabilityLoading(false);
      return () => {
        isMounted = false;
      };
    }

    async function loadAvailability() {
      setAvailabilityLoading(true);

      try {
        const data = await getAvailability(values.experienceId, values.date);

        if (!isMounted) {
          return;
        }

        setAvailability(Array.isArray(data?.slots) ? data.slots : []);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setAvailability([]);
        setAvailabilityError(getErrorMessage(error));
      } finally {
        if (isMounted) {
          setAvailabilityLoading(false);
        }
      }
    }

    loadAvailability();

    return () => {
      isMounted = false;
    };
  }, [values.experienceId, values.date, values.peopleCount]);

  const availableSlots = useMemo(() => {
    const peopleCount = Number(values.peopleCount);
    const slots = availability.filter(
      (slot) =>
        Number.isInteger(peopleCount) &&
        peopleCount > 0 &&
        slot.available >= peopleCount,
    );
    const shouldAddOriginalSlot =
      shouldPreserveOriginalReservationSlot({
        currentValues: values,
        initialValues,
      }) &&
      !slots.some((slot) => slot.startTime === initialValues.startTime);

    if (!shouldAddOriginalSlot) {
      return slots;
    }

    return [
      {
        startTime: initialValues.startTime,
        available: 0,
        isCurrent: true,
      },
      ...slots,
    ];
  }, [availability, initialValues, values]);

  const peopleCount = Number(values.peopleCount);
  const hasValidPeopleCount =
    Number.isInteger(peopleCount) && peopleCount > 0;
  const shouldShowAvailabilityMessage =
    !availabilityLoading &&
    values.experienceId &&
    values.date &&
    hasValidPeopleCount &&
    availableSlots.length === 0 &&
    !availabilityError;

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
      experiencesLoading,
      experiencesError,
    });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload = {
      experienceId: values.experienceId,
      date: values.date,
      startTime: values.startTime,
      peopleCount: Number(values.peopleCount),
    };
    const notes = values.notes.trim();

    if (notes) {
      payload.notes = notes;
    } else if (initialValues.startTime) {
      payload.notes = '';
    }

    onSubmit(payload);
  }

  const isSubmitDisabled = useMemo(
    () =>
      isSubmitting ||
      experiencesLoading ||
      Boolean(experiencesError) ||
      experiences.length === 0 ||
      availabilityLoading ||
      Boolean(availabilityError) ||
      !values.experienceId ||
      !values.date ||
      !hasValidPeopleCount ||
      !values.startTime,
    [
      availabilityError,
      availabilityLoading,
      experiences.length,
      experiencesError,
      experiencesLoading,
      hasValidPeopleCount,
      isSubmitting,
      values.date,
      values.experienceId,
      values.startTime,
    ],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:p-6"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-4">
          <div>
            <label
              htmlFor="experienceId"
              className="text-sm font-medium text-zinc-700"
            >
              Experiencia <span className="text-red-600">*</span>
            </label>
            <select
              id="experienceId"
              name="experienceId"
              value={values.experienceId}
              onChange={handleChange}
              disabled={isSubmitting || experiencesLoading}
              className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-100 ${
                errors.experienceId
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                  : 'border-zinc-300 focus:border-zinc-500 focus:ring-zinc-200'
              }`}
            >
              <option value="">
                {experiencesLoading
                  ? 'Cargando experiencias...'
                  : 'Seleccionar experiencia'}
              </option>
              {experiences.map((experience) => (
                <option key={experience.id} value={experience.id}>
                  {experience.name}
                </option>
              ))}
            </select>
            {errors.experienceId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.experienceId}
              </p>
            )}
            {!experiencesLoading &&
              !experiencesError &&
              experiences.length === 0 &&
              !errors.experienceId && (
                <p className="mt-1 text-xs text-amber-700">
                  No hay experiencias activas disponibles.
                </p>
              )}
          </div>

          <Field
            label="Fecha"
            name="date"
            type="date"
            value={values.date}
            error={errors.date}
            onChange={handleChange}
            disabled={isSubmitting}
            min={today}
            required
          />

          <Field
            label="Cantidad de personas"
            name="peopleCount"
            type="number"
            min="1"
            step="1"
            value={values.peopleCount}
            error={errors.peopleCount}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />

          <div>
            <label
              htmlFor="startTime"
              className="text-sm font-medium text-zinc-700"
            >
              Horario <span className="text-red-600">*</span>
            </label>
            <select
              id="startTime"
              name="startTime"
              value={values.startTime}
              onChange={handleChange}
              disabled={
                isSubmitting ||
                availabilityLoading ||
                !values.experienceId ||
                !values.date ||
                !hasValidPeopleCount
              }
              className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-100 ${
                errors.startTime
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                  : 'border-zinc-300 focus:border-zinc-500 focus:ring-zinc-200'
              }`}
            >
              <option value="">
                {getStartTimePlaceholder({
                  experienceId: values.experienceId,
                  date: values.date,
                  hasValidPeopleCount,
                  availabilityLoading,
                })}
              </option>
              {availableSlots.map((slot) => (
                <option key={slot.startTime} value={slot.startTime}>
                  {slot.isCurrent
                    ? `${slot.startTime} - horario actualmente asignado`
                    : `${slot.startTime} - ${slot.available} lugares disponibles`}
                </option>
              ))}
            </select>
            {errors.startTime && (
              <p className="mt-1 text-xs text-red-600">{errors.startTime}</p>
            )}
            {shouldShowAvailabilityMessage && (
              <p className="mt-1 text-xs text-amber-700">
                No hay horarios con disponibilidad suficiente para {peopleCount}{' '}
                {peopleCount === 1 ? 'persona' : 'personas'} en la fecha
                seleccionada.
              </p>
            )}
            {availabilityError && (
              <p className="mt-1 text-xs text-red-600">{availabilityError}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="text-sm font-medium text-zinc-700">
            Notas
          </label>
          <textarea
            id="notes"
            name="notes"
            value={values.notes}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={6}
            className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-100"
          />
        </div>
      </div>

      {experiencesError && (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {experiencesError}
        </div>
      )}

      <div className="mt-6">
        <FormActions
          onCancel={onCancel}
          submitDisabled={isSubmitDisabled}
          primaryLabel={primaryLabel}
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

export default ReservationForm;
