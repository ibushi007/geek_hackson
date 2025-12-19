"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./Sidebar";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-slate-200/60 bg-white/95 backdrop-blur-md lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-3 py-2 ${
              active ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-semibold">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
