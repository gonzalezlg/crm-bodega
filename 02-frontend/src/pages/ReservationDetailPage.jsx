import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmStatusDialog from '../components/common/ConfirmStatusDialog';
import FeedbackMessages from '../components/common/FeedbackMessages';
import ReservationActions from '../components/reservations/ReservationActions';
import ReservationDetail from '../components/reservations/ReservationDetail';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Loading } from '../components/ui/Loading';
import {
  attendReservation,
  cancelReservation,
  confirmReservation,
  getReservationById,
  markReservationAsNoShow,
} from '../services/reservationsService';

const actionConfig = {
  confirm: {
    title: 'Confirmar reserva',
    message: '¿Confirmás esta reserva?',
    confirmLabel: 'Confirmar',
    confirmVariant: 'success',
    successMessage: 'Reserva confirmada correctamente.',
    execute: confirmReservation,
  },
  cancel: {
    title: 'Cancelar reserva',
    message: '¿Querés cancelar esta reserva?',
    confirmLabel: 'Cancelar reserva',
    confirmVariant: 'danger',
    successMessage: 'Reserva cancelada correctamente.',
    execute: cancelReservation,
  },
  attend: {
    title: 'Registrar asistencia',
    message: '¿Querés marcar esta reserva como asistida?',
    confirmLabel: 'Registrar asistencia',
    confirmVariant: 'success',
    successMessage: 'Asistencia registrada correctamente.',
    execute: attendReservation,
  },
  noShow: {
    title: 'Marcar ausencia',
    message: '¿Querés marcar esta reserva como ausente?',
    confirmLabel: 'Marcar ausencia',
    confirmVariant: 'danger',
    successMessage: 'Ausencia registrada correctamente.',
    execute: markReservationAsNoShow,
  },
};

function getErrorMessages(error) {
  return Array.isArray(error.messages) ? error.messages : [error.message];
}

function canEditReservation(reservation) {
  return reservation?.status === 'PENDING' || reservation?.status === 'CONFIRMED';
}

function ReservationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [queryErrors, setQueryErrors] = useState([]);
  const [statusErrors, setStatusErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  const loadReservation = useCallback(async () => {
    setIsLoading(true);
    setQueryErrors([]);

    try {
      const data = await getReservationById(id);
      setReservation(data?.id ? data : null);
    } catch (error) {
      setReservation(null);
      setQueryErrors(getErrorMessages(error));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReservation();
  }, [loadReservation]);

  const pendingActionConfig = useMemo(
    () => (pendingAction ? actionConfig[pendingAction] : null),
    [pendingAction],
  );

  function openAction(action) {
    setPendingAction(action);
    setStatusErrors([]);
    setSuccessMessage('');
  }

  async function handleConfirmAction() {
    if (!pendingActionConfig || isActionLoading) {
      return;
    }

    setIsActionLoading(true);
    setStatusErrors([]);
    setSuccessMessage('');

    try {
      await pendingActionConfig.execute(id);
      const data = await getReservationById(id);
      setReservation(data?.id ? data : null);
      setPendingAction(null);
      setSuccessMessage(pendingActionConfig.successMessage);
    } catch (error) {
      setPendingAction(null);
      setStatusErrors(getErrorMessages(error));
    } finally {
      setIsActionLoading(false);
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <Loading label="Cargando reserva..." />
      </PageContainer>
    );
  }

  if (queryErrors.length > 0 || !reservation) {
    return (
      <PageContainer>
        <EmptyState
          title="Reserva no encontrada"
          description={
            queryErrors[0] || 'No se pudo encontrar la reserva solicitada.'
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Detalle de reserva"
        subtitle="Consulta los datos y gestiona el estado de la reserva."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/reservas')}>
              Volver
            </Button>
            {canEditReservation(reservation) && (
              <Button
                onClick={() => navigate(`/reservas/${id}/editar`)}
                disabled={isActionLoading}
              >
                Editar
              </Button>
            )}
          </>
        }
      />

      <FeedbackMessages
        statusErrors={statusErrors}
        successMessage={successMessage}
      />

      <ReservationDetail reservation={reservation} />

      <ReservationActions
        reservation={reservation}
        isLoading={isActionLoading}
        onConfirm={() => openAction('confirm')}
        onCancel={() => openAction('cancel')}
        onAttend={() => openAction('attend')}
        onNoShow={() => openAction('noShow')}
      />

      {pendingActionConfig && (
        <ConfirmStatusDialog
          title={pendingActionConfig.title}
          message={pendingActionConfig.message}
          confirmLabel={pendingActionConfig.confirmLabel}
          confirmVariant={pendingActionConfig.confirmVariant}
          isLoading={isActionLoading}
          onCancel={() => setPendingAction(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </PageContainer>
  );
}

export default ReservationDetailPage;
