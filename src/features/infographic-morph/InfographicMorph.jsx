import {
  ArrowLeft,
  ArrowLeftRight,
  Play,
  Sparkles,
  Wand2
} from 'lucide-react';
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
  getInfographicLibrary
} from './infographicLibrary.js';

const MorphingPath = memo(
  ({
    startD,
    endD,
    startColor,
    endColor,
    optimize,
    samples,
    isMassive,
    onRegister
  }) => {
    const pathRef = useRef(null);

    const interpolator = useMemo(
      () =>
        createMorphInterpolator(startD, endD, {
          samples,
          optimize,
          isMassive
        }),
      [endD, isMassive, optimize, samples, startD]
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

const MiniPreview = memo(({ paths, colors, viewBox }) => {
  return (
    <svg viewBox={viewBox} className="h-full w-full">
      {paths.map((path, index) => (
        <path
          key={`${path}-${index}`}
          d={path}
          fill={colors[index % colors.length]}
          stroke={colors[index % colors.length]}
          strokeWidth={1}
          fillOpacity={0.9}
        />
      ))}
    </svg>
  );
});

const StatPill = ({ label, value }) => (
  <div className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
    {label} <span className="text-slate-200">{value}</span>
  </div>
);

const InfographicCard = ({ data, active, onClick, activeClass }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(data.id)}
      className={`flex w-full flex-col gap-3 rounded-2xl border px-4 py-3 text-left transition ${
        active
          ? activeClass
          : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-100">
            {data.title}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {data.description}
          </div>
        </div>
        <div className="h-14 w-14 rounded-xl border border-slate-800 bg-slate-950 p-2">
          <MiniPreview
            paths={data.paths}
            colors={data.colors}
            viewBox={data.viewBox || DEFAULT_VIEWBOX}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {data.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
        <span>层级 {data.stats.layers}</span>
        <span>节点 {data.stats.nodes}</span>
        <span>块 {data.stats.blocks}</span>
      </div>
    </button>
  );
};

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

export default function InfographicMorph({ onBack }) {
  const { library: infographicLibrary, map: infographicMap } = useMemo(
    () => getInfographicLibrary(),
    []
  );
  const [startId, setStartId] = useState(() => infographicLibrary[0]?.id);
  const [endId, setEndId] = useState(() => infographicLibrary[1]?.id);
  const [optimize, setOptimize] = useState(true);
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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        正在加载图示库...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/90 px-6 py-5 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
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
                <Sparkles className="text-amber-300" size={20} />
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
                    ? 'border-amber-400/60 bg-amber-500/10 text-amber-300'
                    : 'border-slate-700 bg-slate-800 text-slate-500'
                }`}
              >
                <Wand2 size={14} />
                {optimize ? '智能对齐: ON' : '智能对齐: OFF'}
              </button>
              <button
                type="button"
                onClick={handleSwap}
                className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 transition hover:border-amber-400/70 hover:text-amber-200"
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
                    ? 'cursor-not-allowed bg-slate-800 text-slate-500'
                    : 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                }`}
              >
                <Play size={14} />
                {isPlaying ? 'Morphing...' : 'Run Morph'}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-amber-300">基于 @antv/infographic</span>
            <span className="h-1 w-1 rounded-full bg-slate-600"></span>
            <span>典型 10 类模板</span>
            <span className="h-1 w-1 rounded-full bg-slate-600"></span>
            <span>SVG Morphing 实验舱</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10 lg:flex-row">
        <section className="flex-1 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="sticky top-0 z-10 bg-slate-950 pb-2">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
                  源模板
                </div>
              </div>
              <div className="space-y-4">
                {infographicLibrary.map((item) => (
                  <InfographicCard
                    key={`start-${item.id}`}
                    data={item}
                    active={startId === item.id}
                    onClick={(id) => {
                      setStartId(id);
                      handleReset(false);
                    }}
                    activeClass="border-amber-500/70 bg-amber-500/10 ring-1 ring-amber-500/40"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="sticky top-0 z-10 bg-slate-950 pb-2">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
                  目标模板
                </div>
              </div>
              <div className="space-y-4">
                {infographicLibrary.map((item) => (
                  <InfographicCard
                    key={`end-${item.id}`}
                    data={item}
                    active={endId === item.id}
                    onClick={(id) => {
                      setEndId(id);
                      handleReset(false);
                    }}
                    activeClass="border-blue-500/70 bg-blue-500/10 ring-1 ring-blue-500/40"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="flex w-full flex-col gap-6 lg:w-[460px]">
          <div
            ref={containerRef}
            className="relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl"
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                backgroundSize: '32px 32px',
                backgroundPosition: 'center'
              }}
            />
            <svg
              viewBox={mergedViewBox}
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
                  />
                ) : null
              )}
            </svg>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Morph 数据
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="mb-2 text-xs font-semibold text-amber-300">
                  源模板 · {startData.title}
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatPill label="层级" value={startData.stats.layers} />
                  <StatPill label="节点" value={startData.stats.nodes} />
                  <StatPill label="块" value={startData.stats.blocks} />
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="mb-2 text-xs font-semibold text-blue-300">
                  目标模板 · {endData.title}
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatPill label="层级" value={endData.stats.layers} />
                  <StatPill label="节点" value={endData.stats.nodes} />
                  <StatPill label="块" value={endData.stats.blocks} />
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-400">
                <p className="leading-relaxed">
                  当前 Morph 以 <span className="text-amber-200">SVG Path</span>{' '}
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
