import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReservationForm from '../components/reservations/ReservationForm';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { createReservation } from '../services/reservationsService';

const initialValues = {
  experienceId: '',
  date: '',
  peopleCount: '',
  startTime: '',
  notes: '',
};

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : 'No se pudo completar la operacion.';
}

function ReservationCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  async function handleSubmit(data) {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await createReservation(data);
      navigate('/reservas');
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    navigate('/reservas');
  }

  return (
    <PageContainer>
      <PageHeader
        title="Nueva reserva"
        subtitle="Carga la experiencia, fecha, horario y cantidad de personas."
      />

      {submitError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <ReservationForm
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </PageContainer>
  );
}

export default ReservationCreatePage;
