import { Badge } from '../ui/Badge';

const statusConfig = {
  PENDING: {
    label: 'Pendiente',
    variant: 'warning',
  },
  CONFIRMED: {
    label: 'Confirmada',
    variant: 'success',
  },
  ATTENDED: {
    label: 'Asistió',
    variant: 'neutral',
  },
  NO_SHOW: {
    label: 'No asistió',
    variant: 'danger',
  },
  CANCELLED: {
    label: 'Cancelada',
    variant: 'neutral',
  },
};

function ReservationStatusBadge({ status }) {
  const config = statusConfig[status] ?? {
    label: status,
    variant: 'neutral',
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default ReservationStatusBadge;
