import {
  Grid,
  Menu,
  Circle,
  Home,
  Cloud,
  Smile,
  Bot,
  Ghost,
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
  Zap,
  Layers,
} from "lucide-react";

const generateCitySkyline = () => {
  let d = "M 10,180 ";
  let x = 10;
  while (x < 190) {
    const width = 10 + Math.random() * 20;
    const height = 40 + Math.random() * 100;
    d += `L ${x},${180 - height} L ${x + width},${180 - height} L ${
      x + width
    },180 `;
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

const generateDiamond = () => {
  return ["M 100,20 L 180,100 L 100,180 L 20,100 Z"];
};

const generateSwarm = (count) => {
  const paths = [];
  for (let i = 0; i < count; i++) {
    const cx = 20 + Math.random() * 160;
    const cy = 20 + Math.random() * 160;
    const size = 2 + Math.random() * 4;
    if (Math.random() > 0.5) {
      paths.push(
        `M ${cx},${cy} m -${size},0 a ${size},${size} 0 1,0 ${
          size * 2
        },0 a ${size},${size} 0 1,0 -${size * 2},0`,
      );
    } else {
      paths.push(
        `M ${cx},${cy - size} L ${cx + size},${cy} L ${cx},${
          cy + size
        } L ${cx - size},${cy} Z`,
      );
    }
  }
  return paths;
};

const generateMountainRange = () => {
  return [
    "M 20,160 L 70,80 L 120,160 Z",
    "M 80,160 L 130,60 L 180,160 Z",
    "M 45,140 L 70,110 L 95,140 Z",
  ];
};

const generateSmileFace = () => {
  return [
    "M 100,20 a 80,80 0 1,0 0.01,0 Z",
    "M 70,80 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0",
    "M 130,80 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0",
    "M 60,120 Q 100,150 140,120 Q 100,165 60,120 Z",
  ];
};

const generateRobot = () => {
  return [
    "M 50,60 L 150,60 L 150,140 L 50,140 Z",
    "M 100,40 L 100,60",
    "M 96,34 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0",
    "M 75,90 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0",
    "M 105,90 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0",
    "M 80,115 L 120,115 L 120,125 L 80,125 Z",
  ];
};

const generateGhost = () => {
  return [
    "M 50,70 Q 100,20 150,70 L 150,150 Q 135,140 120,150 Q 105,160 90,150 Q 75,140 60,150 Q 45,160 50,140 Z",
    "M 75,85 a 7,7 0 1,0 14,0 a 7,7 0 1,0 -14,0",
    "M 111,85 a 7,7 0 1,0 14,0 a 7,7 0 1,0 -14,0",
    "M 80,115 Q 100,130 120,115 Q 100,140 80,115 Z",
  ];
};

const generateAnchor = () => {
  return [
    "M 100,30 a 15,15 0 1,0 0.01,0 Z",
    "M 95,45 L 105,45 L 105,130 L 95,130 Z",
    "M 60,85 L 140,85 L 140,95 L 60,95 Z",
    "M 40,120 Q 100,170 160,120 L 150,120 Q 100,150 50,120 Z",
  ];
};

const generateThermometer = () => {
  return [
    "M 100,150 a 20,20 0 1,0 0.01,0 Z",
    "M 90,40 L 110,40 L 110,150 L 90,150 Z",
    "M 96,70 L 104,70 L 104,150 L 96,150 Z",
  ];
};

const generateWind = () => {
  return [
    "M 30,80 Q 80,55 130,80 T 190,80",
    "M 20,110 Q 70,90 120,110 T 180,110",
    "M 40,140 Q 80,125 120,140 T 170,140",
  ];
};

const generateLayers = () => {
  return [
    "M 40,60 L 100,30 L 160,60 L 100,90 Z",
    "M 40,90 L 100,60 L 160,90 L 100,120 Z",
    "M 40,120 L 100,90 L 160,120 L 100,150 Z",
  ];
};

const generateRipples = () => {
  return [
    "M 100,100 m -15,0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0",
    "M 100,100 m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0",
    "M 100,100 m -55,0 a 55,55 0 1,0 110,0 a 55,55 0 1,0 -110,0",
  ];
};

const generateWaveField = () => {
  return [
    "M 20,70 Q 60,40 100,70 T 180,70",
    "M 20,110 Q 60,80 100,110 T 180,110",
    "M 20,150 Q 60,120 100,150 T 180,150",
  ];
};

export const SHAPE_LIBRARY = {
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
      diamond: {
        label: "菱形 (1)",
        icon: Circle,
        paths: generateDiamond(),
        colors: ["#38BDF8"],
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
      mountain: {
        label: "山脉 (3)",
        icon: Home,
        paths: generateMountainRange(),
        colors: ["#10B981", "#34D399", "#059669"],
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
      grid400: {
        label: "400 元素",
        icon: Grid,
        paths: generateGrid(20, 20),
        colors: ["#F87171", "#FB7185", "#F43F5E"],
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
      ripples: {
        label: "涟漪 (3)",
        icon: Circle,
        paths: generateRipples(),
        colors: ["#22D3EE", "#38BDF8", "#7DD3FC"],
      },
      wave: {
        label: "波纹 (3)",
        icon: Wind,
        paths: generateWaveField(),
        colors: ["#A78BFA", "#8B5CF6", "#C4B5FD"],
      },
    },
  },
  iconic: {
    title: "符号与图标",
    items: {
      cloud: {
        label: "云朵 (1)",
        icon: Cloud,
        paths: [
          "M 60,130 Q 40,130 40,110 Q 40,90 60,90 Q 65,70 85,70 Q 95,50 120,55 Q 135,40 155,50 Q 175,60 170,80 Q 190,90 180,110 Q 175,130 150,130 Z",
        ],
        colors: ["#38BDF8"],
      },
      smile: {
        label: "笑脸 (4)",
        icon: Smile,
        paths: generateSmileFace(),
        colors: ["#FDE047", "#F59E0B", "#FBBF24", "#FACC15"],
      },
      bot: {
        label: "机器人 (6)",
        icon: Bot,
        paths: generateRobot(),
        colors: [
          "#22C55E",
          "#16A34A",
          "#4ADE80",
          "#15803D",
          "#86EFAC",
          "#22C55E",
        ],
      },
      ghost: {
        label: "幽灵 (4)",
        icon: Ghost,
        paths: generateGhost(),
        colors: ["#A855F7", "#C084FC", "#E9D5FF", "#9333EA"],
      },
      anchor: {
        label: "锚点 (4)",
        icon: Anchor,
        paths: generateAnchor(),
        colors: ["#0EA5E9", "#0284C7", "#0369A1", "#38BDF8"],
      },
      thermometer: {
        label: "温度计 (3)",
        icon: Thermometer,
        paths: generateThermometer(),
        colors: ["#F97316", "#FB7185", "#EF4444"],
      },
      activity: {
        label: "心电 (1)",
        icon: Activity,
        paths: [
          "M 30,120 L 60,120 L 80,80 L 100,140 L 120,100 L 140,120 L 170,120",
        ],
        colors: ["#F43F5E"],
      },
      layers: {
        label: "图层 (3)",
        icon: Layers,
        paths: generateLayers(),
        colors: ["#8B5CF6", "#6366F1", "#A5B4FC"],
      },
      wind: {
        label: "风 (3)",
        icon: Wind,
        paths: generateWind(),
        colors: ["#38BDF8", "#7DD3FC", "#0EA5E9"],
      },
      zap: {
        label: "闪电 (1)",
        icon: Zap,
        paths: ["M 110,20 L 70,110 L 110,110 L 90,180 L 150,80 L 110,80 Z"],
        colors: ["#FACC15"],
      },
    },
  },
};

export const ALL_SHAPES = Object.values(SHAPE_LIBRARY).reduce(
  (collection, category) => {
    Object.entries(category.items).forEach(([key, value]) => {
      collection[key] = value;
    });
    return collection;
  },
  {},
);
