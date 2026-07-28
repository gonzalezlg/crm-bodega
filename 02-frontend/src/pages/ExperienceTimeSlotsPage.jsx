import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ConfirmStatusDialog from '../components/common/ConfirmStatusDialog';
import FeedbackMessages from '../components/common/FeedbackMessages';
import TimeSlotForm from '../components/time-slots/TimeSlotForm';
import TimeSlotsTable from '../components/time-slots/TimeSlotsTable';
import { obtenerExperiencePorId } from '../services/experiencesService';
import {
  actualizarTimeSlot,
  crearTimeSlot,
  obtenerTimeSlotsPorExperience,
} from '../services/timeSlotsService';

function getErrorMessages(error) {
  return Array.isArray(error.messages) ? error.messages : [error.message];
}

function ExperienceTimeSlotsPage() {
  const { experienceId } = useParams();
  const [experience, setExperience] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [timeSlotToChangeStatus, setTimeSlotToChangeStatus] = useState(null);
  const [queryErrors, setQueryErrors] = useState([]);
  const [saveErrors, setSaveErrors] = useState([]);
  const [statusErrors, setStatusErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setQueryErrors([]);

    try {
      const [experienceData, timeSlotsData] = await Promise.all([
        obtenerExperiencePorId(experienceId),
        obtenerTimeSlotsPorExperience(experienceId),
      ]);

      setExperience(experienceData);
      setTimeSlots(Array.isArray(timeSlotsData) ? timeSlotsData : []);
    } catch (error) {
      setExperience(null);
      setTimeSlots([]);
      setQueryErrors(getErrorMessages(error));
    } finally {
      setIsLoading(false);
    }
  }, [experienceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreateForm() {
    setEditingTimeSlot(null);
    setShowForm(true);
    clearMessages();
  }

  function openEditForm(timeSlot) {
    setEditingTimeSlot(timeSlot);
    setShowForm(true);
    clearMessages();
  }

  function closeForm() {
    setShowForm(false);
    setEditingTimeSlot(null);
    setSaveErrors([]);
  }

  function clearMessages() {
    setSuccessMessage('');
    setSaveErrors([]);
    setStatusErrors([]);
  }

  async function handleSave(datos) {
    setIsSaving(true);
    setSaveErrors([]);
    setSuccessMessage('');

    try {
      await (editingTimeSlot
        ? actualizarTimeSlot(editingTimeSlot.id, datos)
        : crearTimeSlot(experienceId, datos));

      setSuccessMessage(
        editingTimeSlot
          ? 'Horario actualizado correctamente.'
          : 'Horario creado correctamente.',
      );
      closeForm();
      await loadData();
    } catch (error) {
      setSaveErrors(getErrorMessages(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangeStatus() {
    if (!timeSlotToChangeStatus) {
      return;
    }

    const nextActive = !timeSlotToChangeStatus.active;

    setIsChangingStatus(true);
    setStatusErrors([]);
    setSuccessMessage('');

    try {
      await actualizarTimeSlot(timeSlotToChangeStatus.id, {
        active: nextActive,
      });
      setTimeSlotToChangeStatus(null);
      setSuccessMessage(
        nextActive
          ? 'Horario activado correctamente.'
          : 'Horario desactivado correctamente.',
      );
      await loadData();
    } catch (error) {
      setStatusErrors(getErrorMessages(error));
    } finally {
      setIsChangingStatus(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/experiences"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
          >
            Volver a Experiencias
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
            Horarios semanales
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            {experience
              ? `${experience.name} · ${experience.durationMinutes} minutos`
              : 'Cargando experiencia...'}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Nuevo horario
        </button>
      </div>

      <FeedbackMessages
        queryErrors={queryErrors}
        saveErrors={saveErrors}
        statusErrors={statusErrors}
        successMessage={successMessage}
      />

      {showForm && (
        <div className="mb-4">
          <TimeSlotForm
            timeSlot={editingTimeSlot}
            isSaving={isSaving}
            onCancel={closeForm}
            onSubmit={handleSave}
          />
        </div>
      )}

      <TimeSlotsTable
        timeSlots={timeSlots}
        isLoading={isLoading}
        onEdit={openEditForm}
        onChangeStatus={setTimeSlotToChangeStatus}
      />

      {timeSlotToChangeStatus && (
        <ConfirmStatusDialog
          title={`${
            timeSlotToChangeStatus.active ? 'Desactivar' : 'Activar'
          } horario`}
          message={`Vas a ${
            timeSlotToChangeStatus.active ? 'desactivar' : 'activar'
          } el horario de las ${timeSlotToChangeStatus.startTime}.`}
          confirmLabel={
            timeSlotToChangeStatus.active ? 'Desactivar' : 'Activar'
          }
          isLoading={isChangingStatus}
          confirmVariant={
            timeSlotToChangeStatus.active ? 'danger' : 'success'
          }
          onCancel={() => {
            setTimeSlotToChangeStatus(null);
            setStatusErrors([]);
          }}
          onConfirm={handleChangeStatus}
        />
      )}
    </section>
  );
}

export default ExperienceTimeSlotsPage;
