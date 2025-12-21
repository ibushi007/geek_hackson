"use client";

import { useState, useEffect } from "react";
import { Flame, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { user } from "@/lib/mock";
import type { GrowthData } from "@/types/growth";

export function TopBar() {
  const { data: session } = useSession();
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const response = await fetch("/api/growth");
        if (!response.ok) {
          throw new Error("Failed to fetch growth data");
        }
        const data: GrowthData = await response.json();
        setStreak(data.streak);
      } catch (error) {
        console.error("Error fetching growth data:", error);
        // エラー時はモックデータを使用
        setStreak(user.streak);
      }
    };

    fetchGrowthData();
  }, []);

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
          <span>{streak !== null ? streak : user.streak}日連続</span>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt="GitHub Avatar"
              className="h-8 w-8 rounded-full border-2 border-slate-200"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-200 bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
              <span className="text-xs font-bold">
                {(session?.user?.name || user.name)?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
          )}
          <span className="hidden text-sm font-semibold text-slate-700 sm:block">
            {session?.user?.name || user.name}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:block">ログアウト</span>
        </button>
      </div>
    </header>
  );
}
