import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FeedbackMessages from '../components/common/FeedbackMessages';
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

function getErrorMessages(error) {
  return Array.isArray(error.messages) ? error.messages : [error.message];
}

function ReservationCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState([]);

  async function handleSubmit(data) {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitErrors([]);

    try {
      await createReservation(data);
      navigate('/reservas');
    } catch (error) {
      setSubmitErrors(getErrorMessages(error));
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
        subtitle="Cargá la experiencia, fecha, horario y cantidad de personas."
      />

      <FeedbackMessages saveErrors={submitErrors} />

      <ReservationForm
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        primaryLabel="Guardar reserva"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </PageContainer>
  );
}

export default ReservationCreatePage;
