import { Infographic, getPalette, getTemplate } from '@antv/infographic';

const VIEWBOX_SIZE = 200;
const DEFAULT_VIEWBOX = `0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`;
const FALLBACK_PALETTE = ['#1783FF', '#00C9C9', '#F0884D', '#D580FF'];

const TEMPLATE_SPECS = [
  {
    id: 'sequence',
    templateId: 'sequence-timeline-simple',
    title: '顺序型节点',
    description: '顺序型时间线模板，强调阶段与节点叙事。',
    tags: ['顺序型', '时间线', '节点'],
    itemCount: 4
  },
  {
    id: 'step',
    templateId: 'sequence-steps-simple',
    title: '阶梯流程',
    description: '阶梯式上升布局，适合展示成长路径。',
    tags: ['顺序型', '阶梯', '流程'],
    itemCount: 4
  },
  {
    id: 'cycle',
    templateId: 'chart-pie-donut-plain-text',
    title: '环形循环',
    description: '环形闭环结构，突出循环与迭代。',
    tags: ['顺序型', '循环', '环形'],
    itemCount: 5
  },
  {
    id: 'matrix',
    templateId: 'list-grid-badge-card',
    title: '栅格矩阵',
    description: '矩阵卡片布局，适合分类与对照信息。',
    tags: ['顺序型', '矩阵', '卡片'],
    itemCount: 4
  },
  {
    id: 'mountain',
    templateId: 'list-pyramid-rounded-rect-node',
    title: '山峰趋势',
    description: '金字塔层级布局，突出阶段起伏与对比。',
    tags: ['顺序型', '趋势', '山峰'],
    itemCount: 4
  },
  {
    id: 'bar',
    templateId: 'chart-column-simple',
    title: '柱状对比',
    description: '纵向柱状布局，用于强调强弱与排名。',
    tags: ['对比型', '柱状', '排名'],
    itemCount: 5
  },
  {
    id: 'pros-cons',
    templateId: 'compare-hierarchy-left-right-circle-node-pill-badge',
    title: '优劣对比',
    description: '左右对比动线，适合呈现观点差异。',
    tags: ['对比型', '优劣', '观点'],
    itemCount: 2
  },
  {
    id: 'venn',
    templateId: 'relation-circle-icon-badge',
    title: '维恩关系',
    description: '交集关系展示，体现共同与差异部分。',
    tags: ['对比型', '关系', '交集'],
    itemCount: 3
  },
  {
    id: 'quadrant',
    templateId: 'compare-quadrant-quarter-simple-card',
    title: '四象限',
    description: '四象限分布，用于定位优先级与策略。',
    tags: ['四象限', '分布', '策略'],
    itemCount: 4
  },
  {
    id: 'swot',
    templateId: 'list-grid-compact-card',
    title: 'SWOT 分析',
    description: '紧凑卡片矩阵，适合战略拆解与归类。',
    tags: ['对比型', 'SWOT', '战略'],
    itemCount: 4
  }
];

const clampNumber = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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

const ellipsePath = (cx, cy, rx, ry) =>
  `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${
    -rx * 2
  } 0`;

const polygonPath = (points) => {
  if (!points.length) return null;
  return `M ${points[0][0]} ${points[0][1]} L ${points
    .slice(1)
    .map(([x, y]) => `${x} ${y}`)
    .join(' L ')} Z`;
};

const polylinePath = (points) => {
  if (!points.length) return null;
  return `M ${points[0][0]} ${points[0][1]} L ${points
    .slice(1)
    .map(([x, y]) => `${x} ${y}`)
    .join(' L ')}`;
};

const parsePoints = (value) => {
  if (!value) return [];
  return value
    .trim()
    .split(/[\s,]+/)
    .map((entry) => Number.parseFloat(entry))
    .reduce((acc, num, index) => {
      if (index % 2 === 0) {
        acc.push([num, 0]);
      } else {
        acc[acc.length - 1][1] = num;
      }
      return acc;
    }, [])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
};

const normalizeColor = (value) => {
  if (!value) return null;
  const normalized = value.trim();
  if (!normalized || normalized === 'none') return null;
  if (normalized.startsWith('url(')) return null;
  return normalized;
};

