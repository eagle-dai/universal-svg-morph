import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useLayoutEffect,
  memo,
} from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  Cpu,
  Play,
  Settings2,
  Layers,
  ZapOff,
} from "lucide-react";
import { Timeline } from "animejs"; // 引入 Timeline
import {
  buildStaticPathD,
  createColorLerp,
  createMorphEngine,
  createMorphInterpolator,
} from "../../lib/svgMorphEngine.js";
import { ALL_SHAPES, SHAPE_LIBRARY } from "./shapeLibrary.js";

const DEMO_LAYOUT = {
  separationOffset: 28,
};

const offsetPoints = (points, dx = 0, dy = 0) => {
  return points.map((point) => ({
    x: point.x + dx,
    y: point.y + dy,
  }));
};

// --- 5. 路径组件 (使用 memo 锁定渲染) ---
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
    separationOffset,
  }) => {
    const pathRef = useRef(null);

    const interpolator = useMemo(() => {
      const baseInterpolator = createMorphInterpolator(startD, endD, {
        samples,
        optimize,
        isMassive,
      });
      if (!baseInterpolator || !separate) {
        return baseInterpolator;
      }
      return {
        a: offsetPoints(baseInterpolator.a, -separationOffset, 0),
        b: offsetPoints(baseInterpolator.b, separationOffset, 0),
      };
    }, [
      startD,
      endD,
      optimize,
      samples,
      isMassive,
      separate,
      separationOffset,
    ]);

    const colorData = useMemo(() => {
      return createColorLerp(startColor, endColor);
    }, [startColor, endColor]);

    useLayoutEffect(() => {
      if (pathRef.current && interpolator && onRegister) {
        const unregister = onRegister({
          dom: pathRef.current,
          data: interpolator,
          color: colorData,
          samples: samples,
        });
        return unregister;
      }
    }, [interpolator, colorData, onRegister, samples]);

    const initialD = useMemo(() => {
      if (!interpolator) return "";
      return buildStaticPathD(interpolator.a, 1);
    }, [interpolator]);

    return (
      <path
        ref={pathRef}
        d={initialD}
        fill={startColor}
        stroke={startColor}
        fillOpacity={0.8}
        strokeWidth={1}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ willChange: "d" }}
      />
    );
  },
);

