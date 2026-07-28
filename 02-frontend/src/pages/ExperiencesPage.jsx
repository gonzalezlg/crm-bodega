import { useCallback, useEffect, useState } from 'react';
import ExperienceForm from '../components/experiences/ExperienceForm';
import ExperiencesTable from '../components/experiences/ExperiencesTable';
import {
  actualizarExperience,
  crearExperience,
  obtenerExperiences,
} from '../services/experiencesService';

function getErrorMessages(error) {
  return Array.isArray(error.messages) ? error.messages : [error.message];
}

function ExperiencesPage() {
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [experienceToChangeStatus, setExperienceToChangeStatus] =
    useState(null);
  const [queryErrors, setQueryErrors] = useState([]);
  const [saveErrors, setSaveErrors] = useState([]);
  const [statusErrors, setStatusErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const loadExperiences = useCallback(async () => {
    setIsLoading(true);
    setQueryErrors([]);

    try {
      const data = await obtenerExperiences();
      setExperiences(Array.isArray(data) ? data : []);
    } catch (error) {
      setExperiences([]);
      setQueryErrors(getErrorMessages(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  function openCreateForm() {
    setEditingExperience(null);
    setShowForm(true);
    clearMessages();
  }

  function openEditForm(experience) {
    setEditingExperience(experience);
    setShowForm(true);
    clearMessages();
  }

  function closeForm() {
    setShowForm(false);
    setEditingExperience(null);
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
      await (editingExperience
        ? actualizarExperience(editingExperience.id, datos)
        : crearExperience(datos));

      setSuccessMessage(
        editingExperience
          ? 'Experiencia actualizada correctamente.'
          : 'Experiencia creada correctamente.',
      );
      closeForm();
      await loadExperiences();
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (error) {
      setSaveErrors(getErrorMessages(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangeStatus() {
    if (!experienceToChangeStatus) {
      return;
    }

    const nextActive = !experienceToChangeStatus.active;

    setIsChangingStatus(true);
    setStatusErrors([]);
    setSuccessMessage('');

    try {
      await actualizarExperience(experienceToChangeStatus.id, {
        active: nextActive,
      });
      setExperienceToChangeStatus(null);
      setSuccessMessage(
        nextActive
          ? 'Experiencia activada correctamente.'
          : 'Experiencia desactivada correctamente.',
      );
      await loadExperiences();
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
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
          <h2 className="text-2xl font-semibold text-zinc-950">
            Experiencias
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Administra las experiencias disponibles para reservas.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Nueva experiencia
        </button>
      </div>

      <Messages
        queryErrors={queryErrors}
        saveErrors={saveErrors}
        statusErrors={statusErrors}
        successMessage={successMessage}
      />

      {showForm && (
        <div className="mb-4">
          <ExperienceForm
            experience={editingExperience}
            isSaving={isSaving}
            onCancel={closeForm}
            onSubmit={handleSave}
          />
        </div>
      )}

      <ExperiencesTable
        experiences={experiences}
        isLoading={isLoading}
        onEdit={openEditForm}
        onChangeStatus={setExperienceToChangeStatus}
      />

      {experienceToChangeStatus && (
        <ConfirmStatusDialog
          experience={experienceToChangeStatus}
          isChangingStatus={isChangingStatus}
          onCancel={() => {
            setExperienceToChangeStatus(null);
            setStatusErrors([]);
          }}
          onConfirm={handleChangeStatus}
        />
      )}
    </section>
  );
}

function Messages({
  queryErrors,
  saveErrors,
  statusErrors,
  successMessage,
}) {
  const errors = [...queryErrors, ...saveErrors, ...statusErrors].filter(
    Boolean,
  );

  return (
    <div className="mb-4 space-y-3">
      {successMessage && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      {errors.map((error, index) => (
        <div
          key={`${error}-${index}`}
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ))}
    </div>
  );
}

function ConfirmStatusDialog({
  experience,
  isChangingStatus,
  onCancel,
  onConfirm,
}) {
  const nextAction = experience.active ? 'desactivar' : 'activar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-zinc-950">
          {experience.active ? 'Desactivar' : 'Activar'} experiencia
        </h3>
        <p className="mt-2 text-sm text-zinc-600">
          Vas a {nextAction} la experiencia {experience.name}.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isChangingStatus}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isChangingStatus}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${
              experience.active
                ? 'bg-red-700 hover:bg-red-800'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            {isChangingStatus
              ? 'Guardando...'
              : experience.active
                ? 'Desactivar'
                : 'Activar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExperiencesPage;
