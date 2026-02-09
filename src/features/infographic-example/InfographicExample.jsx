import { ArrowLeft, Sparkles } from 'lucide-react';
import { Infographic, getPalette, getTemplate } from '@antv/infographic';
import { memo, useEffect, useMemo, useRef } from 'react';
import {
  FALLBACK_PALETTE,
  INFOGRAPHIC_TEMPLATES,
  buildInfographicData
} from '../infographic-morph/infographicLibrary.js';

const PreviewCard = memo(({ templateId, title, description, tags, data }) => {
  const containerRef = useRef(null);

  const palette = useMemo(
    () => getPalette('antv') ?? FALLBACK_PALETTE,
    []
  );

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const container = containerRef.current;
    container.innerHTML = '';

    const infographic = new Infographic({
      container,
      template: templateId,
      data,
      width: 260,
      height: 200,
      padding: 10,
      themeConfig: {
        palette
      }
    });

    infographic.render();

    return () => {
      infographic.destroy();
      container.innerHTML = '';
    };
  }, [data, palette, templateId]);

  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
        <div className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-200">
          {templateId}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950">
        <div ref={containerRef} className="h-[200px] w-[260px]" />
      </div>
    </article>
  );
});

export default function InfographicExample({ onBack }) {
  const templates = useMemo(
    () =>
      INFOGRAPHIC_TEMPLATES.filter((spec) => getTemplate(spec.templateId)).map(
        (spec) => ({
          ...spec,
          data: buildInfographicData(spec.templateId, spec.itemCount)
        })
      ),
    []
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/90 px-6 py-6 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/70 hover:text-emerald-200"
              >
                <ArrowLeft size={14} />
                返回菜单
              </button>
            ) : null}
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-white">
              <Sparkles className="text-emerald-300" size={20} />
              AntV Infographic 示例库
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            直接渲染 @antv/infographic 模板，快速查看常见信息图谱的视觉样式。
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((item) => (
            <PreviewCard
              key={item.id}
              templateId={item.templateId}
              title={item.title}
              description={item.description}
              tags={item.tags}
              data={item.data}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
