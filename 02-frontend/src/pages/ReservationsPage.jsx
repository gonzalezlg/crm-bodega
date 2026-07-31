import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmStatusDialog from '../components/common/ConfirmStatusDialog';
import FeedbackMessages from '../components/common/FeedbackMessages';
import ReservationsTable from '../components/reservations/ReservationsTable';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { PageToolbar } from '../components/layout/PageToolbar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Loading } from '../components/ui/Loading';
import { obtenerExperiences } from '../services/experiencesService';
import {
  attendReservation,
  cancelReservation,
  confirmReservation,
  getReservations,
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

function ReservationsPage() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [queryErrors, setQueryErrors] = useState([]);
  const [date, setDate] = useState('');
  const [experienceId, setExperienceId] = useState('');
  const [status, setStatus] = useState('');
  const [experiences, setExperiences] = useState([]);
  const [experiencesLoading, setExperiencesLoading] = useState(false);
  const [hasAnyReservations, setHasAnyReservations] = useState(false);
  const [statusErrors, setStatusErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const hasActiveFilters = Boolean(date || experienceId || status);
  const pendingActionConfig = useMemo(
    () => (pendingAction ? actionConfig[pendingAction] : null),
    [pendingAction],
  );

  const loadReservations = useCallback(async () => {
    setIsLoading(true);
    setQueryErrors([]);

    try {
      const data = await getReservations({
        date,
        experienceId,
        status,
      });
      setReservations(Array.isArray(data) ? data : []);

      if (!hasActiveFilters) {
        setHasAnyReservations(Array.isArray(data) && data.length > 0);
      }
    } catch (error) {
      setReservations([]);
      setQueryErrors(getErrorMessages(error));
    } finally {
      setIsLoading(false);
    }
  }, [date, experienceId, hasActiveFilters, status]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  useEffect(() => {
    let isMounted = true;

    async function loadExperiences() {
      setExperiencesLoading(true);

      try {
        const data = await obtenerExperiences();

        if (!isMounted) {
          return;
        }

        setExperiences(Array.isArray(data) ? data : []);
      } catch {
        if (!isMounted) {
          return;
        }

        setExperiences([]);
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

  function clearFilters() {
    setDate('');
    setExperienceId('');
    setStatus('');
  }

  function handleQuickAction(action, reservation) {
    setSelectedReservation(reservation);
    setPendingAction(action);
    setStatusErrors([]);
    setSuccessMessage('');
  }

  async function handleConfirmAction() {
    if (!pendingActionConfig || !selectedReservation || isActionLoading) {
      return;
    }

    setIsActionLoading(true);
    setStatusErrors([]);
    setSuccessMessage('');

    try {
      await pendingActionConfig.execute(selectedReservation.id);
      setPendingAction(null);
      setSelectedReservation(null);
      await loadReservations();
      setSuccessMessage(pendingActionConfig.successMessage);
    } catch (error) {
      setPendingAction(null);
      setSelectedReservation(null);
      setStatusErrors(getErrorMessages(error));
    } finally {
      setIsActionLoading(false);
    }
  }

  function handleCancelAction() {
    if (isActionLoading) {
      return;
    }

    setPendingAction(null);
    setSelectedReservation(null);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Reservas"
        subtitle="Consulta las reservas registradas en la bodega."
        actions={
          <Button onClick={() => navigate('/reservas/nueva')}>
            Nueva reserva
          </Button>
        }
      />

      <FeedbackMessages
        queryErrors={queryErrors}
        statusErrors={statusErrors}
        successMessage={successMessage}
      />

      <PageToolbar>
        <div className="w-full md:w-48">
          <label className="sr-only" htmlFor="reservations-date">
            Filtrar por fecha
          </label>
          <input
            id="reservations-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            aria-label="Filtrar reservas por fecha"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          />
        </div>

        <div className="w-full md:flex-1">
          <label className="sr-only" htmlFor="reservations-experience">
            Filtrar por experiencia
          </label>
          <select
            id="reservations-experience"
            value={experienceId}
            onChange={(event) => setExperienceId(event.target.value)}
            disabled={experiencesLoading}
            aria-label="Filtrar reservas por experiencia"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500"
          >
            <option value="">
              {experiencesLoading
                ? 'Cargando experiencias...'
                : 'Todas las experiencias'}
            </option>
            {experiences.map((experience) => (
              <option key={experience.id} value={experience.id}>
                {experience.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="sr-only" htmlFor="reservations-status">
            Filtrar por estado
          </label>
          <select
            id="reservations-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filtrar reservas por estado"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          >
            <option value="">Todos</option>
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmada</option>
            <option value="ATTENDED">Asistida</option>
            <option value="NO_SHOW">No asistió</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>

        <Button
          variant="secondary"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="w-full md:w-auto"
        >
          Limpiar filtros
        </Button>
      </PageToolbar>

      {isLoading ? (
        <Loading label="Cargando reservas..." />
      ) : reservations.length === 0 ? (
        <EmptyState
          title={
            hasActiveFilters && hasAnyReservations
              ? 'No se encontraron reservas.'
              : 'No hay reservas registradas.'
          }
          description={
            hasActiveFilters && hasAnyReservations
              ? 'Probá modificar o limpiar los filtros.'
              : 'Las reservas creadas aparecerán en este listado.'
          }
        />
      ) : (
        <ReservationsTable
          reservations={reservations}
          quickActionsDisabled={isActionLoading}
          onView={(reservation) => navigate(`/reservas/${reservation.id}`)}
          onEdit={(reservation) => navigate(`/reservas/${reservation.id}/editar`)}
          onQuickAction={handleQuickAction}
        />
      )}

      {pendingActionConfig && (
        <ConfirmStatusDialog
          title={pendingActionConfig.title}
          message={pendingActionConfig.message}
          confirmLabel={pendingActionConfig.confirmLabel}
          confirmVariant={pendingActionConfig.confirmVariant}
          isLoading={isActionLoading}
          onCancel={handleCancelAction}
          onConfirm={handleConfirmAction}
        />
      )}
    </PageContainer>
  );
}

export default ReservationsPage;
