import { animate } from 'animejs';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export const samplePath = (pathString, sampleCount) => {
  const path = document.createElementNS(SVG_NAMESPACE, 'path');
  path.setAttribute('d', pathString);
  const len = path.getTotalLength();
  const points = [];
  for (let i = 0; i < sampleCount; i++) {
    const p = i / sampleCount;
    const pt = path.getPointAtLength(len * p);
    points.push({ x: pt.x, y: pt.y });
  }
  return points;
};

export const findBestOffset = (pointsA, pointsB, samples, isMassive) => {
  if (isMassive) return 0;

  const len = pointsA.length;
  let minTotalDist = Infinity;
  let bestOffset = 0;
  const step = Math.max(1, Math.floor(samples / 20));

  for (let offset = 0; offset < len; offset += step) {
    let currentTotalDist = 0;
    const distStep = Math.max(1, Math.floor(samples / 15));
    for (let i = 0; i < len; i += distStep) {
      const pA = pointsA[i];
      const pB = pointsB[(i + offset) % len];
      currentTotalDist += (pA.x - pB.x) ** 2 + (pA.y - pB.y) ** 2;
    }
    if (currentTotalDist < minTotalDist) {
      minTotalDist = currentTotalDist;
      bestOffset = offset;
    }
  }
  return bestOffset;
};

export const createMorphInterpolator = (startD, endD, options = {}) => {
  const {
    samples = 120,
    optimize = true,
    isMassive = false
  } = options;

  if (!startD || !endD) return null;
  const pointsA = samplePath(startD, samples);
  const pointsBRaw = samplePath(endD, samples);
  let pointsBFinal = pointsBRaw;

  if (optimize) {
    const offset = findBestOffset(pointsA, pointsBRaw, samples, isMassive);
    if (offset !== 0) {
      pointsBFinal = [...pointsBRaw.slice(offset), ...pointsBRaw.slice(0, offset)];
    }
  }

  return { a: pointsA, b: pointsBFinal };
};

const hexToRgb = (hex) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const normalized = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
};

export const createColorLerp = (color1, color2) => {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);
  return {
    start: [r1, g1, b1],
    diff: [r2 - r1, g2 - g1, b2 - b1]
  };
};

export const lerpColor = (colorData, factor) => {
  const r = (colorData.start[0] + colorData.diff[0] * factor) | 0;
  const g = (colorData.start[1] + colorData.diff[1] * factor) | 0;
  const b = (colorData.start[2] + colorData.diff[2] * factor) | 0;
  return `rgb(${r},${g},${b})`;
};

export const buildStaticPathD = (points, precision = 1) => {
  if (!points?.length) return '';
  let d = 'M';
  for (let i = 0; i < points.length; i++) {
    d += `${points[i].x.toFixed(precision)},${points[i].y.toFixed(precision)}L`;
  }
  return `${d.slice(0, -1)}Z`;
};

export const buildAnimatedPathD = (fromPoints, toPoints, t, step = 1) => {
  if (!fromPoints?.length) return '';
  let d = 'M';
  for (let i = 0; i < fromPoints.length; i += step) {
    const x = fromPoints[i].x + (toPoints[i].x - fromPoints[i].x) * t;
    const y = fromPoints[i].y + (toPoints[i].y - fromPoints[i].y) * t;
    d += `${(x + 0.5) | 0},${(y + 0.5) | 0}L`;
  }
  return `${d.slice(0, -1)}Z`;
};

export const createMorphEngine = ({ duration = 2000 } = {}) => {
  const registry = new Map();
  let animation = null;
  let frameCount = 0;

  const register = (item) => {
    const id = Symbol('morph-item');
    registry.set(id, item);
    return () => registry.delete(id);
  };

  const renderStatic = (t = 0, precision = 1) => {
    registry.forEach(({ dom, data, color, samples }) => {
      const target = t >= 1 ? data.b : data.a;
      const d = buildStaticPathD(target.slice(0, samples), precision);
      const c = lerpColor(color, t);
      dom.setAttribute('d', d);
      dom.setAttribute('fill', c);
      dom.setAttribute('stroke', c);
    });
  };

  const play = ({ shouldThrottle = false, motionSampleStep = 1, onComplete } = {}) => {
    frameCount = 0;
    if (animation) {
      animation.pause();
      animation = null;
    }

    const progress = { t: 0 };

    animation = animate(progress, {
      t: 1,
      duration,
      easing: 'linear',
      update: () => {
        frameCount += 1;
        if (shouldThrottle && frameCount % 2 !== 0) return;
        const t = Math.min(progress.t, 1);

        registry.forEach(({ dom, data, color }) => {
          const d = buildAnimatedPathD(data.a, data.b, t, motionSampleStep);
          const curColor = lerpColor(color, t);
          dom.setAttribute('d', d);
          dom.setAttribute('fill', curColor);
          dom.setAttribute('stroke', curColor);
        });
      },
      complete: () => {
        registry.forEach(({ dom, data, color }) => {
          const d = buildAnimatedPathD(data.a, data.b, 1, motionSampleStep);
          const curColor = lerpColor(color, 1);
          dom.setAttribute('d', d);
          dom.setAttribute('fill', curColor);
          dom.setAttribute('stroke', curColor);
        });
        onComplete?.();
      }
    });

    return () => animation?.pause();
  };

  const stop = () => {
    if (animation) {
      animation.pause();
      animation = null;
    }
  };

  return {
    register,
    renderStatic,
    play,
    stop
  };
};
