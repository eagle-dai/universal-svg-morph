import { ArrowLeft, Image } from 'lucide-react';

export default function InfographicTest({ onBack }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 px-6 py-5 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-amber-400/70 hover:text-amber-200"
              >
                <ArrowLeft size={14} />
                返回菜单
              </button>
            ) : null}
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-white">
              <Image className="text-amber-300" size={20} />
              Infographic SVG 测试页
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            预留用于接入 Infographic 生成的 SVG 结果。
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
        <section className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40">
          <div className="text-center text-xs uppercase tracking-[0.3em] text-slate-500">
            Placeholder
          </div>
        </section>
      </main>
    </div>
  );
}
