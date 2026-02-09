import {
  ArrowLeft,
  ArrowLeftRight,
  Layers,
  Play,
  Sparkles,
  Wand2
} from 'lucide-react';
import {
  Infographic,
  getPalette,
  getTemplate
} from '@antv/infographic';
import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Timeline } from 'animejs';
import {
  buildStaticPathD,
  createColorLerp,
  createMorphEngine,
  createMorphInterpolator
} from '../../lib/svgMorphEngine.js';
import {
  DEFAULT_VIEWBOX,
  FALLBACK_PALETTE,
  getInfographicLibrary,
  INFOGRAPHIC_TEMPLATES,
  buildInfographicData,
  MORPH_DEFAULTS
} from './infographicLibrary.js';

const offsetPoints = (points, dx = 0, dy = 0) =>
  points.map((point) => ({
    x: point.x + dx,
    y: point.y + dy
  }));

const MorphingPath = memo(
  ({
    startD,
    endD,
    startColor,
    endColor,
    optimize,
    samples,
    isMassive,
    onRegister,
    separate,
    separationOffset
  }) => {
    const pathRef = useRef(null);

    const interpolator = useMemo(
      () => {
        const baseInterpolator = createMorphInterpolator(startD, endD, {
          samples,
          optimize,
          isMassive
        });
        if (!baseInterpolator || !separate) {
          return baseInterpolator;
        }
        return {
          a: offsetPoints(baseInterpolator.a, -separationOffset, 0),
          b: offsetPoints(baseInterpolator.b, separationOffset, 0)
        };
      },
      [endD, isMassive, optimize, samples, separate, separationOffset, startD]
    );

    const colorData = useMemo(
      () => createColorLerp(startColor, endColor),
      [endColor, startColor]
    );

    useLayoutEffect(() => {
      if (pathRef.current && interpolator && onRegister) {
        const unregister = onRegister({
          dom: pathRef.current,
          data: interpolator,
          color: colorData,
          samples: samples
        });
        return unregister;
      }
      return undefined;
    }, [colorData, interpolator, onRegister, samples]);

    const initialD = useMemo(() => {
      if (!interpolator) return '';
      return buildStaticPathD(interpolator.a, 1);
    }, [interpolator]);

    return (
      <path
        ref={pathRef}
        d={initialD}
        fill={startColor}
        stroke={startColor}
        fillOpacity={0.85}
        strokeWidth={1}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ willChange: 'd' }}
      />
    );
  }
);

const StatPill = ({ label, value }) => (
  <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
    {label} <span className="text-slate-900">{value}</span>
  </div>
);

