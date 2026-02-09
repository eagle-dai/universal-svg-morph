const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

export const samplePath = (pathString, sampleCount) => {
  const path = document.createElementNS(SVG_NAMESPACE, "path");
  path.setAttribute("d", pathString);
  const len = path.getTotalLength();
  const points = [];
  for (let i = 0; i < sampleCount; i++) {
    const p = i / sampleCount;
    const pt = path.getPointAtLength(len * p);
    points.push({ x: pt.x, y: pt.y });
  }
  return points;
};

// 修改：现在返回 { offset, score } 对象，而不仅仅是 offset
export const findBestOffset = (pointsA, pointsB, samples, isMassive) => {
  // 海量元素模式下跳过计算以保证性能，返回无穷大分数
  if (isMassive) return { offset: 0, score: Infinity };

  const len = pointsA.length;
  let minTotalDist = Infinity;
  let bestOffset = 0;

  // 采样步长优化：不需要每个点都算，跳着算以提升性能
  const step = Math.max(1, Math.floor(samples / 20));

  for (let offset = 0; offset < len; offset += step) {
    let currentTotalDist = 0;
    // 距离计算步长优化
    const distStep = Math.max(1, Math.floor(samples / 15));

    for (let i = 0; i < len; i += distStep) {
      const pA = pointsA[i];
      const pB = pointsB[(i + offset) % len];
      // 计算欧几里得距离的平方和（不开根号以提升性能）
      currentTotalDist += (pA.x - pB.x) ** 2 + (pA.y - pB.y) ** 2;
    }

    if (currentTotalDist < minTotalDist) {
      minTotalDist = currentTotalDist;
      bestOffset = offset;
    }
  }

  return { offset: bestOffset, score: minTotalDist };
};

// 修改：增加了反向路径检测逻辑
export const createMorphInterpolator = (startD, endD, options = {}) => {
  const { samples = 120, optimize = true, isMassive = false } = options;

  if (!startD || !endD) return null;

  // 1. 采样原始路径
  const pointsA = samplePath(startD, samples);
  const pointsB_Normal = samplePath(endD, samples);

  let pointsBFinal = pointsB_Normal;

  if (optimize && !isMassive) {
    // 2. 准备反向路径数据（解决顺时针 vs 逆时针问题）
    const pointsB_Reversed = [...pointsB_Normal].reverse();

    // 3. 分别计算 正向 和 反向 的最佳匹配分数
    const resNormal = findBestOffset(
      pointsA,
      pointsB_Normal,
      samples,
      isMassive,
    );
    const resReverse = findBestOffset(
      pointsA,
      pointsB_Reversed,
      samples,
      isMassive,
    );

    // 4. 决策：谁的距离总和更小，就用谁
    // 如果反向的分数更低，说明路径方向是反的，我们需要翻转它
    const useReverse = resReverse.score < resNormal.score;

    const bestResult = useReverse ? resReverse : resNormal;
    const targetPointsRaw = useReverse ? pointsB_Reversed : pointsB_Normal;

    // 5. 应用最佳偏移量 (Shift)，对齐起始点
    if (bestResult.offset !== 0) {
      pointsBFinal = [
        ...targetPointsRaw.slice(bestResult.offset),
        ...targetPointsRaw.slice(0, bestResult.offset),
      ];
    } else {
      pointsBFinal = targetPointsRaw;
    }
  }

  return { a: pointsA, b: pointsBFinal };
};

const hexToRgb = (hex) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const normalized = hex.replace(
    shorthandRegex,
    (m, r, g, b) => r + r + g + g + b + b,
  );
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
};

export const createColorLerp = (color1, color2) => {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);
  return {
    start: [r1, g1, b1],
    diff: [r2 - r1, g2 - g1, b2 - b1],
  };
};

export const lerpColor = (colorData, factor) => {
  const r = (colorData.start[0] + colorData.diff[0] * factor) | 0;
  const g = (colorData.start[1] + colorData.diff[1] * factor) | 0;
  const b = (colorData.start[2] + colorData.diff[2] * factor) | 0;
  return `rgb(${r},${g},${b})`;
};

