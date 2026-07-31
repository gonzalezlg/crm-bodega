import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FeedbackMessages from '../components/common/FeedbackMessages';
import ReservationsTable from '../components/reservations/ReservationsTable';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Loading } from '../components/ui/Loading';
import { getReservations } from '../services/reservationsService';

function getErrorMessages(error) {
  return Array.isArray(error.messages) ? error.messages : [error.message];
}

function ReservationsPage() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [queryErrors, setQueryErrors] = useState([]);

  const loadReservations = useCallback(async () => {
    setIsLoading(true);
    setQueryErrors([]);

    try {
      const data = await getReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      setReservations([]);
      setQueryErrors(getErrorMessages(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

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

      <FeedbackMessages queryErrors={queryErrors} />

      {isLoading ? (
        <Loading label="Cargando reservas..." />
      ) : reservations.length === 0 ? (
        <EmptyState
          title="No hay reservas para mostrar."
          description="Cuando existan reservas registradas, aparecerán en este listado."
        />
      ) : (
        <ReservationsTable
          reservations={reservations}
          onView={(reservation) => navigate(`/reservas/${reservation.id}`)}
          onEdit={(reservation) => navigate(`/reservas/${reservation.id}/editar`)}
        />
      )}
    </PageContainer>
  );
}

export default ReservationsPage;