const PreviewCard = memo(
  ({ templateId, title, description, tags, data, active, onClick, activeClass }) => {
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
      <button
        type="button"
        onClick={onClick}
        className={`flex h-full flex-col gap-4 rounded-2xl border p-5 text-left shadow-sm transition ${
          active
            ? activeClass
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      >
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
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
          <div ref={containerRef} className="h-[200px] w-[260px]" />
        </div>
      </button>
    );
  }
);

const parseViewBox = (value) => {
  if (!value) return null;
  const parts = value
    .trim()
    .split(/[\s,]+/)
    .map((entry) => Number.parseFloat(entry));
  if (parts.length < 4 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }
  const [minX, minY, width, height] = parts;
  return { minX, minY, width, height };
};

const mergeViewBox = (a, b) => {
  const first = parseViewBox(a);
  const second = parseViewBox(b);
  if (!first && !second) return DEFAULT_VIEWBOX;
  if (!first) return b;
  if (!second) return a;
  const minX = Math.min(first.minX, second.minX);
  const minY = Math.min(first.minY, second.minY);
  const maxX = Math.max(first.minX + first.width, second.minX + second.width);
  const maxY = Math.max(first.minY + first.height, second.minY + second.height);
  return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
};

const expandViewBox = (value, offset) => {
  const parsed = parseViewBox(value);
  if (!parsed) return value;
  return `${parsed.minX - offset} ${parsed.minY} ${parsed.width + offset * 2} ${
    parsed.height
  }`;
};

export default function InfographicMorph({ onBack }) {
  const { library: infographicLibrary, map: infographicMap } = useMemo(
    () => getInfographicLibrary(),
    []
  );
  const [startId, setStartId] = useState(() => infographicLibrary[0]?.id);
  const [endId, setEndId] = useState(() => infographicLibrary[1]?.id);
  const [optimize, setOptimize] = useState(true);
  const [separate, setSeparate] = useState(
    MORPH_DEFAULTS.separateByDefault
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const timelineRef = useRef(null);

  if (!engineRef.current) {
    engineRef.current = createMorphEngine({ duration: 2200 });
  }

  const handleRegister = useMemo(
    () => (item) => engineRef.current.register(item),
    []
  );

  const previewTemplates = useMemo(
    () =>
      INFOGRAPHIC_TEMPLATES.filter((spec) => getTemplate(spec.templateId)).map(
        (spec) => ({
          ...spec,
          data: buildInfographicData(spec.templateId, spec.itemCount)
        })
      ),
    []
  );

  const startData = infographicMap[startId];
  const endData = infographicMap[endId];

  useEffect(() => {
    if (!startData && infographicLibrary.length) {
      setStartId(infographicLibrary[0].id);
    }
    if (!endData && infographicLibrary.length > 1) {
      setEndId(infographicLibrary[1].id);
    }
  }, [endData, infographicLibrary, startData]);

  const maxPaths = Math.max(
    startData?.paths.length || 0,
    endData?.paths.length || 0
  );
  const isMassive = maxPaths > 80;
  const staticSamples = isMassive ? 40 : maxPaths > 40 ? 80 : 120;
  const motionSampleStep = isMassive ? 2 : 1;
  const mergedViewBox = mergeViewBox(
    startData?.viewBox || DEFAULT_VIEWBOX,
    endData?.viewBox || DEFAULT_VIEWBOX
  );
  const expandedViewBox = separate
    ? expandViewBox(mergedViewBox, MORPH_DEFAULTS.separationOffset)
    : mergedViewBox;

  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.pause();
      }
    };
  }, []);

  const handleReset = (resetToFinal = false) => {
    if (timelineRef.current) {
      timelineRef.current.pause();
    }
    engineRef.current.renderStatic(resetToFinal ? 1 : 0, 1);
    setIsPlaying(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    const tl = new Timeline({
      onComplete: () => {
        setIsPlaying(false);
        engineRef.current.renderStatic(1, 1);
      }
    });
    timelineRef.current = tl;

    if (containerRef.current) {
      tl.add(
        {
          targets: containerRef.current,
          scale: [1, 0.96],
          duration: 240,
          easing: 'easeOutQuad'
        },
        0
      );
    }

    engineRef.current.play({
      timeline: tl,
      motionSampleStep,
      offset: 180
    });

    if (containerRef.current) {
      tl.add(
        {
          targets: containerRef.current,
          scale: [0.96, 1],
          duration: 800,
          easing: 'easeOutElastic(1, .7)'
        },
        '-=600'
      );
    }

    tl.play();
  };

  const handleSwap = () => {
    setStartId(endId);
    setEndId(startId);
    handleReset(false);
  };

  const renderItems = Array.from({ length: maxPaths }).map((_, index) => {
    if (!startData || !endData) return null;
    const sIndex = index % startData.paths.length;
    const eIndex = index % endData.paths.length;
    const sColorIndex = sIndex % startData.colors.length;
    const eColorIndex = eIndex % endData.colors.length;
    return {
      key: index,
      startD: startData.paths[sIndex],
      endD: endData.paths[eIndex],
      startColor: startData.colors[sColorIndex],
      endColor: endData.colors[eColorIndex]
    };
  });

  if (!startData || !endData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        正在加载图示库...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-amber-300 hover:text-amber-600"
                >
                  <ArrowLeft size={14} />
                  返回菜单
                </button>
              ) : null}
              <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
                <Sparkles className="text-amber-500" size={20} />
                Infographic Morph Studio
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setOptimize(!optimize);
                  handleReset(false);
                }}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                  optimize
                    ? 'border-amber-400/60 bg-amber-50 text-amber-600'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                <Wand2 size={14} />
                {optimize ? '智能对齐: ON' : '智能对齐: OFF'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSeparate(!separate);
                  handleReset(false);
                }}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                  separate
                    ? 'border-blue-400/60 bg-blue-50 text-blue-600'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                <Layers size={14} />
                {separate ? '源/目标分离: ON' : '源/目标分离: OFF'}
              </button>
              <button
                type="button"
                onClick={handleSwap}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-amber-300 hover:text-amber-600"
              >
                <ArrowLeftRight size={14} />
                切换 Src / Dest
              </button>
              <button
                type="button"
                onClick={handlePlay}
                disabled={isPlaying}
                className={`flex items-center gap-2 rounded-full px-6 py-2 text-xs font-bold transition ${
                  isPlaying
                    ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                    : 'bg-amber-500 text-white hover:bg-amber-400'
                }`}
              >
                <Play size={14} />
                {isPlaying ? 'Morphing...' : 'Run Morph'}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="text-amber-500">基于 @antv/infographic</span>
            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
            <span>典型 10 类模板</span>
            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
            <span>SVG Morphing 实验舱</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1360px] flex-1 flex-col gap-8 px-6 py-10 lg:flex-row lg:flex-wrap xl:flex-nowrap">
        <section className="min-w-0 flex-1 space-y-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="sticky top-0 z-10 bg-slate-50 pb-2">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
                  源模板
                </div>
              </div>
              <div className="grid gap-6">
                {previewTemplates.map((item) => (
                  <PreviewCard
                    key={`start-${item.id}`}
                    templateId={item.templateId}
                    title={item.title}
                    description={item.description}
                    tags={item.tags}
                    data={item.data}
                    active={startId === item.id}
                    onClick={() => {
                      setStartId(item.id);
                      handleReset(false);
                    }}
                    activeClass="border-amber-400/70 bg-amber-50 ring-1 ring-amber-200"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="sticky top-0 z-10 bg-slate-50 pb-2">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
                  目标模板
                </div>
              </div>
              <div className="grid gap-6">
                {previewTemplates.map((item) => (
                  <PreviewCard
                    key={`end-${item.id}`}
                    templateId={item.templateId}
                    title={item.title}
                    description={item.description}
                    tags={item.tags}
                    data={item.data}
                    active={endId === item.id}
                    onClick={() => {
                      setEndId(item.id);
                      handleReset(false);
                    }}
                    activeClass="border-blue-400/70 bg-blue-50 ring-1 ring-blue-200"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside
          className="flex w-full flex-col gap-6 lg:sticky lg:top-28 lg:self-start"
          style={{ width: `min(100%, ${MORPH_DEFAULTS.previewWidth}px)` }}
        >
          <div
            ref={containerRef}
            className="relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-xl"
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
                backgroundSize: '32px 32px',
                backgroundPosition: 'center'
              }}
            />
            <svg
              viewBox={expandedViewBox}
              className="relative z-10 h-full w-full p-10"
              style={{ filter: 'drop-shadow(0 0 18px rgba(0,0,0,0.5))' }}
            >
              {renderItems.map((item) =>
                item ? (
                  <MorphingPath
                    key={item.key}
                    startD={item.startD}
                    endD={item.endD}
                    startColor={item.startColor}
                    endColor={item.endColor}
                    optimize={optimize}
                    samples={staticSamples}
                    isMassive={isMassive}
                    onRegister={handleRegister}
                    separate={separate}
                    separationOffset={MORPH_DEFAULTS.separationOffset}
                  />
                ) : null
              )}
            </svg>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Morph 数据
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 text-xs font-semibold text-amber-600">
                  源模板 · {startData.title}
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatPill label="层级" value={startData.stats.layers} />
                  <StatPill label="节点" value={startData.stats.nodes} />
                  <StatPill label="块" value={startData.stats.blocks} />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 text-xs font-semibold text-blue-600">
                  目标模板 · {endData.title}
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatPill label="层级" value={endData.stats.layers} />
                  <StatPill label="节点" value={endData.stats.nodes} />
                  <StatPill label="块" value={endData.stats.blocks} />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                <p className="leading-relaxed">
                  当前 Morph 以 <span className="text-amber-600">SVG Path</span>{' '}
                  为基底，直接来自 @antv/infographic 的模板渲染结果。选取图示库中最典型的
                  10 个模板，在视觉上统一为可 Morph 网格。
                </p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
