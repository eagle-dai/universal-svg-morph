import { useEffect, useMemo, useRef } from "react";
import { ArrowLeft, Waves } from "lucide-react";
import { Timeline } from "animejs";
import {
  buildAnimatedPathD,
  buildStaticPathD,
  createColorLerp,
  createMorphInterpolator,
  lerpColor,
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
// 显式定义所有参数，避免插值歧义
const TRANSFORM_DATA = {
  source: { x: -45, y: 6, r: -28, cx: 100, cy: 100, s: 1 },
  target: { x: 38, y: -8, r: 30, cx: 100, cy: 100, s: 0.8 },
};

// 辅助：生成标准的 SVG transform 字符串
const getTransformString = ({ x, y, r, cx, cy, s }) =>
  `translate(${x} ${y}) rotate(${r} ${cx} ${cy}) scale(${s})`;

// 辅助：简单的线性插值
const lerp = (start, end, t) => start + (end - start) * t;

const TRANSFORMED_META = {
  label: "带 Transform",
  // 为预览图生成静态字符串
  sourceTransform: getTransformString(TRANSFORM_DATA.source),
  targetTransform: getTransformString(TRANSFORM_DATA.target),
  // 将原始数值配置传给动画组件
  config: TRANSFORM_DATA,
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

const MorphStage = ({ transformConfig }) => {
  const pathRef = useRef(null);
  const timelineRef = useRef(null);

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

  // 初始化：设置静态初始状态
  useEffect(() => {
    if (!pathRef.current || !interpolator) return;

    // 1. 设置初始 Path 和 Color
    pathRef.current.setAttribute("d", buildStaticPathD(interpolator.a, 1));
    pathRef.current.setAttribute("fill", BASE_COLORS.source);
    pathRef.current.setAttribute("stroke", BASE_COLORS.source);

    // 2. 设置初始 Transform
    if (transformConfig) {
      pathRef.current.setAttribute(
        "transform",
        getTransformString(transformConfig.source),
      );
    } else {
      pathRef.current.removeAttribute("transform");
    }

    return () => {
      if (timelineRef.current) timelineRef.current.pause();
    };
  }, [colorData, interpolator, transformConfig]);

  const handlePlay = () => {
    if (!pathRef.current || !interpolator) return;
    if (timelineRef.current) timelineRef.current.pause();

    const tl = new Timeline({
      duration: MORPH_CONFIG.duration,
      easing: "inOutQuad",
    });

    // 使用代理对象 t (0 -> 1)，在 onUpdate 中手动计算所有属性
    const proxy = { t: 0 };

    tl.add(
      proxy,
      {
        t: 1,
        onUpdate: () => {
          const progress = proxy.t;

          // A. Path & Color 插值
          const d = buildAnimatedPathD(
            interpolator.a,
            interpolator.b,
            progress,
            1,
          );
          const currentColor = lerpColor(colorData, progress);
          pathRef.current.setAttribute("d", d);
          pathRef.current.setAttribute("fill", currentColor);
          pathRef.current.setAttribute("stroke", currentColor);

          // B. Transform 手动数值插值 (仅当配置存在时)
          if (transformConfig) {
            const { source: s, target: e } = transformConfig;

            // 计算当前帧的各项数值
            const currentTransform = {
              x: lerp(s.x, e.x, progress),
              y: lerp(s.y, e.y, progress),
              r: lerp(s.r, e.r, progress),
              cx: s.cx, // 中心点通常保持不变，或者也可以 lerp
              cy: s.cy,
              s: lerp(s.s, e.s, progress),
            };

            // 拼装字符串并应用
            pathRef.current.setAttribute(
              "transform",
              getTransformString(currentTransform),
            );
          }
        },
      },
      0,
    );

    tl.play();
    timelineRef.current = tl;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Morph 动画
        </div>
        <button
          type="button"
          onClick={handlePlay}
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
            // 初始静态渲染也使用同样的生成逻辑
            transform={
              transformConfig
                ? getTransformString(transformConfig.source)
                : undefined
            }
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
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Waves size={16} className="text-emerald-400" />
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
              <h1 className="text-2xl font-semibold text-white">
                基础 Morph 测试页
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              用最小示例验证 SVG 路径在不同条件下的 Morph 动画效果。
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
