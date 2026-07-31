import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';

const MENU_WIDTH = 192;
const VIEWPORT_MARGIN = 8;
const MENU_GAP = 8;
const MENU_VERTICAL_PADDING = 8;
const MENU_ITEM_HEIGHT = 36;

const actionsByStatus = {
  PENDING: [
    {
      action: 'confirm',
      label: 'Confirmar',
    },
    {
      action: 'cancel',
      label: 'Cancelar',
    },
  ],
  CONFIRMED: [
    {
      action: 'attend',
      label: 'Registrar asistencia',
    },
    {
      action: 'noShow',
      label: 'Marcar ausencia',
    },
    {
      action: 'cancel',
      label: 'Cancelar',
    },
  ],
};

function ReservationQuickActions({ reservation, disabled = false, onAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const actions = actionsByStatus[reservation?.status] ?? [];

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const estimatedMenuHeight =
      actions.length * MENU_ITEM_HEIGHT + MENU_VERTICAL_PADDING;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const shouldOpenUp =
      spaceBelow < estimatedMenuHeight + MENU_GAP &&
      spaceAbove > spaceBelow;
    const preferredLeft = triggerRect.right - MENU_WIDTH;
    const maxLeft = window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN;
    const left = Math.min(
      Math.max(preferredLeft, VIEWPORT_MARGIN),
      Math.max(maxLeft, VIEWPORT_MARGIN),
    );
    const top = shouldOpenUp
      ? Math.max(
          triggerRect.top - estimatedMenuHeight - MENU_GAP,
          VIEWPORT_MARGIN,
        )
      : Math.min(
          triggerRect.bottom + MENU_GAP,
          window.innerHeight - estimatedMenuHeight - VIEWPORT_MARGIN,
        );

    setMenuPosition({
      left,
      top: Math.max(top, VIEWPORT_MARGIN),
    });
  }, [actions.length]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    updateMenuPosition();

    function handlePointerDown(event) {
      const target = event.target;

      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [isOpen, updateMenuPosition]);

  if (actions.length === 0) {
    return null;
  }

  function toggleMenu() {
    if (disabled) {
      return;
    }

    setIsOpen((currentValue) => !currentValue);
  }

  function handleAction(action) {
    setIsOpen(false);
    onAction?.(action, reservation);
  }

  return (
    <div ref={triggerRef} className="inline-flex">
      <Button
        variant="secondary"
        className="min-h-9 px-3 py-1.5"
        onClick={toggleMenu}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        Acciones {isOpen ? '▲' : '▼'}
      </Button>

      {isOpen &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-50 w-48 overflow-hidden rounded-md border border-zinc-200 bg-white py-1 shadow-lg"
            style={{
              left: `${menuPosition.left}px`,
              top: `${menuPosition.top}px`,
            }}
          >
            {actions.map((item) => (
              <button
                key={item.action}
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-50"
                onClick={() => handleAction(item.action)}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

export default ReservationQuickActions;
