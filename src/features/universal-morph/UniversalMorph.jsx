import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useLayoutEffect,
  memo,
} from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  Grid,
  Menu,
  X,
  Circle,
  Settings2,
  Zap,
  Layers,
  Home,
  Cloud,
  Smile,
  Bot,
  Ghost,
  Grip,
  Feather,
  Hexagon,
  Aperture,
  Thermometer,
  Activity,
  Cpu,
  Globe,
  Anchor,
  Box,
  Sparkles,
  Wind,
  ZapOff,
} from "lucide-react";
import { Timeline } from "animejs"; // 引入 Timeline
import {
  buildStaticPathD,
  createColorLerp,
  createMorphEngine,
  createMorphInterpolator,
} from "../../lib/svgMorphEngine.js";

// --- 1. 复杂路径生成器 (保持不变) ---
const generateCitySkyline = () => {
  let d = "M 10,180 ";
  let x = 10;
  while (x < 190) {
    const width = 10 + Math.random() * 20;
    const height = 40 + Math.random() * 100;
    d += `L ${x},${180 - height} L ${x + width},${180 - height} L ${x + width},180 `;
    x += width;
  }
  d += "Z";
  return [d, "M 30,30 Q 50,10 70,30 T 110,30", "M 140,50 Q 150,40 160,50"];
};

const generateFlower = () => {
  const paths = [];
  const center = 100;
  const petals = 8;
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2;
    const r1 = 30;
    const r2 = 90;
    const cp1x = center + Math.cos(angle - 0.2) * r1;
    const cp1y = center + Math.sin(angle - 0.2) * r1;
    const tipx = center + Math.cos(angle) * r2;
    const tipy = center + Math.sin(angle) * r2;
    const cp2x = center + Math.cos(angle + 0.2) * r1;
    const cp2y = center + Math.sin(angle + 0.2) * r1;
    paths.push(
      `M ${center},${center} Q ${cp1x},${cp1y} ${tipx},${tipy} Q ${cp2x},${cp2y} ${center},${center}`,
    );
  }
  paths.push(`M 100,100 m -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0`);
  return paths;
};

const generateCircuit = () => {
  return [
    "M 40,40 L 90,40 L 90,90 M 85,90 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0",
    "M 160,160 L 110,160 L 110,110 M 105,110 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0",
    "M 160,40 L 130,40 L 130,160 L 160,160",
    "M 40,160 L 70,160 L 70,40 L 40,40",
    "M 80,80 L 120,80 L 120,120 L 80,120 Z",
  ];
};

const generateCalligraphy = () => {
  return [
    "M 90,30 Q 100,20 110,30 Q 120,40 100,50",
    "M 40,60 Q 100,55 160,60",
    "M 100,60 Q 80,100 40,160",
    "M 100,60 Q 120,100 160,160 L 170,155",
  ];
};

const generateGrid = (rows, cols) => {
  const paths = [];
  const padding = 20;
  const width = 160;
  const height = 160;
  const cellW = width / cols;
  const cellH = height / rows;
  const gap = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = padding + c * cellW + gap;
      const y = padding + r * cellH + gap;
      const w = cellW - gap * 2;
      const h = cellH - gap * 2;
      paths.push(
        `M ${x},${y} L ${x + w},${y} L ${x + w},${y + h} L ${x},${y + h} Z`,
      );
    }
  }
  return paths;
};

const generateSwarm = (count) => {
  const paths = [];
  for (let i = 0; i < count; i++) {
    const cx = 20 + Math.random() * 160;
    const cy = 20 + Math.random() * 160;
    const size = 2 + Math.random() * 4;
    if (Math.random() > 0.5) {
      paths.push(
        `M ${cx},${cy} m -${size},0 a ${size},${size} 0 1,0 ${size * 2},0 a ${size},${size} 0 1,0 -${size * 2},0`,
      );
    } else {
      paths.push(
        `M ${cx},${cy - size} L ${cx + size},${cy} L ${cx},${cy + size} L ${cx - size},${cy} Z`,
      );
    }
  }
  return paths;
};

