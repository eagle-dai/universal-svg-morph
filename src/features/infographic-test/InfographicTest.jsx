import { ArrowLeft, Clipboard, Image, Info } from 'lucide-react';
import { useMemo, useState } from 'react';

const INFOGRAPHIC_TESTS = [
  {
    id: 'list-row-arrow',
    title: '流程列表（水平箭头）',
    summary: '验证基础列表、文字排版与指向性布局。',
    focusPoints: ['列表项对齐', '箭头连接关系', '中英文混排换行'],
    syntax: `
infographic list-row-simple-horizontal-arrow
data
  lists
    - label Step 1
      desc Start
    - label Step 2
      desc In Progress
    - label Step 3
      desc Complete
`
  },
  {
    id: 'timeline',
    title: '时间线（垂直）',
    summary: '检验事件节点、时间标签与层级关系表现。',
    focusPoints: ['时间标签位置', '节点间距', '描述信息层级'],
    syntax: `
infographic timeline-vertical
data
  title 版本迭代记录
  events
    - time 2023 Q1
      label 基础能力上线
      desc 支持模板与主题
    - time 2023 Q3
      label AI 流式渲染
      desc 支持逐段渲染
    - time 2024 Q1
      label 可视化编辑器
      desc 支持二次编辑
`
  },
  {
    id: 'comparison',
    title: '对比卡片（双列）',
    summary: '查看双栏布局、对比信息与强调样式。',
    focusPoints: ['列宽均衡', '标题/要点层级', '强调色一致性'],
    syntax: `
infographic compare-two-column
data
  left
    title 传统报告
    points
      - 线性阅读
      - 静态图表
      - 更新频率低
  right
    title Infographic
    points
      - 结构化表达
      - 高质量 SVG
      - 快速迭代
`
  },
  {
    id: 'stat-cards',
    title: '指标卡片（网格）',
    summary: '检查指标卡片样式与数据格式处理。',
    focusPoints: ['数值对齐', '单位字号', '卡片间距'],
    syntax: `
infographic metrics-grid
data
  title 关键指标
  metrics
    - label 渲染耗时
      value 120ms
      desc 渲染速度提升 35%
    - label 模板数量
      value 200+
      desc 内置模板库
    - label 主题方案
      value 12
      desc 支持多风格
`
  },
  {
    id: 'story-flow',
    title: '叙事流程（节点）',
    summary: '验证节点流程、分支与结构表达。',
    focusPoints: ['节点层级', '连接线样式', '长文本截断'],
    syntax: `
infographic story-flow
data
  title 用户旅程
  steps
    - label 发现
      desc 看到品牌内容
    - label 了解
      desc 体验产品价值
    - label 转化
      desc 完成首次购买
    - label 复购
      desc 建立长期关系
`
  }
];

export default function InfographicTest({ onBack }) {
  const [activeId, setActiveId] = useState(INFOGRAPHIC_TESTS[0].id);
  const activeTest = useMemo(
    () => INFOGRAPHIC_TESTS.find((item) => item.id === activeId),
    [activeId]
  );
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async () => {
    if (!activeTest) {
      return;
    }
    try {
      await navigator.clipboard.writeText(activeTest.syntax.trim());
      setCopiedId(activeTest.id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch (error) {
      setCopiedId('failed');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 px-6 py-5 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-amber-400/70 hover:text-amber-200"
              >
                <ArrowLeft size={14} />
                返回菜单
              </button>
            ) : null}
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-white">
              <Image className="text-amber-300" size={20} />
              Infographic SVG 测试页
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            参考 Infographic 语法设计一组渲染测试，用于验证模板与排版表现。
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
        <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              <Info size={14} />
              测试清单
            </div>
            {INFOGRAPHIC_TESTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                className={`flex flex-col gap-1 rounded-xl border px-3 py-2 text-left transition ${
                  activeId === item.id
                    ? 'border-amber-400/70 bg-amber-400/10 text-amber-100'
                    : 'border-slate-800 bg-slate-950/40 text-slate-200 hover:border-slate-600'
                }`}
              >
                <span className="text-sm font-semibold">{item.title}</span>
                <span className="text-xs text-slate-400">{item.summary}</span>
              </button>
            ))}
          </aside>

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            {activeTest ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{activeTest.title}</h2>
                    <p className="text-sm text-slate-400">{activeTest.summary}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-amber-400/70 hover:text-amber-200"
                  >
                    <Clipboard size={14} />
                    {copiedId === activeTest.id ? '已复制' : '复制语法'}
                  </button>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    关注项
                  </h3>
                  <ul className="mt-3 grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
                    {activeTest.focusPoints.map((point) => (
                      <li
                        key={point}
                        className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Infographic 语法
                  </div>
                  <pre className="max-h-[320px] overflow-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-xs leading-relaxed text-slate-200">
                    <code>{activeTest.syntax.trim()}</code>
                  </pre>
                  {copiedId === 'failed' ? (
                    <div className="text-xs text-amber-300">
                      无法访问剪贴板，请手动复制。
                    </div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-sm text-slate-400">
                  渲染结果区域预留，可接入 Infographic 渲染实例或 SVG 输出。
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-400">请选择一个测试项。</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
