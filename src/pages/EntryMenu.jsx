import MenuTile from '../components/MenuTile.jsx';
import { MENU_ITEMS } from '../data/menuItems.js';

export default function EntryMenu({ onSelect }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-400">入口菜单</span>
          <div>
            <h1 className="text-3xl font-semibold text-white">选择一个体验入口</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              这里汇集了项目中的所有交互演示。每个 Tile 对应一个独立的功能模块，点击即可进入。
            </p>
          </div>
        </header>
        <section className="grid gap-6 md:grid-cols-2">
          {MENU_ITEMS.map((item) => (
            <MenuTile key={item.id} item={item} onSelect={onSelect} />
          ))}
        </section>
      </div>
    </div>
  );
}
