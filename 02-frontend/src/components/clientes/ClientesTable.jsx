function ClientesTable({
  clientes = [],
  isLoading,
  onEdit,
  onDeactivate,
  showInactive,
}) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
        Cargando clientes...
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-zinc-800">
          No hay clientes {showInactive ? 'inactivos' : 'activos'} para mostrar.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              {['Cliente', 'Teléfono', 'Email', 'Ubicación', 'Estado', 'Acciones'].map(
                (column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500"
                  >
                    {column}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-zinc-50">
                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-zinc-950">
                  {cliente.apellido}, {cliente.nombre}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-700">
                  {cliente.telefono}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-700">
                  {cliente.email}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-700">
                  {cliente.ubicacion || '-'}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      cliente.activo
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {cliente.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(cliente)}
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                    >
                      Editar
                    </button>
                    {cliente.activo && (
                      <button
                        type="button"
                        onClick={() => onDeactivate(cliente)}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
                      >
                        Desactivar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClientesTable;
