import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FeedbackMessages from '../components/common/FeedbackMessages';
import ReservationForm from '../components/reservations/ReservationForm';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Loading } from '../components/ui/Loading';
import {
  getReservationById,
  updateReservation,
} from '../services/reservationsService';

function getErrorMessages(error) {
  return Array.isArray(error.messages) ? error.messages : [error.message];
}

function buildInitialValues(reservation) {
  return {
    experienceId: reservation?.experienceId ?? '',
    date:
      typeof reservation?.date === 'string' ? reservation.date.slice(0, 10) : '',
    peopleCount: reservation?.peopleCount ?? '',
    startTime: reservation?.startTime ?? '',
    notes: reservation?.notes ?? '',
  };
}

function ReservationEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [queryErrors, setQueryErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadReservation() {
      setIsLoading(true);
      setQueryErrors([]);
      setSubmitErrors([]);

      try {
        const data = await getReservationById(id);

        if (!isMounted) {
          return;
        }

        if (!data?.id) {
          setReservation(null);
          setInitialValues(null);
          setQueryErrors(['Reserva no encontrada.']);
          return;
        }

        setReservation(data);
        setInitialValues(buildInitialValues(data));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setReservation(null);
        setInitialValues(null);
        setQueryErrors(getErrorMessages(error));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReservation();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleSubmit(data) {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitErrors([]);

    try {
      await updateReservation(id, data);
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

  if (isLoading) {
    return (
      <PageContainer>
        <Loading label="Cargando reserva..." />
      </PageContainer>
    );
  }

  if (queryErrors.length > 0 || !reservation || !initialValues) {
    return (
      <PageContainer>
        <EmptyState
          title="Reserva no encontrada"
          description={
            queryErrors[0] || 'No se pudo encontrar la reserva solicitada.'
          }
          action={
            <Button variant="secondary" onClick={() => navigate('/reservas')}>
              Volver a reservas
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Editar reserva"
        subtitle="Actualizá los datos operativos de la reserva."
      />

      <FeedbackMessages saveErrors={submitErrors} />

      <ReservationForm
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        primaryLabel="Guardar cambios"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </PageContainer>
  );
}

export default ReservationEditPage;
