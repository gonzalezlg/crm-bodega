import { useCallback, useEffect, useState } from 'react';
import ClienteForm from '../components/clientes/ClienteForm';
import ClientesTable from '../components/clientes/ClientesTable';
import {
  actualizarCliente,
  crearCliente,
  desactivarCliente,
  obtenerClientes,
} from '../services/clientesService';

function getPayloadAdvertencias(response) {
  return response?.advertencias ?? [];
}

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activo, setActivo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [clienteToDeactivate, setClienteToDeactivate] = useState(null);
  const [queryError, setQueryError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [deactivateError, setDeactivateError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [advertencias, setAdvertencias] = useState([]);

  useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    setDebouncedSearch(search);
  }, 300);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [search]);

  const loadClientes = useCallback(async () => {
    setIsLoading(true);
    setQueryError('');

    try {
      const data = await obtenerClientes({
      search: debouncedSearch,
      activo,
});
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      setClientes([]);
      setQueryError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, activo]);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  function openCreateForm() {
    setEditingCliente(null);
    setShowForm(true);
    clearMessages();
  }

  function openEditForm(cliente) {
    setEditingCliente(cliente);
    setShowForm(true);
    clearMessages();
  }

  function closeForm() {
    setShowForm(false);
    setEditingCliente(null);
    setSaveError('');
  }

  function clearMessages() {
    setSuccessMessage('');
    setAdvertencias([]);
    setSaveError('');
    setDeactivateError('');
  }

  async function handleSave(datos) {
    setIsSaving(true);
    setSaveError('');
    setSuccessMessage('');
    setAdvertencias([]);

    try {
      const response = editingCliente
        ? await actualizarCliente(editingCliente.id, datos)
        : await crearCliente(datos);

      setAdvertencias(getPayloadAdvertencias(response));
      setSuccessMessage(
        editingCliente
          ? 'Cliente actualizado correctamente.'
          : 'Cliente creado correctamente.',
      );
      closeForm();
      await loadClientes();
      window.scrollTo({
      top: 0,
      behavior: 'smooth',
});
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!clienteToDeactivate) {
      return;
    }

    setIsDeactivating(true);
    setDeactivateError('');
    setSuccessMessage('');
    setAdvertencias([]);

    try {
      await desactivarCliente(clienteToDeactivate.id);
      setClienteToDeactivate(null);
      setSuccessMessage('Cliente desactivado correctamente.');
      await loadClientes();
      window.scrollTo({
      top: 0,
      behavior: 'smooth',
});
    } catch (error) {
      setDeactivateError(error.message);
    } finally {
      setIsDeactivating(false);
    }
  }

  function handleStatusChange(event) {
  const nextActivo = event.target.value === 'true';

    setActivo(nextActivo);
    setSearch('');
    setDebouncedSearch('');
    clearMessages();
  }

  return (
    <section className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-950">Clientes</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Administrá los clientes registrados en la bodega.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Nuevo cliente
        </button>
      </div>

      <div className="mb-4 grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px]">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, apellido, teléfono o email..."
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
        />
        <select
          value={activo ? 'true' : 'false'}
          onChange={handleStatusChange}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
        >
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      <Messages
        queryError={queryError}
        saveError={saveError}
        deactivateError={deactivateError}
        successMessage={successMessage}
        advertencias={advertencias}
      />

      {showForm && (
        <div className="mb-4">
          <ClienteForm
            cliente={editingCliente}
            isSaving={isSaving}
            onCancel={closeForm}
            onSubmit={handleSave}
          />
        </div>
      )}

      <ClientesTable
        clientes={clientes}
        isLoading={isLoading}
        showInactive={!activo}
        onEdit={openEditForm}
        onDeactivate={setClienteToDeactivate}
      />

      {clienteToDeactivate && (
        <ConfirmDeactivateDialog
          cliente={clienteToDeactivate}
          isDeactivating={isDeactivating}
          onCancel={() => {
            setClienteToDeactivate(null);
            setDeactivateError('');
          }}
          onConfirm={handleDeactivate}
          
        />
      )}
    </section>
  );
}

function Messages({
  queryError,
  saveError,
  deactivateError,
  successMessage,
  advertencias,
}) {
  const errors = [queryError, saveError, deactivateError].filter(Boolean);

  return (
    <div className="mb-4 space-y-3">
      {successMessage && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      {advertencias.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-medium">Advertencias</p>
          <ul className="mt-1 list-inside list-disc space-y-1">
            {advertencias.map((advertencia, index) => (
              <li key={`${advertencia.campo}-${index}`}>
                {advertencia.mensaje}
              </li>
            ))}
          </ul>
        </div>
      )}

      {errors.map((error, index) => (
        <div
          key={`${error}-${index}`}
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
      </div>
))}
    </div>
  );
}

function ConfirmDeactivateDialog({
  cliente,
  isDeactivating,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-zinc-950">
          ¿Desactivar a {cliente.apellido}, {cliente.nombre}?
        </h3>
        <p className="mt-2 text-sm text-zinc-600">
          El cliente dejará de aparecer en el listado de clientes activos.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeactivating}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeactivating}
            className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDeactivating ? 'Desactivando...' : 'Desactivar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientesPage;
