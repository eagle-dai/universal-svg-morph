import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Timeline } from 'animejs';
import { ArrowLeft, Image, Play, RotateCcw } from 'lucide-react';
import { Infographic } from '@antv/infographic';
import {
  buildStaticPathD,
  createColorLerp,
  createMorphEngine,
  createMorphInterpolator,
} from '../../lib/svgMorphEngine.js';

const INFOGRAPHIC_PRESET_DATA = [
  {
    id: 'steps',
    label: '步骤箭头',
    template: 'list-row-simple-horizontal-arrow',
    items: [
      { label: 'Step 1', desc: 'Research' },
      { label: 'Step 2', desc: 'Design' },
      { label: 'Step 3', desc: 'Build' },
      { label: 'Step 4', desc: 'Launch' },
    ],
  },
  {
    id: 'grid',
    label: '网格卡片',
    template: 'list-grid-simple',
    items: [
      { label: 'Metric A', desc: '4280' },
      { label: 'Metric B', desc: '3120' },
      { label: 'Metric C', desc: '2570' },
      { label: 'Metric D', desc: '1980' },
      { label: 'Metric E', desc: '1420' },
      { label: 'Metric F', desc: '860' },
    ],
  },
  {
    id: 'column',
    label: '完成清单',
    template: 'list-column-done-list',
    items: [
      { label: 'Design', desc: '已完成' },
      { label: 'Prototype', desc: '已完成' },
      { label: 'Review', desc: '进行中' },
      { label: 'Release', desc: '待开始' },
    ],
  },
];

const buildListSyntax = (template, items) => {
  const listLines = items
    .map(
      (item) =>
        `    - label ${item.label}\n      desc ${item.desc}`,
    )
    .join('\n');
  return `infographic ${template}\ndata\n  lists\n${listLines}`;
};

const extractPathsFromSvg = (svg) => {
  return Array.from(svg.querySelectorAll('path'))
    .map((path) => {
      const d = path.getAttribute('d');
      if (!d) return null;
      const fill = path.getAttribute('fill');
      const stroke = path.getAttribute('stroke');
      const color =
        fill && fill !== 'none'
          ? fill
          : stroke && stroke !== 'none'
            ? stroke
            : '#38bdf8';
      return { d, color };
    })
    .filter(Boolean);
};

const cloneSvgMarkup = (svg) => {
  const clone = svg.cloneNode(true);
  clone.setAttribute('width', '100%');
  clone.setAttribute('height', '100%');
  clone.removeAttribute('style');
  return clone.outerHTML;
};

const MorphingPath = ({
  startD,
  endD,
  startColor,
  endColor,
  samples,
  optimize,
  isMassive,
  onRegister,
}) => {
  const pathRef = useRef(null);

  const interpolator = useMemo(() => {
    return createMorphInterpolator(startD, endD, {
      samples,
      optimize,
      isMassive,
    });
  }, [startD, endD, samples, optimize, isMassive]);

  const colorData = useMemo(() => {
    return createColorLerp(startColor, endColor);
  }, [startColor, endColor]);

  useLayoutEffect(() => {
    if (pathRef.current && interpolator && onRegister) {
      const unregister = onRegister({
        dom: pathRef.current,
        data: interpolator,
        color: colorData,
        samples,
      });
      return unregister;
    }
  }, [interpolator, colorData, onRegister, samples]);

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
};

