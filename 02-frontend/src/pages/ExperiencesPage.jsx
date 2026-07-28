import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmStatusDialog from '../components/common/ConfirmStatusDialog';
import FeedbackMessages from '../components/common/FeedbackMessages';
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
  const navigate = useNavigate();
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

  function openTimeSlots(experience) {
    navigate(`/experiences/${experience.id}/time-slots`);
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

      <FeedbackMessages
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
        onManageTimeSlots={openTimeSlots}
      />

      {experienceToChangeStatus && (
        <ConfirmStatusDialog
          title={`${
            experienceToChangeStatus.active ? 'Desactivar' : 'Activar'
          } experiencia`}
          message={`Vas a ${
            experienceToChangeStatus.active ? 'desactivar' : 'activar'
          } la experiencia ${experienceToChangeStatus.name}.`}
          confirmLabel={
            experienceToChangeStatus.active ? 'Desactivar' : 'Activar'
          }
          isLoading={isChangingStatus}
          confirmVariant={
            experienceToChangeStatus.active ? 'danger' : 'success'
          }
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

export default ExperiencesPage;
