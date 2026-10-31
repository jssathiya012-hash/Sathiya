export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Brightloop</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">{title}</h1>
        <p className="mt-2 text-slate-500">This section is ready for the next implementation stage.</p>
      </div>
    </div>
  )
}
