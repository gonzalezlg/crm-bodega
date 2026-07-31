export function formatReservationDate(date) {
  const rawDate = typeof date === 'string' ? date.slice(0, 10) : '';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return '-';
  }

  const [year, month, day] = rawDate.split('-');

  return `${day}/${month}/${year}`;
}

export function formatReservationDateTime(date) {
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

export function getReservationExperienceName(reservation) {
  return reservation?.experience?.name ?? '-';
}

export function canEditReservation(reservation) {
  return reservation?.status === 'PENDING' || reservation?.status === 'CONFIRMED';
}

export function getReservationAccessibleLabel(reservation) {
  const experienceName = getReservationExperienceName(reservation);
  const date = formatReservationDate(reservation?.date);

  return `${experienceName} del ${date}`;
}
