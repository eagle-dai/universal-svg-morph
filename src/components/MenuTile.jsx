export default function MenuTile({ item, onSelect }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`group relative overflow-hidden rounded-2xl border bg-slate-900/70 p-6 text-left transition-all hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl ${item.theme.border}`}
    >
      <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${item.theme.background}`} />
      <div className="relative flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 ${item.theme.text}`}>
            <Icon size={24} />
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-300">
            {item.badge}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{item.title}</h3>
          <p className="mt-2 text-sm text-slate-400">{item.description}</p>
        </div>
        <div className={`flex items-center gap-2 text-sm font-semibold ${item.theme.text}`}>
          <span>{item.cta}</span>
          <span className="text-base">→</span>
        </div>
      </div>
      <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-80 ${item.theme.glow}`} />
    </button>
  );
}