export default function InfographicTest({ onBack }) {
  const [infographicSets, setInfographicSets] = useState([]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const renderHostRef = useRef(null);
  const engineRef = useRef(null);
  const timelineRef = useRef(null);

  if (!engineRef.current) {
    engineRef.current = createMorphEngine({ duration: 2000 });
  }

  const handleRegister = useMemo(
    () => (item) => engineRef.current.register(item),
    [],
  );

  useEffect(() => {
    const host = renderHostRef.current;
    if (!host) return;

    host.replaceChildren();
    setIsLoading(true);

    const nextSets = INFOGRAPHIC_PRESET_DATA.map((config) => {
      const container = document.createElement('div');
      host.appendChild(container);

      const infographic = new Infographic({
        container,
        width: 640,
        height: 360,
        editable: false,
      });

      const syntax = buildListSyntax(config.template, config.items);
      infographic.render(syntax);

      const svg = container.querySelector('svg');
      if (!svg) {
        return null;
      }

      const viewBox =
        svg.getAttribute('viewBox') ||
        `0 0 ${svg.width?.baseVal?.value || 640} ${
          svg.height?.baseVal?.value || 360
        }`;

      return {
        ...config,
        viewBox,
        svgMarkup: cloneSvgMarkup(svg),
        paths: extractPathsFromSvg(svg),
      };
    }).filter(Boolean);

    setInfographicSets(nextSets);
    setSourceIndex(0);
    setTargetIndex(nextSets.length > 1 ? 1 : 0);
    setIsLoading(false);

    return () => {
      host.replaceChildren();
      if (timelineRef.current) {
        timelineRef.current.pause();
      }
    };
  }, []);

  const activeSet = infographicSets[sourceIndex];
  const targetSet = infographicSets[targetIndex];
  const hasData = activeSet && targetSet;
  const isSameSelection = sourceIndex === targetIndex;

  const maxPaths = hasData
    ? Math.max(activeSet.paths.length, targetSet.paths.length)
    : 0;
  const isMassive = maxPaths > 120;
  const samples = isMassive ? 40 : maxPaths > 80 ? 60 : 120;
  const motionSampleStep = isMassive ? 2 : 1;

  const renderItems = useMemo(() => {
    if (!hasData) return [];
    return Array.from({ length: maxPaths }).map((_, i) => {
      const startIndex = i % activeSet.paths.length;
      const endIndex = i % targetSet.paths.length;
      const startPath = activeSet.paths[startIndex];
      const endPath = targetSet.paths[endIndex];

      return {
        key: i,
        startD: startPath.d,
        endD: endPath.d,
        startColor: startPath.color,
        endColor: endPath.color,
      };
    });
  }, [hasData, maxPaths, activeSet, targetSet]);

  useEffect(() => {
    if (!hasData || isPlaying) return;
    engineRef.current.renderStatic(0, 1);
  }, [hasData, sourceIndex, targetIndex, isPlaying]);

  const handlePlay = () => {
    if (!hasData || isSameSelection) return;
    setIsPlaying(true);

    if (timelineRef.current) {
      timelineRef.current.pause();
    }

    const tl = new Timeline({
      onComplete: () => {
        setIsPlaying(false);
        setSourceIndex(targetIndex);
      },
    });

    timelineRef.current = tl;

    engineRef.current.play({
      timeline: tl,
      motionSampleStep,
      onComplete: () => {
        engineRef.current.renderStatic(1, 1);
      },
    });

    tl.play();
  };

  const handleReset = () => {
    if (!engineRef.current) return;
    if (timelineRef.current) {
      timelineRef.current.pause();
    }
    engineRef.current.renderStatic(0, 1);
    setIsPlaying(false);
  };

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
            使用 AntV Infographic 生成多套 SVG，并利用本项目的 morph 引擎进行过渡测试。
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Infographic Morphing
              </h2>
              <p className="text-xs text-slate-400">
                选择起始与目标模板后点击播放，观察 SVG 路径的形变效果。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePlay}
                disabled={!hasData || isPlaying || isSameSelection}
                className="flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Play size={14} />
                开始 Morphing
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={!hasData}
                className="flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RotateCcw size={14} />
                重置
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              {isLoading ? (
                <div className="flex min-h-[360px] items-center justify-center text-xs uppercase tracking-[0.3em] text-slate-500">
                  Loading...
                </div>
              ) : hasData ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="rounded-full border border-slate-700 px-2 py-0.5">
                      起始：{activeSet.label}
                    </span>
                    <span className="rounded-full border border-slate-700 px-2 py-0.5">
                      目标：{targetSet.label}
                    </span>
                    <span className="rounded-full border border-slate-700 px-2 py-0.5">
                      路径数：{maxPaths}
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                    <svg
                      key={`${sourceIndex}-${targetIndex}`}
                      viewBox={activeSet.viewBox}
                      className="h-[360px] w-full"
                      aria-label="Infographic morphing preview"
                    >
                      {renderItems.map((item) => (
                        <MorphingPath
                          key={item.key}
                          startD={item.startD}
                          endD={item.endD}
                          startColor={item.startColor}
                          endColor={item.endColor}
                          samples={samples}
                          optimize
                          isMassive={isMassive}
                          onRegister={handleRegister}
                        />
                      ))}
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[360px] items-center justify-center text-xs uppercase tracking-[0.3em] text-slate-500">
                  暂无可用的 Infographic
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <h3 className="text-sm font-semibold text-slate-100">
                  起始模板
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  从下方样式中选择 morphing 的起始图。
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {infographicSets.map((item, index) => (
                    <button
                      key={`source-${item.id}`}
                      type="button"
                      onClick={() => setSourceIndex(index)}
                      className={`group rounded-2xl border p-3 text-left transition ${
                        sourceIndex === index
                          ? 'border-sky-400/80 bg-sky-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.4)]'
                          : 'border-slate-800 bg-slate-950/70 hover:border-slate-600'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-200">
                        <span>{item.label}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] ${
                            sourceIndex === index
                              ? 'bg-sky-500/20 text-sky-200'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          起始
                        </span>
                      </div>
                      <div
                        className="h-24 w-full rounded-xl border border-slate-800/60 bg-slate-950/80 p-2 [&_svg]:h-full [&_svg]:w-full"
                        dangerouslySetInnerHTML={{ __html: item.svgMarkup }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <h3 className="text-sm font-semibold text-slate-100">
                  目标模板
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  从下方样式中选择 morphing 的目标图。
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {infographicSets.map((item, index) => (
                    <button
                      key={`target-${item.id}`}
                      type="button"
                      onClick={() => setTargetIndex(index)}
                      className={`group rounded-2xl border p-3 text-left transition ${
                        targetIndex === index
                          ? 'border-amber-400/80 bg-amber-500/10 shadow-[0_0_0_1px_rgba(251,191,36,0.4)]'
                          : 'border-slate-800 bg-slate-950/70 hover:border-slate-600'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-200">
                        <span>{item.label}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] ${
                            targetIndex === index
                              ? 'bg-amber-500/20 text-amber-200'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          目标
                        </span>
                      </div>
                      <div
                        className="h-24 w-full rounded-xl border border-slate-800/60 bg-slate-950/80 p-2 [&_svg]:h-full [&_svg]:w-full"
                        dangerouslySetInnerHTML={{ __html: item.svgMarkup }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <div ref={renderHostRef} className="sr-only" aria-hidden="true" />
    </div>
  );
}