const extractShapeColor = (element) => {
  const fill = normalizeColor(element.getAttribute('fill'));
  if (fill) return fill;
  const stroke = normalizeColor(element.getAttribute('stroke'));
  if (stroke) return stroke;
  const computed = window.getComputedStyle(element);
  return normalizeColor(computed.fill) || normalizeColor(computed.stroke);
};

const buildPathData = (element) => {
  const tag = element.tagName.toLowerCase();
  if (tag === 'path') {
    return { d: element.getAttribute('d'), closed: /[zZ]\s*$/.test(element.getAttribute('d') ?? '') };
  }
  if (tag === 'rect') {
    const x = clampNumber(element.getAttribute('x'));
    const y = clampNumber(element.getAttribute('y'));
    const width = clampNumber(element.getAttribute('width'));
    const height = clampNumber(element.getAttribute('height'));
    const rx = clampNumber(element.getAttribute('rx'));
    const ry = clampNumber(element.getAttribute('ry'));
    const radius = rx || ry;
    return { d: roundedRectPath(x, y, width, height, radius), closed: true };
  }
  if (tag === 'circle') {
    const cx = clampNumber(element.getAttribute('cx'));
    const cy = clampNumber(element.getAttribute('cy'));
    const r = clampNumber(element.getAttribute('r'));
    return { d: circlePath(cx, cy, r), closed: true };
  }
  if (tag === 'ellipse') {
    const cx = clampNumber(element.getAttribute('cx'));
    const cy = clampNumber(element.getAttribute('cy'));
    const rx = clampNumber(element.getAttribute('rx'));
    const ry = clampNumber(element.getAttribute('ry'));
    return { d: ellipsePath(cx, cy, rx, ry), closed: true };
  }
  if (tag === 'polygon') {
    return { d: polygonPath(parsePoints(element.getAttribute('points'))), closed: true };
  }
  if (tag === 'polyline') {
    return { d: polylinePath(parsePoints(element.getAttribute('points'))), closed: false };
  }
  if (tag === 'line') {
    const x1 = clampNumber(element.getAttribute('x1'));
    const y1 = clampNumber(element.getAttribute('y1'));
    const x2 = clampNumber(element.getAttribute('x2'));
    const y2 = clampNumber(element.getAttribute('y2'));
    return { d: `M ${x1} ${y1} L ${x2} ${y2}`, closed: false };
  }
  return { d: null, closed: false };
};

const matrixFromCTM = (ctm) => {
  if (!ctm) return new DOMMatrix();
  return new DOMMatrix([ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f]);
};

const transformPoint = (matrix, point) => {
  const transformed = new DOMPoint(point.x, point.y).matrixTransform(matrix);
  return [transformed.x, transformed.y];
};

const pathFromElement = (element, fallbackSamples = 80) => {
  const { d, closed } = buildPathData(element);
  if (!d) return null;
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  const length = path.getTotalLength();
  if (!Number.isFinite(length) || length <= 0) return null;
  const sampleCount = Math.min(
    160,
    Math.max(24, Math.round(length / 6) || fallbackSamples)
  );
  const matrix = matrixFromCTM(element.getCTM());
  const points = [];
  for (let i = 0; i < sampleCount; i += 1) {
    const point = path.getPointAtLength((length * i) / (sampleCount - 1));
    points.push(transformPoint(matrix, point));
  }
  if (!points.length) return null;
  const pathD = `M ${points
    .map(([x, y]) => `${x} ${y}`)
    .join(' L ')}`;
  return closed ? `${pathD} Z` : pathD;
};

const buildDefaultItems = (count, labelPrefix = '节点') =>
  Array.from({ length: count }, (_, index) => ({
    label: `${labelPrefix} ${index + 1}`,
    value: 20 + index * 8,
    desc: `关键信息 ${index + 1}`
  }));

const buildCompareItems = (count) => {
  const childCount = Math.max(2, count);
  return [
    {
      label: '优势',
      desc: '左侧要点',
      children: buildDefaultItems(childCount, '优势').map((item, index) => ({
        ...item,
        label: `优势 ${index + 1}`
      }))
    },
    {
      label: '劣势',
      desc: '右侧要点',
      children: buildDefaultItems(childCount, '劣势').map((item, index) => ({
        ...item,
        label: `劣势 ${index + 1}`
      }))
    }
  ];
};

