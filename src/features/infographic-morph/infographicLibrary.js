const VIEWBOX_SIZE = 200;

const PALETTE = {
  amber: ['#fbbf24', '#f59e0b', '#fcd34d', '#fef3c7'],
  cyan: ['#22d3ee', '#38bdf8', '#0ea5e9', '#cffafe'],
  violet: ['#a78bfa', '#8b5cf6', '#c4b5fd', '#ede9fe'],
  emerald: ['#34d399', '#10b981', '#6ee7b7', '#d1fae5'],
  rose: ['#fb7185', '#f43f5e', '#fda4af', '#ffe4e6'],
  sky: ['#38bdf8', '#0ea5e9', '#7dd3fc', '#e0f2fe'],
  lime: ['#a3e635', '#84cc16', '#bef264', '#f7fee7'],
  orange: ['#fb923c', '#f97316', '#fdba74', '#ffedd5'],
  indigo: ['#818cf8', '#6366f1', '#a5b4fc', '#e0e7ff'],
  teal: ['#2dd4bf', '#14b8a6', '#5eead4', '#ccfbf1']
};

const rectPath = (x, y, w, h) => `M ${x} ${y} h ${w} v ${h} h ${-w} Z`;

const roundedRectPath = (x, y, w, h, r) => {
  if (!r) {
    return rectPath(x, y, w, h);
  }
  const radius = Math.min(r, w / 2, h / 2);
  return [
    `M ${x + radius} ${y}`,
    `h ${w - 2 * radius}`,
    `a ${radius} ${radius} 0 0 1 ${radius} ${radius}`,
    `v ${h - 2 * radius}`,
    `a ${radius} ${radius} 0 0 1 ${-radius} ${radius}`,
    `h ${-(w - 2 * radius)}`,
    `a ${radius} ${radius} 0 0 1 ${-radius} ${-radius}`,
    `v ${-(h - 2 * radius)}`,
    `a ${radius} ${radius} 0 0 1 ${radius} ${-radius}`,
    'Z'
  ].join(' ');
};

const circlePath = (cx, cy, r) =>
  `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${
    -r * 2
  } 0`;

const trianglePath = (points) =>
  `M ${points[0][0]} ${points[0][1]} L ${points
    .slice(1)
    .map(([x, y]) => `${x} ${y}`)
    .join(' L ')} Z`;

const pieSlicePath = (cx, cy, r, startAngle, endAngle) => {
  const toPoint = (angle) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const [startX, startY] = toPoint(endAngle);
  const [endX, endY] = toPoint(startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    `M ${cx} ${cy}`,
    `L ${startX} ${startY}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${endX} ${endY}`,
    'Z'
  ].join(' ');
};

const makeSequenceCards = () => {
  const line = roundedRectPath(96, 24, 8, 152, 4);
  const nodes = [40, 80, 120, 160].flatMap((y) => [
    circlePath(100, y, 10),
    roundedRectPath(118, y - 10, 60, 20, 8)
  ]);
  return [line, ...nodes];
};

const makeStepCurve = () => {
  const steps = [
    roundedRectPath(24, 120, 40, 26, 10),
    roundedRectPath(68, 95, 40, 26, 10),
    roundedRectPath(112, 70, 40, 26, 10),
    roundedRectPath(156, 45, 20, 26, 10)
  ];
  const rails = [
    roundedRectPath(44, 108, 24, 6, 3),
    roundedRectPath(88, 83, 24, 6, 3),
    roundedRectPath(132, 58, 24, 6, 3)
  ];
  return [...steps, ...rails];
};

const makeRingCycle = () => {
  const slices = [
    pieSlicePath(100, 90, 44, 0, 70),
    pieSlicePath(100, 90, 44, 70, 140),
    pieSlicePath(100, 90, 44, 140, 210),
    pieSlicePath(100, 90, 44, 210, 280),
    pieSlicePath(100, 90, 44, 280, 360)
  ];
  const inner = circlePath(100, 90, 24);
  const label = roundedRectPath(60, 150, 80, 18, 9);
  return [...slices, inner, label];
};

const makeMatrix = () => {
  const cards = [
    roundedRectPath(28, 40, 64, 36, 10),
    roundedRectPath(108, 40, 64, 36, 10),
    roundedRectPath(28, 88, 64, 36, 10),
    roundedRectPath(108, 88, 64, 36, 10)
  ];
  const labels = [
    roundedRectPath(36, 50, 48, 6, 3),
    roundedRectPath(116, 50, 48, 6, 3),
    roundedRectPath(36, 98, 48, 6, 3),
    roundedRectPath(116, 98, 48, 6, 3)
  ];
  return [...cards, ...labels];
};

const makeMountain = () => {
  const mountain1 = trianglePath([
    [24, 150],
    [70, 70],
    [116, 150]
  ]);
  const mountain2 = trianglePath([
    [84, 150],
    [130, 60],
    [176, 150]
  ]);
  const base = roundedRectPath(24, 150, 152, 12, 6);
  const sun = circlePath(150, 48, 10);
  return [mountain1, mountain2, base, sun];
};

const makeBarChart = () => {
  const bars = [
    roundedRectPath(30, 110, 24, 50, 6),
    roundedRectPath(64, 90, 24, 70, 6),
    roundedRectPath(98, 70, 24, 90, 6),
    roundedRectPath(132, 80, 24, 80, 6),
    roundedRectPath(166, 100, 24, 60, 6)
  ];
  const base = roundedRectPath(24, 160, 168, 8, 4);
  return [...bars, base];
};

