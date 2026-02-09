import { useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Waves } from 'lucide-react';
import {
  buildAnimatedPathD,
  buildStaticPathD,
  createColorLerp,
  createMorphInterpolator,
  lerpColor
} from '../../lib/svgMorphEngine.js';

const MORPH_CONFIG = {
  samples: 160,
  duration: 2200
};

const BASE_SHAPES = {
  source:
    'M 100 18 C 122 24 138 40 150 60 C 168 72 178 92 176 114 C 174 138 158 154 140 166 C 124 178 104 186 84 182 C 62 178 42 164 32 144 C 20 124 18 102 26 82 C 34 60 50 38 72 26 C 82 20 92 16 100 18 Z',
  target:
    'M 100 24 L 132 36 L 164 62 L 172 98 L 160 132 L 132 156 L 100 176 L 68 156 L 40 132 L 28 98 L 36 62 L 68 36 Z'
};

const BASE_COLORS = {
  source: '#60A5FA',
  target: '#F97316'
};

const TRANSFORMED_META = {
  label: '带 Transform',
  sourceTransform: 'translate(-26 10) rotate(-18 100 100) scale(0.84)',
  targetTransform: 'translate(18 -6) rotate(22 100 100) scale(0.88)',
  stageTransform: 'translate(-6 6) rotate(4 100 100) scale(0.9)'
};

const buildMorphLoop = ({ pathRef, interpolator, colorData, duration }) => {
  if (!pathRef.current || !interpolator) return () => {};
  let animationFrame = 0;
  let startTime = performance.now();

  const renderFrame = (timestamp) => {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const d = buildAnimatedPathD(interpolator.a, interpolator.b, progress, 1);
    const currentColor = lerpColor(colorData, progress);
    pathRef.current.setAttribute('d', d);
    pathRef.current.setAttribute('fill', currentColor);
    pathRef.current.setAttribute('stroke', currentColor);

    if (progress >= 1) {
      return;
    }

    animationFrame = requestAnimationFrame(renderFrame);
  };

  animationFrame = requestAnimationFrame(renderFrame);

  return () => cancelAnimationFrame(animationFrame);
};

const SvgPreview = ({ label, path, color, transform }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
    <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
      <span>{label}</span>
      {transform ? (
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
          transform
        </span>
      ) : null}
    </div>
    <svg viewBox="0 0 200 200" className="h-36 w-full">
      <path d={path} fill={color} stroke={color} transform={transform} />
    </svg>
  </div>
);

const MorphStage = ({ transform }) => {
  const pathRef = useRef(null);
  const loopCleanupRef = useRef(null);
  const interpolator = useMemo(
    () =>
      createMorphInterpolator(BASE_SHAPES.source, BASE_SHAPES.target, {
        samples: MORPH_CONFIG.samples,
        optimize: true
      }),
    []
  );
  const colorData = useMemo(
    () => createColorLerp(BASE_COLORS.source, BASE_COLORS.target),
    []
  );

  useEffect(() => {
    if (!pathRef.current || !interpolator) return;
    pathRef.current.setAttribute(
      'd',
      buildStaticPathD(interpolator.a, 1)
    );
    pathRef.current.setAttribute('fill', BASE_COLORS.source);
    pathRef.current.setAttribute('stroke', BASE_COLORS.source);
    return () => {
      if (loopCleanupRef.current) {
        loopCleanupRef.current();
        loopCleanupRef.current = null;
      }
    };
  }, [colorData, interpolator]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Morph 动画
        </div>
        <button
          type="button"
          onClick={() => {
            if (!pathRef.current || !interpolator) return;
            if (loopCleanupRef.current) {
              loopCleanupRef.current();
            }
            loopCleanupRef.current = buildMorphLoop({
              pathRef,
              interpolator,
              colorData,
              duration: MORPH_CONFIG.duration
            });
          }}
          className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200 transition hover:border-emerald-400 hover:text-white"
        >
          开始 Morph
        </button>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <svg viewBox="0 0 200 200" className="h-48 w-full">
          <path
            ref={pathRef}
            fill={BASE_COLORS.source}
            stroke={BASE_COLORS.source}
            transform={transform}
          />
        </svg>
      </div>
    </div>
  );
};

const MorphRow = ({ title, transform }) => (
  <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
        <Waves size={16} className="text-emerald-400" />
        {title}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <SvgPreview
          label="源 SVG 示例"
          path={BASE_SHAPES.source}
          color={BASE_COLORS.source}
          transform={transform?.source ?? transform}
        />
        <SvgPreview
          label="目标 SVG 示例"
          path={BASE_SHAPES.target}
          color={BASE_COLORS.target}
          transform={transform?.target ?? transform}
        />
      </div>
    </div>
    <MorphStage transform={transform?.stage ?? transform} />
  </div>
);

export default function BasicMorphTest({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-5">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-emerald-500/60 hover:text-emerald-300"
                >
                  <ArrowLeft size={14} />
                  返回菜单
                </button>
              ) : null}
              <h1 className="text-2xl font-semibold text-white">基础 Morph 测试页</h1>
            </div>
            <p className="text-sm text-slate-400">
              用最小示例验证 SVG 路径在不同条件下的 Morph 动画效果。
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <MorphRow title="基础形态对比" transform={null} />
        <MorphRow title={TRANSFORMED_META.label} transform={TRANSFORMED_META} />
      </main>
    </div>
  );
}
