function ExperiencesTable({
  experiences = [],
  isLoading,
  onEdit,
  onChangeStatus,
  onManageTimeSlots,
}) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
        Cargando experiencias...
      </div>
    );
  }

  if (experiences.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-zinc-800">
          No hay experiencias para mostrar.
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
              {['Nombre', 'Duracion', 'Estado', 'Acciones'].map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {experiences.map((experience) => (
              <tr key={experience.id} className="hover:bg-zinc-50">
                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-zinc-950">
                  {experience.name}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-700">
                  {experience.durationMinutes} min
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      experience.active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {experience.active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(experience)}
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onManageTimeSlots(experience)}
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                    >
                      Horarios
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeStatus(experience)}
                      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                        experience.active
                          ? 'border-red-200 text-red-700 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {experience.active ? 'Desactivar' : 'Activar'}
                    </button>
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

export default ExperiencesTable;
