"use client";

import { useState, useEffect } from "react";
import { Flame, Github } from "lucide-react";
import { user } from "@/lib/mock";
import type { GrowthData } from "@/types/growth";

export function TopBar() {
  // 名前とアイコンURLを保存する箱を作る
  const [userName, setUserName] = useState<string>("Loading...");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        // あなたのGitHub情報を取得するAPIを叩く
        const response = await fetch(
          `https://api.github.com/users/${user.name}`
        );
        if (!response.ok) throw new Error("GitHubデータの取得に失敗");

        const data = await response.json();

        // 取得した「本物のデータ」をセットする
        setUserName(data.name || data.login); // 名前がなければIDを表示
        setAvatarUrl(data.avatar_url); // アイコンのURLをセット
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchGitHubData();
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
          <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="User Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <Github size={32} className="text-slate-400" />
            )}
          </div>
          <span className="hidden text-sm font-semibold text-slate-700 sm:block">
            {user.name}
          </span>
        </div>
      </div>
    </header>
  );
}
