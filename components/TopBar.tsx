"use client";

import { Flame, Github } from "lucide-react";
import { user } from "@/lib/mock";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 backdrop-blur-md lg:px-10">
      {/* Left: Mobile logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
          <span className="text-sm font-bold">D</span>
        </div>
        <span className="text-sm font-semibold text-slate-700">
          Dev Studyplus
        </span>
      </div>

      {/* Right: User info & Streak */}
      <div className="ml-auto flex items-center gap-4">
        {/* Streak Badge */}
        <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-600">
          <Flame size={16} className="streak-fire text-orange-500" />
          <span>{user.streak}日連続</span>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200">
            <Github size={32} className="text-slate-600" />
          </div>
          <span className="hidden text-sm font-semibold text-slate-700 sm:block">
            {user.name}
          </span>
        </div>
      </div>
    </header>
  );
}

