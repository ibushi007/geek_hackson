"use client";

import { useState, useEffect } from "react";
import { BarChart3, LineChart, Sparkles, TrendingUp } from "lucide-react";
import { SkillMap } from "@/components/SkillMap";
import { AICoach } from "@/components/AICoach";
import { aiCoachMessages } from "@/lib/mock";
import type { GrowthData } from "@/lib/mock";

export default function GrowthPage() {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/growth')
      .then(res => {
        if (!res.ok) {
          throw new Error('データの取得に失敗しました');
        }
        return res.json();
      })
      .then(data => {
        setGrowthData(data);
        setError(null);
      })
      .catch(error => {
        console.error('Failed to fetch growth data:', error);
        setError(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-sm text-slate-500">データを読み込み中...</p>
        </div>
      </div>
    );
  }
  if (error || !growthData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-2">エラーが発生しました</p>
          <p className="text-sm text-slate-500">{error || 'データが見つかりませんでした'}</p>
        </div>
      </div>
    );
  }

  const weeklyMax = Math.max(...growthData.weeklyCommits.map((d) => d.value));
  const monthlyMax = Math.max(...growthData.monthlyCommits.map((d) => d.value));
  
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
              {growthData.momentum}
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
            style={{ width: `${growthData.momentum}%` }}
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
              {growthData.weeklyCommits.map((day) => (
                <div
                  key={day.label}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className="w-full rounded-full bg-gradient-to-t from-emerald-300 to-emerald-500 shadow-md shadow-emerald-200/60"
                    style={{
                      height: `${Math.max((day.value / weeklyMax) * 140, 8)}px`,
                    }}
                  />
                  <span className="text-xs font-semibold text-slate-500">
                    {day.label}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {day.value}
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
              {growthData.monthlyCommits.map((week) => (
                <div
                  key={week.label}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className="w-full rounded-2xl bg-gradient-to-t from-emerald-200 via-emerald-400 to-emerald-600 shadow-md shadow-emerald-200/50"
                    style={{
                      height: `${Math.max((week.value / monthlyMax) * 140, 8)}px`,
                    }}
                  />
                  <span className="text-xs font-semibold text-slate-500">
                    {week.label}
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
              {growthData.weeklyCommits.reduce((a, b) => a + b.value, 0)}
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
              {growthData.streak}
              <span className="text-sm font-normal text-slate-500">日連続</span>
            </p>
            <p className="text-xs font-semibold text-orange-600">
              🔥 この調子で続けよう！
            </p>
          </div>
        </div>
      </div>

      {/* Skill Map */}
      <SkillMap skills={growthData.techSkillMap} />

      {/* AI Coach */}
      <AICoach message={aiCoachMessages.growth} />
    </div>
  );
}



