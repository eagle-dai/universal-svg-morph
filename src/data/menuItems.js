import { Image, ZapOff } from 'lucide-react';

export const MENU_ITEMS = [
  {
    id: 'universal-morph',
    title: '通用 SVG 变形引擎 V6',
    description: '探索多形状、多元素路径的高性能 Morphing 动画。',
    badge: '互动演示',
    cta: '进入演示',
    icon: ZapOff,
    theme: {
      accent: 'emerald',
      background: 'bg-emerald-500/10',
      border: 'border-emerald-500/40',
      text: 'text-emerald-300',
      glow: 'shadow-emerald-500/30'
    }
  },
  {
    id: 'infographic-test',
    title: 'Infographic SVG 测试',
    description: '预留用于接入 AntV Infographic 生成的 SVG 样式。',
    badge: '测试页面',
    cta: '进入占位页',
    icon: Image,
    theme: {
      accent: 'amber',
      background: 'bg-amber-500/10',
      border: 'border-amber-500/40',
      text: 'text-amber-200',
      glow: 'shadow-amber-500/30'
    }
  }
];