// --- 6. 主应用 ---
export default function UniversalMorph({ onBack }) {
  const [startKey, setStartKey] = useState("menu");
  const [endKey, setEndKey] = useState("grid225");
  const [isPlaying, setIsPlaying] = useState(false);
  const [optimize, setOptimize] = useState(true);
  const [separate, setSeparate] = useState(false);
  const containerRef = useRef(null); // 用于演示 Timeline 控制其他元素

  const engineRef = useRef(null);
  // 全局 Timeline 实例引用，方便 cleanup
  const timelineRef = useRef(null);

  if (!engineRef.current) {
    engineRef.current = createMorphEngine({ duration: 2000 });
  }

  const handleRegister = useMemo(
    () => (item) => {
      return engineRef.current.register(item);
    },
    [],
  );

  const startData = ALL_SHAPES[startKey];
  const endData = ALL_SHAPES[endKey];

  const maxPaths = Math.max(startData.paths.length, endData.paths.length);
  const isMassive = maxPaths > 100;

  const staticSamples = isMassive ? 30 : maxPaths > 50 ? 60 : 120;
  const motionSampleStep = isMassive ? 2 : 1;

  // Cleanup
  useEffect(() => {
    return () => {
      if (timelineRef.current) timelineRef.current.pause();
    };
  }, []);

  const handleReset = (resetToFinal = false) => {
    if (timelineRef.current) timelineRef.current.pause();
    engineRef.current.renderStatic(resetToFinal ? 1 : 0, 1);
    setIsPlaying(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);

    // --- 在 JSX 中创建并编排 Timeline ---
    // Anime.js 4.x 语法
    const tl = new Timeline({
      // Timeline 级别的回调
      onComplete: () => {
        setIsPlaying(false);
        engineRef.current.renderStatic(1, 1);
      },
    });
    timelineRef.current = tl;

    // 1. 添加一个背景动画 (演示 Timeline 可以控制 DOM)
    // 假设我们想让容器先缩小一点点，蓄力
    if (containerRef.current) {
      tl.add(
        {
          targets: containerRef.current,
          scale: [1, 0.95],
          duration: 300,
          easing: "easeOutQuad",
        },
        0,
      ); // 在 0ms 开始
    }

    // 2. 将 Morph 引擎加入 Timeline
    // 我们设置 offset 为 200ms，让它在背景动画开始后不久才开始
    // 这展示了 "engine 可以传入 timeline 并在 jsx 中调整 offset" 的能力
    engineRef.current.play({
      timeline: tl,
      motionSampleStep,
      offset: 200, // <--- 这里调整偏移
    });

    // 3. 背景复原动画
    if (containerRef.current) {
      tl.add(
        {
          targets: containerRef.current,
          scale: [0.95, 1],
          duration: 800,
          easing: "easeOutElastic(1, .8)",
        },
        "-=600",
      ); // 提前 600ms 开始复原
    }

    // 4. 启动 Timeline
    tl.play();
  };

  const handleSwap = () => {
    const nextStart = endKey;
    const nextEnd = startKey;
    setStartKey(nextStart);
    setEndKey(nextEnd);
    handleReset(false);
  };

  const renderItems = Array.from({ length: maxPaths }).map((_, i) => {
    const sIndex = i % startData.paths.length;
    const eIndex = i % endData.paths.length;

    const sColorIndex = sIndex % startData.colors.length;
    const eColorIndex = eIndex % endData.colors.length;

    return {
      key: i,
      startD: startData.paths[sIndex],
      endD: endData.paths[eIndex],
      startColor: startData.colors[sColorIndex],
      endColor: endData.colors[eColorIndex],
    };
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-6 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-50 shadow-xl">
        <div>
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
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ZapOff className="text-emerald-400" />
              通用 SVG 变形引擎 V6 (Anime.js 4 Timeline)
            </h1>
          </div>
          <p className="text-slate-400 text-xs mt-2 flex items-center gap-2">
            <span className="text-emerald-400">Timeline Orchestration</span>
            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
            <span>JSX 控制偏移</span>
            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
            <span>背景缩放联动</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setOptimize(!optimize);
              handleReset(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              optimize
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                : "bg-slate-800 border-slate-700 text-slate-500"
            }`}
          >
            <Settings2 size={14} />
            {optimize ? "智能对齐: ON" : "智能对齐: OFF"}
          </button>

          <button
            onClick={() => {
              setSeparate(!separate);
              handleReset(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              separate
                ? "bg-blue-500/10 border-blue-500/50 text-blue-300"
                : "bg-slate-800 border-slate-700 text-slate-500"
            }`}
          >
            <Layers size={14} />
            {separate ? "源/目标分离: ON" : "源/目标分离: OFF"}
          </button>

          <button
            onClick={handleSwap}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border bg-slate-800 border-slate-700 text-slate-200 hover:border-blue-400/70 hover:text-blue-300"
          >
            <ArrowLeftRight size={14} />
            切换 Src / Dest
          </button>

          <button
            onClick={handlePlay}
            disabled={isPlaying}
            className={`px-8 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${
              isPlaying
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-emerald-500 text-slate-900 hover:bg-emerald-400 hover:scale-105 shadow-lg shadow-emerald-500/20"
            }`}
          >
            {isPlaying ? (
              "Morphing..."
            ) : (
              <>
                <Play size={16} fill="currentColor" /> Run Timeline
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full">
        {/* 左侧：选择器面板 */}
        <div className="flex-1 grid grid-cols-2 gap-6 overflow-y-auto max-h-[calc(100vh-140px)] pr-2 custom-scrollbar">
          <div className="space-y-6">
            <div className="sticky top-0 bg-slate-950 pb-2 z-10 border-b border-slate-800 mb-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block text-center">
                起始形状 (Start)
              </span>
            </div>
            {Object.entries(SHAPE_LIBRARY).map(([catKey, category]) => (
              <div key={catKey} className="mb-6">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2 px-1">
                  {category.title}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(category.items).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setStartKey(key);
                        handleReset(false);
                      }}
                      className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all border relative overflow-hidden ${
                        startKey === key
                          ? "bg-slate-800 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/50"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      <item.icon size={20} />
                      <span className="text-[10px] font-medium">
                        {item.label}
                      </span>
                      <span className="absolute top-1 right-2 text-[8px] opacity-40">
                        {item.paths.length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="sticky top-0 bg-slate-950 pb-2 z-10 border-b border-slate-800 mb-4">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block text-center">
                目标形状 (End)
              </span>
            </div>
            {Object.entries(SHAPE_LIBRARY).map(([catKey, category]) => (
              <div key={catKey} className="mb-6">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2 px-1">
                  {category.title}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(category.items).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setEndKey(key);
                        handleReset(false);
                      }}
                      className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all border relative overflow-hidden ${
                        endKey === key
                          ? "bg-slate-800 border-blue-500 text-blue-400 ring-1 ring-blue-500/50"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      <item.icon size={20} />
                      <span className="text-[10px] font-medium">
                        {item.label}
                      </span>
                      <span className="absolute top-1 right-2 text-[8px] opacity-40">
                        {item.paths.length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：舞台 */}
        <div className="lg:w-[560px] flex flex-col items-center sticky top-24 h-fit">
          {/* 添加 ref 到 container 以便 Timeline 控制 */}
          <div
            ref={containerRef}
            className="relative w-full aspect-square bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center justify-center shadow-2xl backdrop-blur-sm overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                backgroundPosition: "center",
              }}
            ></div>

            <svg
              viewBox="0 0 200 200"
              className="w-full h-full overflow-visible relative z-10 p-10"
              style={{ filter: "drop-shadow(0 0 15px rgba(0,0,0,0.5))" }}
            >
              {renderItems.map((item) => (
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
                  separationOffset={DEMO_LAYOUT.separationOffset}
                />
              ))}
            </svg>
          </div>

          <div className="w-full mt-6 bg-slate-900 rounded-xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
              <Cpu size={12} /> V6 Anime.js Timeline 统计
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950 rounded p-2">
                <div className="text-[10px] text-slate-500">活跃元素</div>
                <div className="text-sm font-mono text-emerald-400">
                  {maxPaths}
                </div>
              </div>
              <div className="bg-slate-950 rounded p-2">
                <div className="text-[10px] text-slate-500">控制方式</div>
                <div className="text-sm font-mono text-blue-400">
                  External Timeline
                </div>
              </div>
              <div className="bg-slate-950 rounded p-2">
                <div className="text-[10px] text-slate-500">
                  Timeline Offset
                </div>
                <div className="text-sm font-mono text-purple-400">200ms</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
