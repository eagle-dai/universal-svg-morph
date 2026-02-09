import { useEffect, useMemo, useRef } from "react";
import { ArrowLeft, Waves } from "lucide-react";
import { Timeline } from "animejs";
import {
  createColorLerp,
  createMorphEngine,
  createMorphInterpolator,
  buildStaticPathD,
} from "../../lib/svgMorphEngine.js";

const MORPH_CONFIG = {
  samples: 160,
  duration: 2200,
};

const BASE_SHAPES = {
  source:
    "M 100 18 C 122 24 138 40 150 60 C 168 72 178 92 176 114 C 174 138 158 154 140 166 C 124 178 104 186 84 182 C 62 178 42 164 32 144 C 20 124 18 102 26 82 C 34 60 50 38 72 26 C 82 20 92 16 100 18 Z",
  target:
    "M 100 24 L 132 36 L 164 62 L 172 98 L 160 132 L 132 156 L 100 176 L 68 156 L 40 132 L 28 98 L 36 62 L 68 36 Z",
};

const BASE_COLORS = {
  source: "#60A5FA",
  target: "#F97316",
};

// --- 1. 定义结构化的 Transform 数据 ---
const TRANSFORM_DATA = {
  source: { x: -45, y: 6, r: -28, cx: 100, cy: 100, s: 1 },
  target: { x: 38, y: -8, r: 30, cx: 100, cy: 100, s: 0.8 },
};

// 辅助：仅用于预览组件生成静态 Transform 字符串 (Logic 复用)
const getTransformString = ({ x, y, r, cx, cy, s }) =>
  `translate(${x} ${y}) rotate(${r} ${cx} ${cy}) scale(${s})`;

const TRANSFORMED_META = {
  label: "带 Transform",
  sourceTransform: getTransformString(TRANSFORM_DATA.source),
  targetTransform: getTransformString(TRANSFORM_DATA.target),
  config: TRANSFORM_DATA,
};

const SvgPreview = ({ label, path, color, transform }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
      <span>{label}</span>
      {transform ? (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
          transform
        </span>
      ) : null}
    </div>
    <svg viewBox="0 0 200 200" className="h-36 w-full">
      <path d={path} fill={color} stroke={color} transform={transform} />
    </svg>
  </div>
);

const MorphStage = ({ transformConfig }) => {
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
      createMorphInterpolator(BASE_SHAPES.source, BASE_SHAPES.target, {
        samples: MORPH_CONFIG.samples,
        optimize: true,
      }),
    [],
  );

  const colorData = useMemo(
    () => createColorLerp(BASE_COLORS.source, BASE_COLORS.target),
    [],
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
        <svg viewBox="0 0 200 200" className="h-48 w-full">
          <path
            ref={pathRef}
            // 初始状态由 renderStatic 接管，这里仅设置静态 fallback
            fill={BASE_COLORS.source}
            stroke={BASE_COLORS.source}
            d={buildStaticPathD(interpolator?.a || [], 1)}
          />
        </svg>
      </div>
    </div>
  );
};

const MorphRow = ({ title, transformMeta }) => {
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
            path={BASE_SHAPES.source}
            color={BASE_COLORS.source}
            transform={transformMeta?.sourceTransform}
          />
          <SvgPreview
            label="目标 SVG 示例"
            path={BASE_SHAPES.target}
            color={BASE_COLORS.target}
            transform={transformMeta?.targetTransform}
          />
        </div>
      </div>
      {/* 将数值配置 config 传给 Stage */}
      <MorphStage transformConfig={transformMeta?.config} />
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
        <MorphRow title="基础形态对比" transformMeta={null} />
        <MorphRow
          title={TRANSFORMED_META.label}
          transformMeta={TRANSFORMED_META}
        />
      </main>
    </div>
  );
}
