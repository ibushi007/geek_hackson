"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Mail,
  PenLine,
  Settings2,
} from "lucide-react";

export const navItems = [
  { name: "ホーム", href: "/dashboard", icon: LayoutDashboard },
  { name: "日報を書く", href: "/log/new", icon: PenLine },
  { name: "成長グラフ", href: "/growth", icon: BarChart3 },
  { name: "週次レポート", href: "/weekly", icon: Mail },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-slate-200/80 bg-slate-900/95 px-4 py-6 text-slate-100 shadow-2xl shadow-slate-900/20 lg:flex">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/40">
          <BookOpen size={20} />
        </div>
        <div>
          <p className="text-xs text-slate-400">Developer</p>
          <p className="text-base font-bold text-white">Studyplus</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-white/10 text-white shadow-inner shadow-emerald-500/20"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 ${
                  active ? "bg-emerald-500/20" : "bg-white/0"
                }`}
              >
                <Icon size={18} />
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto space-y-2">
        <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10">
            <Settings2 size={18} />
          </span>
          設定
        </button>
        <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-red-500/10 hover:text-red-400">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10">
            <LogOut size={18} />
          </span>
          サインアウト
        </button>
      </div>
    </aside>
  );
}
