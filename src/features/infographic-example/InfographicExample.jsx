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

const SEGMENT_LABELS = {
  tree: '树形',
  distributed: '分布式',
  origin: '原点',
  compact: '紧凑',
  plain: '基础',
  simple: '简洁',
  animated: '动效',
  rounded: '圆角',
  quarter: '四分象限',
  left: '左侧',
  right: '右侧',
  top: '顶部',
  bottom: '底部',
  lr: '左到右',
  rl: '右到左',
  tb: '上到下',
  bt: '下到上',
  flow: '流程',
  timeline: '时间线',
  steps: '步骤',
  hierarchy: '层级',
  relation: '关系',
  circle: '圆形',
  grid: '网格',
  pie: '饼图',
  donut: '环图',
  pyramid: '金字塔',
  compare: '对比',
  icon: '图标',
  node: '节点',
  badge: '徽标',
  card: '卡片',
  capsule: '胶囊',
  column: '柱状图',
  list: '列表',
  chart: '图表',
  sequence: '序列',
  dagre: '自动布局',
  text: '文本'
};

const CATEGORY_GUIDE = {
  list: {
    useCase: '用于展示项目清单、功能分组、价格套餐、要点汇总等平铺信息。',
    dataFormat: '通常是多条并列条目，建议每条包含 title / value / description / icon。',
    cautions: '控制每个卡片文案长度，避免列表项过多导致可读性下降。'
  },
  sequence: {
    useCase: '用于说明流程步骤、时间线、阶段路径、任务执行顺序。',
    dataFormat: '按顺序组织数组数据，建议包含 step、title、desc、time 等字段。',
    cautions: '顺序必须明确，步骤数量过多时建议拆分为多段展示。'
  },
  compare: {
    useCase: '用于对比方案差异、优缺点、版本能力、竞品特征。',
    dataFormat: '至少两组可对照对象，字段结构保持一致，便于横向比对。',
    cautions: '确保比较维度统一，避免出现口径不一致的指标。'
  },
  relation: {
    useCase: '用于展示实体之间的关联关系，如因果链路、网络关系、依赖图。',
    dataFormat: '常见为 nodes + edges 或主从关系集合，可附带关系说明字段。',
    cautions: '注意关系方向和层级语义，避免连接线过多造成视觉噪声。'
  },
  hierarchy: {
    useCase: '用于组织结构、分层体系、树形分类、能力分解。',
    dataFormat: '树状或父子层级数据，建议包含 id、parentId、name、value。',
    cautions: '层级不宜过深，建议突出主干结构并弱化次要分支。'
  },
  chart: {
    useCase: '用于定量分析，如趋势变化、占比结构、分类统计、指标对比。',
    dataFormat: '适合数值型数据，常见包含 category、value、series、time。',
    cautions: '明确单位和口径，保证颜色映射在多个图表之间保持一致。'
  },
  general: {
    useCase: '通用信息表达场景，可作为内容排版的基础图谱。',
    dataFormat: '基础字段建议包含标题、描述、标签和关键数值。',
    cautions: '优先保证信息层次清晰，避免同时堆叠过多视觉元素。'
  }
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

const toChineseTitle = (templateId) => {
  const translatedSegments = templateId
    .split('-')
    .slice(1)
    .map((segment) => SEGMENT_LABELS[segment] ?? segment);

  return translatedSegments.length > 0
    ? translatedSegments.join(' · ')
    : '通用信息图模板';
};

const buildTemplateSpec = (templateId) => {
  const [category = 'general'] = templateId.split('-');
  const defaultCount = category === 'compare' ? 2 : 4;
  const guide = CATEGORY_GUIDE[category] ?? CATEGORY_GUIDE.general;

  return {
    id: templateId,
    templateId,
    title: toTitle(templateId),
    titleZh: toChineseTitle(templateId),
    description: toDescription(templateId),
    category,
    tags: [CATEGORY_LABELS[category] ?? '通用', category],
    itemCount: defaultCount,
    details: {
      type: CATEGORY_LABELS[category] ?? '通用',
      useCase: guide.useCase,
      dataFormat: guide.dataFormat,
      cautions: guide.cautions,
      other:
        category === 'chart'
          ? '图表类模板通常对数值字段更敏感，建议优先准备干净、完整的指标数据。'
          : null
    }
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
                <h2 className="text-lg font-semibold text-slate-900">{activeTemplate.titleZh}</h2>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  {activeTemplate.title}
                </p>
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
            <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">类型</h3>
                <p className="mt-1 text-sm text-slate-700">{activeTemplate.details.type}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">适合什么场景</h3>
                <p className="mt-1 text-sm text-slate-700">{activeTemplate.details.useCase}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">输入数据格式</h3>
                <p className="mt-1 text-sm text-slate-700">{activeTemplate.details.dataFormat}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">特别注意点</h3>
                <p className="mt-1 text-sm text-slate-700">{activeTemplate.details.cautions}</p>
              </div>
              {activeTemplate.details.other ? (
                <div className="md:col-span-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    其它重要信息
                  </h3>
                  <p className="mt-1 text-sm text-slate-700">{activeTemplate.details.other}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
