"use client";

import { useState, useEffect } from "react";
import { BarChart3, LineChart, Sparkles, TrendingUp } from "lucide-react";
import { SkillMap } from "@/components/SkillMap";
import { AICoach } from "@/components/AICoach";
import { growthData as mockGrowthData, aiCoachMessages } from "@/lib/mock";
import type { GrowthData } from "@/types/growth";

type WeeklyCommitWithIsToday = {
  dayOfWeek: string;
  value: number;
  dateKey: string;
  isToday: boolean;
};

export default function GrowthPage() {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);

  // 今日の日付をYYYY-MM-DD形式で取得
  const getTodayDateKey = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const response = await fetch("/api/growth");
        if (!response.ok) {
          throw new Error("Failed to fetch growth data");
        }
        const data: GrowthData = await response.json();
        setGrowthData(data);
      } catch (error) {
        console.error("Error fetching growth data:", error);
        // エラー時はモックデータを使用
        setGrowthData({
          weeklyCommits: mockGrowthData.weeklyCommits,
          streak: mockGrowthData.streak,
          momentum: mockGrowthData.momentum,
          skillMap: mockGrowthData.techSkillMap.map((skill) => ({
            name: skill.name,
            percentage: skill.level,
          })),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, []);

  // dateKeyを使ってisTodayを判定した週間コミットデータ
  const todayDateKey = getTodayDateKey();
  const weeklyCommitsWithIsToday: WeeklyCommitWithIsToday[] =
    growthData?.weeklyCommits.map((commit) => ({
      ...commit,
      isToday: commit.dateKey === todayDateKey,
    })) || [];

  const weeklyMax = Math.max(
    ...weeklyCommitsWithIsToday.map((d) => d.value),
    1,
  );
  const monthlyMax = Math.max(
    ...mockGrowthData.monthlyCommits.map((d) => d.value),
    1,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-slate-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Growth Timeline</h1>
        <p className="text-sm text-slate-500">
          あなたの成長を可視化します。継続は力なり！
        </p>
      </div>

      {/* Momentum Card */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Learning Momentum
            </p>
            <p className="mt-1 text-4xl font-bold text-slate-900">
              {growthData?.momentum ?? 0}
              <span className="text-lg font-normal text-slate-400">/100</span>
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500">
            <TrendingUp size={32} className="text-white" />
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000"
            style={{ width: `${growthData?.momentum ?? 0}%` }}
          />
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-3">
          <Sparkles size={16} className="text-emerald-600" />
          <p className="text-sm text-emerald-700">
            今月は新しい技術に挑戦する機会が多い期間でした。この調子！
          </p>
        </div>
      </div>

      {/* Commit Graph */}
      <div className="glass-card rounded-2xl p-5">
        {/* Tab */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab("weekly")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "weekly"
                ? "bg-emerald-50 text-emerald-700"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <BarChart3 size={16} />
            週間
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "monthly"
                ? "bg-emerald-50 text-emerald-700"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <LineChart size={16} />
            月間
          </button>
        </div>

        {/* Weekly Chart */}
        {activeTab === "weekly" && (
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-slate-500">
              週間コミット数
            </p>
            <div className="flex items-end gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              {weeklyCommitsWithIsToday.map((day) => (
                <div
                  key={day.dayOfWeek}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  {day.value > 0 && (
                    <div
                      className="w-full rounded-full bg-gradient-to-t from-emerald-300 to-emerald-500 shadow-md shadow-emerald-200/60 transition-all"
                      style={{
                        height: `${Math.max((day.value / weeklyMax) * 140, 8)}px`,
                      }}
                    />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      day.isToday
                        ? "text-slate-700 border-b-2 border-emerald-600 pb-0.5"
                        : "text-slate-500"
                    }`}
                  >
                    {day.dayOfWeek}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {day.dateKey && day.dateKey > todayDateKey
                      ? "-"
                      : day.dateKey === todayDateKey
                        ? day.value > 0
                          ? day.value
                          : "-"
                        : day.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Chart */}
        {activeTab === "monthly" && (
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-slate-500">
              月間コミット数（週ごと）
            </p>
            <div className="flex items-end gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-inner shadow-slate-200/60">
              {mockGrowthData.monthlyCommits.map((week) => (
                <div
                  key={week.weekLabel}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className="w-full rounded-2xl bg-gradient-to-t from-emerald-200 via-emerald-400 to-emerald-600 shadow-md shadow-emerald-200/50"
                    style={{
                      height: `${Math.max((week.value / monthlyMax) * 140, 8)}px`,
                    }}
                  />
                  <span className="text-xs font-semibold text-slate-500">
                    {week.weekLabel}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {week.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">週間合計</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {weeklyCommitsWithIsToday.reduce((a, b) => a + b.value, 0)}
              <span className="text-sm font-normal text-slate-500">
                {" "}
                commits
              </span>
            </p>
            <p className="text-xs font-semibold text-emerald-600">
              +12 先週より増加 📈
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">学習ストリーク</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {growthData?.streak ?? 0}
              <span className="text-sm font-normal text-slate-500">日連続</span>
            </p>
            <p className="text-xs font-semibold text-orange-600">
              🔥 この調子で続けよう！
            </p>
          </div>
        </div>
      </div>

      {/* Skill Map */}
      <SkillMap
        skills={growthData?.skillMap || []}
      />

      {/* AI Coach */}
      <AICoach message={aiCoachMessages.growth} />
    </div>
  );
}
