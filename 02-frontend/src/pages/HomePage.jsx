import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 text-zinc-950">
      <section className="mx-auto max-w-2xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">Inicio</h1>
            <p className="mt-1 text-sm text-zinc-600">Sesión activa</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
          >
            Logout
          </button>
        </div>

        <dl className="mt-6 space-y-4">
          <div>
            <dt className="text-sm font-medium text-zinc-600">Nombre</dt>
            <dd className="mt-1 text-lg">{user?.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-600">Email</dt>
            <dd className="mt-1 text-lg">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-600">Rol</dt>
            <dd className="mt-1 text-lg">{user?.rol}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

export default HomePage;
