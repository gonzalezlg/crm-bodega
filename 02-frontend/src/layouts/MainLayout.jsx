import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { navigationItems } from '../config/navigation';

function getPageTitle(pathname) {
  const activeItem = navigationItems.find(
    (item) => item.enabled && item.path === pathname,
  );

  return activeItem?.label || 'Inicio';
}

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950 md:flex">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menu"
          onClick={closeSidebar}
          className="fixed inset-0 z-30 bg-zinc-950/30 md:hidden"
        />
      )}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header
          pageTitle={pageTitle}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
