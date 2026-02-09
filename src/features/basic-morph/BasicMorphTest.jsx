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
  source: 'M 100, 100 m -80, 0 a 80,80 0 1,0 160,0 a 80,80 0 1,0 -160,0',
  target: 'M 100,20 L 170,60 L 170,140 L 100,180 L 30,140 L 30,60 Z'
};

const BASE_COLORS = {
  source: '#60A5FA',
  target: '#F97316'
};

const TRANSFORMED_META = {
  label: '带 Transform',
  transform: 'translate(6 -4) rotate(16 100 100) scale(0.92)'
};

const buildMorphLoop = ({ pathRef, interpolator, colorData, duration }) => {
  if (!pathRef.current || !interpolator) return () => {};
  let animationFrame = 0;
  let direction = 1;
  let startTime = performance.now();

  const renderFrame = (timestamp) => {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const t = direction === 1 ? progress : 1 - progress;
    const d = buildAnimatedPathD(interpolator.a, interpolator.b, t, 1);
    const currentColor = lerpColor(colorData, t);
    pathRef.current.setAttribute('d', d);
    pathRef.current.setAttribute('fill', currentColor);
    pathRef.current.setAttribute('stroke', currentColor);

    if (progress >= 1) {
      direction *= -1;
      startTime = timestamp;
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
    return buildMorphLoop({
      pathRef,
      interpolator,
      colorData,
      duration: MORPH_CONFIG.duration
    });
  }, [colorData, interpolator]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
        Morph 动画
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
          transform={transform}
        />
        <SvgPreview
          label="目标 SVG 示例"
          path={BASE_SHAPES.target}
          color={BASE_COLORS.target}
          transform={transform}
        />
      </div>
    </div>
    <MorphStage transform={transform} />
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
        <MorphRow title={TRANSFORMED_META.label} transform={TRANSFORMED_META.transform} />
      </main>
    </div>
  );
}
