import { useEffect, useMemo, useRef } from "react";
import { ArrowLeft, Waves } from "lucide-react";
import { Timeline } from "animejs";
import {
  createColorLerp,
  createMorphEngine,
  createMorphInterpolator,
  buildStaticPathD,
} from "../../lib/svgMorphEngine.js";
import { morphRows } from "./svgCases.js";

const MORPH_CONFIG = {
  samples: 160,
  duration: 2200,
};

const SvgPreview = ({ label, path, color, transform, viewBox, rawSvg }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
      <span>{label}</span>
      {transform ? (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
          transform
        </span>
      ) : null}
    </div>
    {rawSvg ? (
      <div
        className="h-36 w-full [&_svg]:h-full [&_svg]:w-full"
        dangerouslySetInnerHTML={{ __html: rawSvg }}
      />
    ) : (
      <svg viewBox={viewBox} className="h-36 w-full">
        <path d={path} fill={color} stroke={color} transform={transform} />
      </svg>
    )}
  </div>
);

const MorphStage = ({ transformConfig, shapes, colors, viewBox }) => {
  const pathRef = useRef(null);
  const timelineRef = useRef(null);

  // 实例化 Engine
  const engineRef = useRef(
    createMorphEngine({
      duration: MORPH_CONFIG.duration,
    }),
  );

  const interpolator = useMemo(
    () =>
      createMorphInterpolator(shapes.source, shapes.target, {
        samples: MORPH_CONFIG.samples,
        optimize: true,
      }),
    [shapes.source, shapes.target],
  );

  const colorData = useMemo(
    () => createColorLerp(colors.source, colors.target),
    [colors.source, colors.target],
  );

  // 注册逻辑：将 Transform 配置传给 Engine
  useEffect(() => {
    if (!pathRef.current || !interpolator) return;

    // 构造 Engine 需要的 Transform 对象格式
    const transformData = transformConfig
      ? { start: transformConfig.source, end: transformConfig.target }
      : null;

    const unregister = engineRef.current.register({
      dom: pathRef.current,
      data: interpolator,
      color: colorData,
      samples: MORPH_CONFIG.samples,
      transform: transformData, // <--- 关键修改：统一 API
    });

    // 初始渲染静态帧
    engineRef.current.renderStatic(0);

    return () => {
      unregister();
      if (timelineRef.current) timelineRef.current.pause();
    };
  }, [colorData, interpolator, transformConfig]);

  const handlePlay = () => {
    if (!pathRef.current || !interpolator) return;
    if (timelineRef.current) timelineRef.current.pause();

    const tl = new Timeline({
      duration: MORPH_CONFIG.duration,
      easing: "inOutQuad", // Engine 内部默认 linear，这里通过 Timeline 控制 easing
    });

    // 使用 Engine 统一驱动
    engineRef.current.play({
      timeline: tl,
      offset: 0,
    });

    tl.play();
    timelineRef.current = tl;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
          Morph 动画
        </div>
        <button
          type="button"
          onClick={handlePlay}
          className="rounded-full border border-emerald-500/40 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:border-emerald-500 hover:text-emerald-800"
        >
          开始 Morph
        </button>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <svg viewBox={viewBox} className="h-48 w-full">
          <path
            ref={pathRef}
            // 初始状态由 renderStatic 接管，这里仅设置静态 fallback
            fill={colors.source}
            stroke={colors.source}
            d={buildStaticPathD(interpolator?.a || [], 1)}
          />
        </svg>
      </div>
    </div>
  );
};

const MorphRow = ({
  title,
  transformMeta,
  shapes,
  colors,
  viewBox,
  sourceSvg,
  targetSvg,
}) => {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Waves size={16} className="text-emerald-600" />
          {title}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SvgPreview
            label="源 SVG 示例"
            path={shapes.source}
            color={colors.source}
            viewBox={viewBox}
            transform={transformMeta?.sourceTransform}
            rawSvg={sourceSvg}
          />
          <SvgPreview
            label="目标 SVG 示例"
            path={shapes.target}
            color={colors.target}
            viewBox={viewBox}
            transform={transformMeta?.targetTransform}
            rawSvg={targetSvg}
          />
        </div>
      </div>
      {/* 将数值配置 config 传给 Stage */}
      <MorphStage
        transformConfig={transformMeta?.config}
        shapes={shapes}
        colors={colors}
        viewBox={viewBox}
      />
    </div>
  );
};

export default function BasicMorphTest({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 px-6 py-5">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
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
              <h1 className="text-2xl font-semibold text-slate-900">
                基础 Morph 测试页
              </h1>
            </div>
            <p className="text-sm text-slate-600">
              用最小示例验证 SVG 路径在不同条件下的 Morph 动画效果 (Unified
              Engine)。
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        {morphRows.map((row) => (
          <MorphRow key={row.title} {...row} />
        ))}
      </main>
    </div>
  );
}
