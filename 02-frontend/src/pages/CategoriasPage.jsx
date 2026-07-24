import { useCallback, useEffect, useState } from 'react';
import CategoriaForm from '../components/categorias/CategoriaForm';
import CategoriasTable from '../components/categorias/CategoriasTable';
import {
  actualizarCategoria,
  cambiarEstadoCategoria,
  crearCategoria,
  obtenerCategorias,
} from '../services/categoriasService';

function getErrorMessages(error) {
  return Array.isArray(error.messages) ? error.messages : [error.message];
}

function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activo, setActivo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categoriaToChangeStatus, setCategoriaToChangeStatus] = useState(null);
  const [queryErrors, setQueryErrors] = useState([]);
  const [saveErrors, setSaveErrors] = useState([]);
  const [statusErrors, setStatusErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  const loadCategorias = useCallback(async () => {
    setIsLoading(true);
    setQueryErrors([]);

    try {
      const data = await obtenerCategorias({
        search: debouncedSearch,
        activo,
      });
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error) {
      setCategorias([]);
      setQueryErrors(getErrorMessages(error));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, activo]);

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  function openCreateForm() {
    setEditingCategoria(null);
    setShowForm(true);
    clearMessages();
  }

  function openEditForm(categoria) {
    setEditingCategoria(categoria);
    setShowForm(true);
    clearMessages();
  }

  function closeForm() {
    setShowForm(false);
    setEditingCategoria(null);
    setSaveErrors([]);
  }

  function clearMessages() {
    setSuccessMessage('');
    setSaveErrors([]);
    setStatusErrors([]);
  }

  async function handleSave(datos) {
    setIsSaving(true);
    setSaveErrors([]);
    setSuccessMessage('');

    try {
      await (editingCategoria
        ? actualizarCategoria(editingCategoria.id, datos)
        : crearCategoria(datos));

      setSuccessMessage(
        editingCategoria
          ? 'Categoria actualizada correctamente.'
          : 'Categoria creada correctamente.',
      );
      closeForm();
      await loadCategorias();
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (error) {
      setSaveErrors(getErrorMessages(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangeStatus() {
    if (!categoriaToChangeStatus) {
      return;
    }

    const nextActivo = !categoriaToChangeStatus.activo;

    setIsChangingStatus(true);
    setStatusErrors([]);
    setSuccessMessage('');

    try {
      await cambiarEstadoCategoria(categoriaToChangeStatus.id, nextActivo);
      setCategoriaToChangeStatus(null);
      setSuccessMessage(
        nextActivo
          ? 'Categoria activada correctamente.'
          : 'Categoria desactivada correctamente.',
      );
      await loadCategorias();
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (error) {
      setStatusErrors(getErrorMessages(error));
    } finally {
      setIsChangingStatus(false);
    }
  }

  function handleStatusFilterChange(event) {
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
          <h2 className="text-2xl font-semibold text-zinc-950">
            Categorias
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Administra las categorias del catalogo de la bodega.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Nueva categoria
        </button>
      </div>

      <div className="mb-4 grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px]">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
        />
        <select
          value={activo ? 'true' : 'false'}
          onChange={handleStatusFilterChange}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
        >
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>
      </div>

      <Messages
        queryErrors={queryErrors}
        saveErrors={saveErrors}
        statusErrors={statusErrors}
        successMessage={successMessage}
      />

      {showForm && (
        <div className="mb-4">
          <CategoriaForm
            categoria={editingCategoria}
            isSaving={isSaving}
            onCancel={closeForm}
            onSubmit={handleSave}
          />
        </div>
      )}

      <CategoriasTable
        categorias={categorias}
        isLoading={isLoading}
        showInactive={!activo}
        onEdit={openEditForm}
        onChangeStatus={setCategoriaToChangeStatus}
      />

      {categoriaToChangeStatus && (
        <ConfirmStatusDialog
          categoria={categoriaToChangeStatus}
          isChangingStatus={isChangingStatus}
          onCancel={() => {
            setCategoriaToChangeStatus(null);
            setStatusErrors([]);
          }}
          onConfirm={handleChangeStatus}
        />
      )}
    </section>
  );
}

function Messages({
  queryErrors,
  saveErrors,
  statusErrors,
  successMessage,
}) {
  const errors = [...queryErrors, ...saveErrors, ...statusErrors].filter(
    Boolean,
  );

  return (
    <div className="mb-4 space-y-3">
      {successMessage && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
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

function ConfirmStatusDialog({
  categoria,
  isChangingStatus,
  onCancel,
  onConfirm,
}) {
  const nextAction = categoria.activo ? 'desactivar' : 'activar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-zinc-950">
          {categoria.activo ? 'Desactivar' : 'Activar'} categoria
        </h3>
        <p className="mt-2 text-sm text-zinc-600">
          Vas a {nextAction} la categoria {categoria.nombre}.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isChangingStatus}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isChangingStatus}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${
              categoria.activo
                ? 'bg-red-700 hover:bg-red-800'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            {isChangingStatus
              ? 'Guardando...'
              : categoria.activo
                ? 'Desactivar'
                : 'Activar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoriasPage;
