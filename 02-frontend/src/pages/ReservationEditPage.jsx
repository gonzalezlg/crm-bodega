import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReservationForm from '../components/reservations/ReservationForm';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Loading } from '../components/ui/Loading';
import {
  getReservationById,
  updateReservation,
} from '../services/reservationsService';

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : 'No se pudo completar la operacion.';
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
  const [queryError, setQueryError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadReservation() {
      setIsLoading(true);
      setQueryError('');
      setSubmitError('');

      try {
        const data = await getReservationById(id);

        if (!isMounted) {
          return;
        }

        if (!data?.id) {
          setReservation(null);
          setInitialValues(null);
          setQueryError('Reserva no encontrada.');
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
        setQueryError(getErrorMessage(error));
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
    setSubmitError('');

    try {
      await updateReservation(id, data);
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

  if (isLoading) {
    return (
      <PageContainer>
        <Loading label="Cargando reserva..." />
      </PageContainer>
    );
  }

  if (queryError || !reservation || !initialValues) {
    return (
      <PageContainer>
        <EmptyState
          title="Reserva no encontrada"
          description={
            queryError || 'No se pudo encontrar la reserva solicitada.'
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Editar reserva"
        subtitle="Actualiza los datos operativos de la reserva."
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

export default ReservationEditPage;
