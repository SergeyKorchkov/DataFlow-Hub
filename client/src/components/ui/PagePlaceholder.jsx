export function PagePlaceholder({ title, description }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-3xl text-slate-300">{description}</p>
    </section>
  );
}
