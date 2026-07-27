export function PageContainer({ children }) {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </section>
  );
}