const makeProsCons = () => {
  const leftArrow = trianglePath([
    [24, 90],
    [76, 60],
    [76, 120]
  ]);
  const rightArrow = trianglePath([
    [176, 90],
    [124, 60],
    [124, 120]
  ]);
  const center = roundedRectPath(88, 70, 24, 40, 8);
  const labels = [
    roundedRectPath(24, 130, 72, 18, 9),
    roundedRectPath(104, 130, 72, 18, 9)
  ];
  return [leftArrow, rightArrow, center, ...labels];
};

const makeVenn = () => {
  const left = circlePath(80, 100, 32);
  const right = circlePath(120, 100, 32);
  const labels = [
    roundedRectPath(40, 48, 60, 12, 6),
    roundedRectPath(100, 48, 60, 12, 6),
    roundedRectPath(70, 140, 60, 12, 6)
  ];
  return [left, right, ...labels];
};

const makeQuadrant = () => {
  const blocks = [
    roundedRectPath(28, 40, 68, 48, 12),
    roundedRectPath(104, 40, 68, 48, 12),
    roundedRectPath(28, 100, 68, 48, 12),
    roundedRectPath(104, 100, 68, 48, 12)
  ];
  const axis = [
    roundedRectPath(96, 32, 8, 136, 4),
    roundedRectPath(20, 92, 160, 8, 4)
  ];
  return [...blocks, ...axis];
};

const makeSwot = () => {
  const columns = [
    roundedRectPath(22, 36, 40, 90, 10),
    roundedRectPath(64, 36, 40, 90, 10),
    roundedRectPath(106, 36, 40, 90, 10),
    roundedRectPath(148, 36, 30, 90, 10)
  ];
  const header = roundedRectPath(22, 20, 156, 12, 6);
  const footer = roundedRectPath(22, 132, 156, 18, 9);
  return [...columns, header, footer];
};

export const INFOGRAPHIC_LIBRARY = [
  {
    id: 'sequence',
    title: '顺序型节点',
    description: '顺序型时间线模板，强调阶段与节点叙事。',
    tags: ['顺序型', '时间线', '节点'],
    stats: { layers: 9, nodes: 4, blocks: 4 },
    colors: PALETTE.amber,
    paths: makeSequenceCards()
  },
  {
    id: 'step',
    title: '阶梯流程',
    description: '阶梯式上升布局，适合展示成长路径。',
    tags: ['顺序型', '阶梯', '流程'],
    stats: { layers: 7, nodes: 4, blocks: 3 },
    colors: PALETTE.cyan,
    paths: makeStepCurve()
  },
  {
    id: 'cycle',
    title: '环形循环',
    description: '环形闭环结构，突出循环与迭代。',
    tags: ['顺序型', '循环', '环形'],
    stats: { layers: 7, nodes: 5, blocks: 1 },
    colors: PALETTE.violet,
    paths: makeRingCycle()
  },
  {
    id: 'matrix',
    title: '栅格矩阵',
    description: '矩阵卡片布局，适合分类与对照信息。',
    tags: ['顺序型', '矩阵', '卡片'],
    stats: { layers: 8, nodes: 4, blocks: 4 },
    colors: PALETTE.rose,
    paths: makeMatrix()
  },
  {
    id: 'mountain',
    title: '山峰趋势',
    description: '山峰式趋势图，强调阶段起伏与对比。',
    tags: ['顺序型', '趋势', '山峰'],
    stats: { layers: 4, nodes: 2, blocks: 1 },
    colors: PALETTE.emerald,
    paths: makeMountain()
  },
  {
    id: 'bar',
    title: '柱状对比',
    description: '纵向柱状布局，用于强调强弱与排名。',
    tags: ['对比型', '柱状', '排名'],
    stats: { layers: 6, nodes: 5, blocks: 1 },
    colors: PALETTE.orange,
    paths: makeBarChart()
  },
  {
    id: 'pros-cons',
    title: '优劣对比',
    description: '正反对比动线，适合呈现观点差异。',
    tags: ['对比型', '优劣', '观点'],
    stats: { layers: 5, nodes: 2, blocks: 2 },
    colors: PALETTE.indigo,
    paths: makeProsCons()
  },
  {
    id: 'venn',
    title: '维恩关系',
    description: '交集关系展示，体现共同与差异部分。',
    tags: ['对比型', '关系', '交集'],
    stats: { layers: 5, nodes: 2, blocks: 3 },
    colors: PALETTE.teal,
    paths: makeVenn()
  },
  {
    id: 'quadrant',
    title: '四象限',
    description: '四象限分布，用于定位优先级与策略。',
    tags: ['四象限', '分布', '策略'],
    stats: { layers: 6, nodes: 4, blocks: 2 },
    colors: PALETTE.sky,
    paths: makeQuadrant()
  },
  {
    id: 'swot',
    title: 'SWOT 分析',
    description: 'SWOT 结构矩阵，适合战略拆解。',
    tags: ['对比型', 'SWOT', '战略'],
    stats: { layers: 6, nodes: 4, blocks: 2 },
    colors: PALETTE.lime,
    paths: makeSwot()
  }
];

export const INFOGRAPHIC_MAP = INFOGRAPHIC_LIBRARY.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export { VIEWBOX_SIZE };
