export function PageToolbar({ children }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
      {children}
    </div>
  );
}
