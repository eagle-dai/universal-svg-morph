import { ArrowLeft, Sparkles } from 'lucide-react';
import { Infographic, getPalette, getTemplate, getTemplates } from '@antv/infographic';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { FALLBACK_PALETTE, buildInfographicData } from '../infographic-morph/infographicLibrary.js';

const CATEGORY_LABELS = {
  list: '列表型',
  sequence: '顺序型',
  compare: '对比型',
  relation: '关系型',
  hierarchy: '层级型',
  chart: '图表型'
};

const toTitle = (templateId) =>
  templateId
    .split('-')
    .slice(1)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const toDescription = (templateId) => {
  const [category] = templateId.split('-');
  const categoryLabel = CATEGORY_LABELS[category] ?? '通用';
  return `${categoryLabel}模板，来自 @antv/infographic。`;
};

const buildTemplateSpec = (templateId) => {
  const [category = 'general'] = templateId.split('-');
  const defaultCount = category === 'compare' ? 2 : 4;

  return {
    id: templateId,
    templateId,
    title: toTitle(templateId),
    description: toDescription(templateId),
    tags: [CATEGORY_LABELS[category] ?? '通用', category],
    itemCount: defaultCount
  };
};

const getModalRenderSize = (templateId) => {
  const [category = 'general'] = templateId.split('-');
  const heightByCategory = {
    sequence: 460,
    list: 460,
    compare: 480,
    hierarchy: 520,
    relation: 520,
    chart: 560
  };

  return {
    width: 960,
    height: heightByCategory[category] ?? 500
  };
};

const InfographicCanvas = memo(({ templateId, data, width, height, padding }) => {
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
      width,
      height,
      padding,
      themeConfig: {
        palette
      }
    });

    infographic.render();

    return () => {
      infographic.destroy();
      container.innerHTML = '';
    };
  }, [data, height, padding, palette, templateId, width]);

  return <div ref={containerRef} className="h-full w-full" />;
});

const PreviewCard = memo(({ templateId, title, description, tags, data, onOpen }) => {
  const PREVIEW_WIDTH = 360;
  const PREVIEW_HEIGHT = 260;

  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
          {templateId}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpen();
          }
        }}
        className="group flex flex-1 cursor-zoom-in items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 outline-none transition hover:border-emerald-200 focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <div className="h-[260px] w-[360px] max-w-full">
          <InfographicCanvas
            templateId={templateId}
            data={data}
            width={PREVIEW_WIDTH}
            height={PREVIEW_HEIGHT}
            padding={10}
          />
        </div>
      </div>
    </article>
  );
});

export default function InfographicExample({ onBack }) {
  const [activeTemplateId, setActiveTemplateId] = useState(null);

  const templates = useMemo(
    () =>
      getTemplates()
        .filter((templateId) => getTemplate(templateId))
        .map((templateId) => buildTemplateSpec(templateId))
        .map((spec) => ({
          ...spec,
          data: buildInfographicData(spec.templateId, spec.itemCount)
        })),
    []
  );

  const activeTemplate = useMemo(
    () => templates.find((template) => template.id === activeTemplateId) ?? null,
    [activeTemplateId, templates]
  );

  const activeRenderSize = useMemo(
    () => (activeTemplate ? getModalRenderSize(activeTemplate.templateId) : null),
    [activeTemplate]
  );

  useEffect(() => {
    if (!activeTemplate) return undefined;

    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        setActiveTemplateId(null);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [activeTemplate]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 px-6 py-6 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600"
              >
                <ArrowLeft size={14} />
                返回菜单
              </button>
            ) : null}
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
              <Sparkles className="text-emerald-500" size={20} />
              AntV Infographic 示例库
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            直接渲染 @antv/infographic 全量模板，快速查看各类信息图谱的视觉样式。
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
          {templates.map((item) => (
            <PreviewCard
              key={item.id}
              templateId={item.templateId}
              title={item.title}
              description={item.description}
              tags={item.tags}
              data={item.data}
              onOpen={() => setActiveTemplateId(item.id)}
            />
          ))}
        </div>
      </main>

      {activeTemplate ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-6 backdrop-blur-sm"
          onClick={() => setActiveTemplateId(null)}
        >
          <div
            className="w-full max-w-[1080px] rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{activeTemplate.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  已进入放大预览，按 ESC 键或点击遮罩返回。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTemplateId(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600"
              >
                关闭
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <InfographicCanvas
                templateId={activeTemplate.templateId}
                data={activeTemplate.data}
                width={activeRenderSize?.width ?? 960}
                height={activeRenderSize?.height ?? 500}
                padding={18}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
