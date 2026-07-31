import ReservationStatusBadge from './ReservationStatusBadge';
import ReservationQuickActions from './ReservationQuickActions';
import { Button } from '../ui/Button';

function formatDate(date) {
  return typeof date === 'string' ? date.slice(0, 10) : '-';
}

function getExperienceName(reservation) {
  return reservation.experience?.name ?? '-';
}

function canEditReservation(reservation) {
  return reservation.status === 'PENDING' || reservation.status === 'CONFIRMED';
}

function ReservationsTable({
  reservations = [],
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
                  {formatDate(reservation.date)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-700">
                  {reservation.startTime}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-700">
                  {getExperienceName(reservation)}
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
                    >
                      Ver
                    </Button>
                    {canEditReservation(reservation) && (
                      <Button
                        variant="secondary"
                        className="min-h-9 px-3 py-1.5"
                        onClick={() => onEdit?.(reservation)}
                      >
                        Editar
                      </Button>
                    )}
                    <ReservationQuickActions
                      reservation={reservation}
                      disabled={quickActionsDisabled}
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
