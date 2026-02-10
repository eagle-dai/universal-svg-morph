import sequenceTimelineSimpleSvg from "./svgs/sequence-timeline-simple.svg?raw";
import listGridBadgeCardSvg from "./svgs/list-grid-badge-card.svg?raw";

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

const TRANSFORM_DATA = {
  source: { x: -45, y: 6, r: -28, cx: 100, cy: 100, s: 1 },
  target: { x: 38, y: -8, r: 30, cx: 100, cy: 100, s: 0.8 },
};

const getTransformString = ({ x, y, r, cx, cy, s }) =>
  `translate(${x} ${y}) rotate(${r} ${cx} ${cy}) scale(${s})`;



const COMPLEX_CASE = {
  title: "复杂 SVG 对比（Infographic）",
  sourceSvg: sequenceTimelineSimpleSvg,
  targetSvg: listGridBadgeCardSvg,
  shapes: {
    source: "M 90 41 L 90 299",
    target:
      "M0,-137.986A2,2,0,0,1,2.029,-139.985A140,140,0,0,1,88.427,-108.539A2,2,0,0,1,88.695,-105.703L59.122,-70.459A2,2,0,0,1,56.338,-70.185A90,90,0,0,0,1.957,-89.979A2,2,0,0,1,0,-91.978Z",
  },
  colors: {
    source: "#1783FF",
    target: "#F97316",
  },
  viewBox: "-160 -160 360 500",
};

export const morphRows = [
  {
    title: "基础形态对比",
    shapes: BASE_SHAPES,
    colors: BASE_COLORS,
    viewBox: "0 0 200 200",
  },
  {
    title: "带 Transform",
    shapes: BASE_SHAPES,
    colors: BASE_COLORS,
    transformMeta: {
      label: "带 Transform",
      sourceTransform: getTransformString(TRANSFORM_DATA.source),
      targetTransform: getTransformString(TRANSFORM_DATA.target),
      config: TRANSFORM_DATA,
    },
    viewBox: "0 0 200 200",
  },
  COMPLEX_CASE,
];