const buildHierarchyRoot = (count) => ({
  label: '核心主题',
  desc: '结构树根节点',
  children: buildDefaultItems(Math.max(2, count), '子节点')
});

const buildData = (templateId, count) => {
  const items = buildDefaultItems(count);
  const prefix = templateId.split('-')[0];
  const base = {
    title: 'Infographic',
    desc: 'Generated by @antv/infographic'
  };

  if (prefix === 'list') {
    return { ...base, items, lists: items };
  }
  if (prefix === 'sequence') {
    return { ...base, items, sequences: items };
  }
  if (prefix === 'compare') {
    const compares = buildCompareItems(count);
    return { ...base, items: compares, compares };
  }
  if (prefix === 'relation') {
    return { ...base, items, nodes: items };
  }
  if (prefix === 'chart') {
    return { ...base, items, values: items };
  }
  if (prefix === 'hierarchy') {
    const root = buildHierarchyRoot(count);
    return { ...base, items: [root], root };
  }

  return { ...base, items };
};

const buildStats = (pathsCount, itemCount) => ({
  layers: pathsCount,
  nodes: itemCount,
  blocks: Math.max(1, Math.round(pathsCount / Math.max(itemCount, 1)))
});

const extractPathsFromSvg = (svg, palette) => {
  if (!svg) {
    return {
      paths: [],
      colors: palette,
      viewBox: DEFAULT_VIEWBOX
    };
  }

  const shapes = svg.querySelectorAll(
    'path, rect, circle, ellipse, polygon, polyline, line'
  );
  const paths = [];
  const colorSet = new Set();

  shapes.forEach((element) => {
    const path = pathFromElement(element);
    if (!path) return;
    paths.push(path);
    const color = extractShapeColor(element);
    if (color) {
      colorSet.add(color);
    }
  });

  let viewBox = svg.getAttribute('viewBox');
  if (!viewBox) {
    const bbox = svg.getBBox();
    viewBox = `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`;
  }

  const colors = colorSet.size ? Array.from(colorSet) : palette;

  return {
    paths,
    colors: colors.length ? colors : FALLBACK_PALETTE,
    viewBox
  };
};

const renderTemplate = (templateId, data, palette) => {
  const container = document.createElement('div');
  container.style.cssText =
    'position:absolute;left:-9999px;top:-9999px;width:0;height:0;overflow:hidden;pointer-events:none;';
  const host = document.body ?? document.documentElement;
  host.appendChild(container);

  const infographic = new Infographic({
    container,
    template: templateId,
    data,
    width: VIEWBOX_SIZE,
    height: VIEWBOX_SIZE,
    padding: 0,
    themeConfig: {
      palette
    }
  });

  let result = null;
  try {
    infographic.render();
    const svg = container.querySelector('svg');
    result = extractPathsFromSvg(svg, palette);
  } catch (error) {
    console.warn(`Template render failed: ${templateId}`, error);
    result = {
      paths: [],
      colors: palette,
      viewBox: DEFAULT_VIEWBOX
    };
  }
  infographic.destroy();
  container.remove();
  return result;
};

let cachedLibrary = null;

export const getInfographicLibrary = () => {
  if (cachedLibrary) {
    return cachedLibrary;
  }

  if (typeof document === 'undefined') {
    cachedLibrary = { library: [], map: {} };
    return cachedLibrary;
  }

  const palette = getPalette('antv') ?? FALLBACK_PALETTE;

  const library = TEMPLATE_SPECS.map((spec) => {
    if (!getTemplate(spec.templateId)) {
      console.warn(`Template not found: ${spec.templateId}`);
      return null;
    }
    const data = buildData(spec.templateId, spec.itemCount);
    const { paths, colors, viewBox } = renderTemplate(
      spec.templateId,
      data,
      palette
    );
    return {
      id: spec.id,
      templateId: spec.templateId,
      title: spec.title,
      description: spec.description,
      tags: spec.tags,
      stats: buildStats(paths.length, data.items.length),
      colors,
      paths,
      viewBox
    };
  }).filter(Boolean);

  const map = library.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  cachedLibrary = { library, map };
  return cachedLibrary;
};

export { DEFAULT_VIEWBOX, VIEWBOX_SIZE };
