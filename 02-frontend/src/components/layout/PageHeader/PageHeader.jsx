export function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950">{title}</h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm text-zinc-600">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2 sm:justify-end">
          {actions}
        </div>
      )}
    </header>
  );
}
