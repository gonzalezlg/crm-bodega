import { Button } from '../ui/Button';

function ReservationActions({
  reservation,
  isLoading = false,
  onConfirm,
  onCancel,
  onAttend,
  onNoShow,
}) {
  if (!reservation) {
    return null;
  }

  if (reservation.status === 'PENDING') {
    return (
      <ActionsWrapper>
        <Button onClick={onConfirm} disabled={isLoading}>
          Confirmar
        </Button>
        <Button variant="danger" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
      </ActionsWrapper>
    );
  }

  if (reservation.status === 'CONFIRMED') {
    return (
      <ActionsWrapper>
        <Button onClick={onAttend} disabled={isLoading}>
          Registrar asistencia
        </Button>
        <Button variant="secondary" onClick={onNoShow} disabled={isLoading}>
          Marcar ausencia
        </Button>
        <Button variant="danger" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
      </ActionsWrapper>
    );
  }

  return null;
}

function ActionsWrapper({ children }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {children}
      </div>
    </section>
  );
}

export default ReservationActions;
