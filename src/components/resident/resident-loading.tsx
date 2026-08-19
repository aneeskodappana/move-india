export function ResidentLoading({ label }: { label: string }) {
  return (
    <main className="min-h-screen bg-canvas px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-bold text-stone-700">{label}</p>
        <div className="mt-6 h-40 animate-pulse rounded-card bg-forest-100" />
        <div className="mt-4 h-24 animate-pulse rounded-card bg-paper" />
      </div>
    </main>
  );
}
