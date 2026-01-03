"use client";

import { useState, useEffect } from "react";
import { Flame, Github } from "lucide-react";
import { user } from "@/lib/mock";
// growthData のインポートを削除

export function TopBar() {
  const [userName, setUserName] = useState<string>("Loading...");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  // ストリーク数を管理するステートを追加
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        // 1. GitHub ユーザー情報を取得
        const githubRes = await fetch(
          `https://api.github.com/users/${user.name}`
        );
        if (githubRes.ok) {
          const githubData = await githubRes.json();
          setUserName(githubData.name || githubData.login);
          setAvatarUrl(githubData.avatar_url);
        }

        // 2. 作成した本物の API (/api/growth) からストリークを取得
        const growthRes = await fetch("/api/growth");
        if (growthRes.ok) {
          const growthData = await growthRes.json();
          setStreak(growthData.streak ?? 0); // 本物の数値をセット
        }
      } catch (error) {
        console.error("Error fetching data:", error);
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
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-all duration-700 ${
            streak >= 10
              ? "bg-emerald-100 text-emerald-700" // 10日以上（木）
              : streak >= 7
                ? "bg-pink-50 text-pink-600" // 7日以上（花）
                : streak >= 4
                  ? "bg-yellow-50 text-yellow-600" // 4日以上（つぼみ）
                  : streak > 0
                    ? "bg-blue-50 text-blue-500" // 1-3日（芽）
                    : "bg-slate-100 text-slate-400 opacity-60" // 0日
          }`}
        >
          {/* ストリーク数に応じた進化アイコン */}
          <span className="text-base">
            {streak >= 10
              ? "🌳"
              : streak >= 7
                ? "🌸"
                : streak >= 4
                  ? "🌷"
                  : streak > 0
                    ? "🌱"
                    : ""}
          </span>

          <span>{streak}日連続</span>
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
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}
