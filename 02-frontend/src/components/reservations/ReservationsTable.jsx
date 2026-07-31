import ReservationStatusBadge from './ReservationStatusBadge';
import ReservationQuickActions from './ReservationQuickActions';
import {
  canEditReservation,
  formatReservationDate,
  getReservationAccessibleLabel,
  getReservationExperienceName,
} from './reservationUtils';
import { Button } from '../ui/Button';

function ReservationsTable({
  reservations = [],
  controlsDisabled = false,
  quickActionsDisabled = false,
  onView,
  onEdit,
  onQuickAction,
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              {[
                'Fecha',
                'Hora',
                'Experiencia',
                'Personas',
                'Estado',
                'Acciones',
              ].map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500"
                  >
                    {column}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="hover:bg-zinc-50">
                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-zinc-950">
                  {formatReservationDate(reservation.date)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-700">
                  {reservation.startTime}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-700">
                  {getReservationExperienceName(reservation)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-700">
                  {reservation.peopleCount}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm">
                  <ReservationStatusBadge status={reservation.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="min-h-9 px-3 py-1.5"
                      onClick={() => onView?.(reservation)}
                      disabled={controlsDisabled}
                      aria-label={`Ver reserva de ${getReservationAccessibleLabel(
                        reservation,
                      )}`}
                    >
                      Ver
                    </Button>
                    {canEditReservation(reservation) && (
                      <Button
                        variant="secondary"
                        className="min-h-9 px-3 py-1.5"
                        onClick={() => onEdit?.(reservation)}
                        disabled={controlsDisabled}
                        aria-label={`Editar reserva de ${getReservationAccessibleLabel(
                          reservation,
                        )}`}
                      >
                        Editar
                      </Button>
                    )}
                    <ReservationQuickActions
                      reservation={reservation}
                      disabled={quickActionsDisabled}
                      ariaLabel={`Abrir acciones para la reserva de ${getReservationAccessibleLabel(
                        reservation,
                      )}`}
                      onAction={onQuickAction}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReservationsTable;
