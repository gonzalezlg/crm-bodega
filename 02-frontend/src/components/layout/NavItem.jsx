import { NavLink } from 'react-router-dom';

function NavItem({ item, onNavigate }) {
  const Icon = item.icon;

  if (!item.enabled) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        className="flex w-full cursor-not-allowed items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-zinc-400"
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span>{item.label}</span>
      </button>
    );
  }

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-amber-100 text-zinc-950'
            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
        ].join(' ')
      }
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{item.label}</span>
    </NavLink>
  );
}

export default NavItem;
