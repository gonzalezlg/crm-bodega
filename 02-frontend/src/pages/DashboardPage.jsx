import { ClipboardList, Package, ShoppingCart, Users } from 'lucide-react';
import DashboardCard from '../components/dashboard/DashboardCard';
import { useAuth } from '../hooks/useAuth';

const dashboardCards = [
  {
    label: 'Clientes',
    value: 0,
    icon: Users,
  },
  {
    label: 'Productos',
    value: 0,
    icon: Package,
  },
  {
    label: 'Ventas',
    value: 0,
    icon: ShoppingCart,
  },
  {
    label: 'Pedidos pendientes',
    value: 0,
    icon: ClipboardList,
  },
];

function DashboardPage() {
  const { user } = useAuth();
  const userName = user?.nombre || user?.name || 'Usuario';

  return (
    <section className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-zinc-950">Dashboard</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Bienvenido, {userName}. Este es el resumen inicial del CRM.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => (
          <DashboardCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
          />
        ))}
      </div>
    </section>
  );
}

export default DashboardPage;
