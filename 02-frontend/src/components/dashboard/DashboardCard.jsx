function DashboardCard({ label, value, icon: Icon }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-zinc-950">{value}</p>
        </div>

        {Icon && (
          <div className="rounded-md bg-amber-100 p-2 text-amber-700">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </div>
    </article>
  );
}

export default DashboardCard;
