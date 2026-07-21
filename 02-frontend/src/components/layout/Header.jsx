import { Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

function getRoleLabel(role) {
  if (!role) {
    return 'Sin rol';
  }

  if (typeof role === 'string') {
    return role;
  }

  return role.nombre || role.name || 'Sin rol';
}

function Header({ pageTitle, onMenuClick }) {
  const { user } = useAuth();
  const userName = user?.nombre || user?.name || user?.email || 'Usuario';
  const roleLabel = getRoleLabel(user?.rol);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <h1 className="text-lg font-semibold text-zinc-950">{pageTitle}</h1>
      </div>

      <div className="min-w-0 text-right">
        <p className="truncate text-sm font-medium text-zinc-950">{userName}</p>
        <p className="truncate text-xs text-zinc-500">{roleLabel}</p>
      </div>
    </header>
  );
}

export default Header;