// --- Transform Helpers ---
const lerp = (start, end, t) => start + (end - start) * t;

const buildTransformString = ({ x, y, r, cx, cy, s }) =>
  `translate(${x} ${y}) rotate(${r} ${cx} ${cy}) scale(${s})`;

const lerpTransform = (start, end, t) => ({
  x: lerp(start.x, end.x, t),
  y: lerp(start.y, end.y, t),
  r: lerp(start.r, end.r, t),
  cx: start.cx, // 通常中心点在 Morph 中保持一致，若需变动也可 lerp
  cy: start.cy,
  s: lerp(start.s, end.s, t),
});

// --- Path Helpers ---

export const buildStaticPathD = (points, precision = 1) => {
  if (!points?.length) return "";
  let d = "M";
  for (let i = 0; i < points.length; i++) {
    d += `${points[i].x.toFixed(precision)},${points[i].y.toFixed(precision)}L`;
  }
  return `${d.slice(0, -1)}Z`;
};

export const buildAnimatedPathD = (fromPoints, toPoints, t, step = 1) => {
  if (!fromPoints?.length) return "";
  let d = "M";
  for (let i = 0; i < fromPoints.length; i += step) {
    const x = fromPoints[i].x + (toPoints[i].x - fromPoints[i].x) * t;
    const y = fromPoints[i].y + (toPoints[i].y - fromPoints[i].y) * t;
    d += `${(x + 0.5) | 0},${(y + 0.5) | 0}L`;
  }
  return `${d.slice(0, -1)}Z`;
};

// --- Engine Core ---

export const createMorphEngine = ({ duration = 2000 } = {}) => {
  const registry = new Map();

  // 注册接口新增 transform: { start, end } 可选参数
  const register = (item) => {
    const id = Symbol("morph-item");
    registry.set(id, item);
    return () => registry.delete(id);
  };

  const renderStatic = (t = 0, precision = 1) => {
    registry.forEach(({ dom, data, color, samples, transform }) => {
      // 1. Path & Color
      const target = t >= 1 ? data.b : data.a;
      const d = buildStaticPathD(target.slice(0, samples), precision);
      const c = lerpColor(color, t);
      dom.setAttribute("d", d);
      dom.setAttribute("fill", c);
      dom.setAttribute("stroke", c);

      // 2. Transform (如果有)
      if (transform) {
        const targetTransform = t >= 1 ? transform.end : transform.start;
        dom.setAttribute("transform", buildTransformString(targetTransform));
      } else {
        dom.removeAttribute("transform");
      }
    });
  };

  const play = ({
    motionSampleStep = 1,
    onComplete,
    timeline = null,
    offset = 0,
  } = {}) => {
    if (!timeline) {
      throw new Error("createMorphEngine.play 需要传入有效的 timeline 实例");
    }

    const progress = { value: 0 };

    // 渲染帧逻辑
    const renderFrame = (t) => {
      registry.forEach(({ dom, data, color, transform }) => {
        // A. Path & Color
        const d = buildAnimatedPathD(data.a, data.b, t, motionSampleStep);
        const curColor = lerpColor(color, t);
        dom.setAttribute("d", d);
        dom.setAttribute("fill", curColor);
        dom.setAttribute("stroke", curColor);

        // B. Transform (新增支持)
        if (transform) {
          const curTransform = lerpTransform(transform.start, transform.end, t);
          dom.setAttribute("transform", buildTransformString(curTransform));
        }
      });
    };

    const animOptions = {
      value: 1,
      duration: duration,
      easing: "linear",
      onUpdate: () => {
        const t = Math.min(progress.value, 1);
        renderFrame(t);
      },
      onComplete: () => {
        renderFrame(1);
        onComplete?.();
      },
    };

    timeline.add(progress, animOptions, offset);
  };

  return {
    register,
    renderStatic,
    play,
  };
};
