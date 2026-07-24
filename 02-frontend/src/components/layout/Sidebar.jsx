import { LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNavigationGroups } from '../../config/navigation';
import { useAuth } from '../../hooks/useAuth';
import NavItem from './NavItem';

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const navigationGroups = getNavigationGroups();

  function handleLogout() {
    logout();
    onClose();
    navigate('/login', { replace: true });
  }

  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 md:static md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}
      aria-label="Navegación principal"
    >
      <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-5">
        <div>
          <p className="text-base font-semibold text-zinc-950">CRM Bodega</p>
          <p className="text-xs text-zinc-500">Gestión interna</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 md:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {navigationGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            {group.title && (
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {group.title}
              </p>
            )}

            {group.items.map((item) => (
              <NavItem key={item.path} item={item} onNavigate={onClose} />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-zinc-200 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
