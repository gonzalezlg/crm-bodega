import ReservationStatusBadge from './ReservationStatusBadge';

function formatDate(date) {
  return typeof date === 'string' ? date.slice(0, 10) : '-';
}

function formatDateTime(date) {
  if (!date) {
    return '-';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsedDate);
}

function getExperienceName(reservation) {
  return reservation.experience?.name ?? '-';
}

function ReservationDetail({ reservation }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:p-6">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <DetailItem label="Experiencia" value={getExperienceName(reservation)} />
        <DetailItem label="Fecha" value={formatDate(reservation.date)} />
        <DetailItem label="Horario" value={reservation.startTime || '-'} />
        <DetailItem
          label="Cantidad de personas"
          value={reservation.peopleCount ?? '-'}
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Estado
          </p>
          <div className="mt-1">
            <ReservationStatusBadge status={reservation.status} />
          </div>
        </div>
        <DetailItem
          label="Fecha de creacion"
          value={formatDateTime(reservation.createdAt)}
        />
        <DetailItem
          label="Ultima actualizacion"
          value={formatDateTime(reservation.updatedAt)}
        />
        <div className="md:col-span-2 lg:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Notas
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-800">
            {reservation.notes?.trim() || 'Sin notas.'}
          </p>
        </div>
      </div>
    </section>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-zinc-900">{value || '-'}</p>
    </div>
  );
}

export default ReservationDetail;
