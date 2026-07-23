import { Home, Package, ShoppingCart, UserCog, Users } from 'lucide-react';

export const navigationItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: Home,
    enabled: true,
  },
  {
    label: 'Clientes',
    path: '/clientes',
    icon: Users,
    enabled: true,
  },
  {
    label: 'Productos',
    path: '/productos',
    icon: Package,
    enabled: false,
  },
  {
    label: 'Ventas',
    path: '/ventas',
    icon: ShoppingCart,
    enabled: false,
  },
  {
    label: 'Usuarios',
    path: '/usuarios',
    icon: UserCog,
    enabled: false,
  },
];