// --- 3. 图形库 ---
const SHAPE_LIBRARY = {
  basic: {
    title: "基础几何",
    items: {
      circle: {
        label: "圆形 (1)",
        icon: Circle,
        paths: ["M 100, 100 m -80, 0 a 80,80 0 1,0 160,0 a 80,80 0 1,0 -160,0"],
        colors: ["#3B82F6"],
      },
      menu: {
        label: "菜单 (3)",
        icon: Menu,
        paths: [
          "M 40,60 L 160,60 L 160,80 L 40,80 Z",
          "M 40,110 L 160,110 L 160,130 L 40,130 Z",
          "M 40,160 L 160,160 L 160,180 L 40,180 Z",
        ],
        colors: ["#64748B", "#475569", "#334155"],
      },
      polygon: {
        label: "六边形 (1)",
        icon: Hexagon,
        paths: ["M 100,20 L 170,60 L 170,140 L 100,180 L 30,140 L 30,60 Z"],
        colors: ["#F59E0B"],
      },
    },
  },
  complex: {
    title: "复杂结构",
    items: {
      city: {
        label: "天际线 (4)",
        icon: Home,
        paths: generateCitySkyline(),
        colors: ["#3730A3", "#4338CA", "#4F46E5"],
      },
      flower: {
        label: "曼陀罗 (9)",
        icon: Aperture,
        paths: generateFlower(),
        colors: [
          "#EC4899",
          "#D946EF",
          "#A855F7",
          "#8B5CF6",
          "#EC4899",
          "#D946EF",
          "#A855F7",
          "#8B5CF6",
          "#F43F5E",
        ],
      },
      circuit: {
        label: "电路板 (5)",
        icon: Cpu,
        paths: generateCircuit(),
        colors: ["#0EA5E9", "#0284C7", "#0369A1", "#075985", "#0C4A6E"],
      },
    },
  },
  stress: {
    title: "压力测试 (Performance)",
    items: {
      grid100: {
        label: "100 元素",
        icon: Grid,
        paths: generateGrid(10, 10),
        colors: ["#F472B6", "#EC4899", "#DB2777"],
      },
      swarm: {
        label: "150 元素",
        icon: Sparkles,
        paths: generateSwarm(150),
        colors: ["#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#93C5FD"],
      },
      grid225: {
        label: "225 元素",
        icon: Box,
        paths: generateGrid(15, 15),
        colors: ["#10B981", "#34D399", "#059669"],
      },
    },
  },
  abstract: {
    title: "抽象",
    items: {
      calligraphy: {
        label: "书法 (4)",
        icon: Feather,
        paths: generateCalligraphy(),
        colors: ["#1F2937", "#374151", "#4B5563", "#6B7280"],
      },
      globe: {
        label: "经纬网 (5)",
        icon: Globe,
        paths: [
          "M 100,100 m -90,0 a 90,90 0 1,0 180,0 a 90,90 0 1,0 -180,0",
          "M 10,100 Q 100,180 190,100",
          "M 10,100 Q 100,20 190,100",
          "M 100,10 Q 40,100 100,190",
          "M 100,10 Q 160,100 100,190",
        ],
        colors: ["#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"],
      },
    },
  },
};

const ALL_SHAPES = {};
Object.values(SHAPE_LIBRARY).forEach((category) => {
  Object.entries(category.items).forEach(([key, value]) => {
    ALL_SHAPES[key] = value;
  });
});

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
  }) => {
    const pathRef = useRef(null);

    const interpolator = useMemo(() => {
      return createMorphInterpolator(startD, endD, {
        samples,
        optimize,
        isMassive,
      });
    }, [startD, endD, optimize, samples, isMassive]);

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
      engineRef.current.stop();
      if (timelineRef.current) timelineRef.current.pause();
    };
  }, []);

  const handleReset = (resetToFinal = false) => {
    if (timelineRef.current) timelineRef.current.pause();
    engineRef.current.stop();
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
        <div className="lg:w-[500px] flex flex-col items-center sticky top-24 h-fit">
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
              className="w-full h-full overflow-visible relative z-10 p-8"
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
