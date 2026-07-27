import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  DollarSign,
  FolderTree,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
  Warehouse,
} from 'lucide-react';

const navigationGroups = [
  {
    id: 'dashboard',
    title: null,
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: Home,
        enabled: true,
      },
    ],
  },
  {
    id: 'operacion',
    title: 'Operación',
    items: [
      {
        label: 'Reservas',
        path: '/reservas',
        icon: CalendarDays,
        enabled: false,
      },
      {
        label: 'Ventas',
        path: '/ventas',
        icon: ShoppingCart,
        enabled: false,
      },
      {
        label: 'Compras',
        path: '/compras',
        icon: ClipboardList,
        enabled: false,
      },
      {
        label: 'Gastos',
        path: '/gastos',
        icon: DollarSign,
        enabled: false,
      },
    ],
  },
  {
    id: 'inventario',
    title: 'Inventario',
    items: [
      {
        label: 'Categorías',
        path: '/categorias',
        icon: FolderTree,
        enabled: true,
      },
      {
        label: 'Productos',
        path: '/productos',
        icon: Package,
        enabled: true,
      },
      {
        label: 'Stock',
        path: '/stock',
        icon: Warehouse,
        enabled: false,
      },
    ],
  },
  {
    id: 'gestion',
    title: 'Gestión',
    items: [
      {
        label: 'Clientes',
        path: '/clientes',
        icon: Users,
        enabled: true,
      },
      {
        label: 'Proveedores',
        path: '/proveedores',
        icon: Truck,
        enabled: false,
      },
    ],
  },
  {
    id: 'analisis',
    title: 'Análisis',
    items: [
      {
        label: 'Reportes',
        path: '/reportes',
        icon: BarChart3,
        enabled: false,
      },
    ],
  },
  {
    id: 'administracion',
    title: 'Administración',
    items: [
      {
        label: 'Usuarios',
        path: '/usuarios',
        icon: UserCog,
        enabled: false,
      },
      {
        label: 'Configuración',
        path: '/configuracion',
        icon: Settings,
        enabled: false,
      },
    ],
  },
];

export function getNavigationGroups() {
  return navigationGroups;
}

export function getNavigationItems() {
  return navigationGroups.flatMap((group) => group.items);
}
