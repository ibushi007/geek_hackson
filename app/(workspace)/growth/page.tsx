"use client";

import { useState, useEffect } from "react";
import { BarChart3, LineChart, Sparkles, TrendingUp } from "lucide-react";
import { SkillMap } from "@/components/SkillMap";
import { AICoach } from "@/components/AICoach";
import { growthData as mockGrowthData } from "@/lib/mock"; // aiCoachMessagesを削除
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

  // --- ストリークに応じた進化ロジック ---
  const streak = growthData?.streak ?? 0;
  
  const getGrowthStage = () => {
    if (streak >= 10) return { icon: "🌳", label: "大樹", color: "text-emerald-600", bg: "bg-emerald-50", message: "素晴らしい！あなたの努力が大きな森を作っています！" };
    if (streak >= 7)  return { icon: "🌸", label: "開花", color: "text-pink-600", bg: "bg-pink-50", message: "綺麗な花が咲きました！この調子で咲かせ続けましょう！" };
    if (streak >= 4)  return { icon: "🌷", label: "つぼみ", color: "text-amber-600", bg: "bg-amber-50", message: "つぼみが膨らんで、習慣が形になってきましたね。" };
    if (streak > 0)   return { icon: "🌱", label: "新芽", color: "text-blue-500", bg: "bg-blue-50", message: "小さな芽が出ました。大切に育てていきましょう。" };
    return { icon: "🌚", label: "種", color: "text-slate-400", bg: "bg-slate-50", message: "今日はどんな種（学習）をまきますか？" };
  };

  const stage = getGrowthStage();

  const getTodayDateKey = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const response = await fetch("/api/growth");
        if (!response.ok) throw new Error("Failed to fetch");
        const data: GrowthData = await response.json();
        setGrowthData(data);
      } catch (error) {
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

  const todayDateKey = getTodayDateKey();
  const weeklyCommitsWithIsToday: WeeklyCommitWithIsToday[] =
    growthData?.weeklyCommits.map((commit) => ({
      ...commit,
      isToday: commit.dateKey === todayDateKey,
    })) || [];

  const weeklyMax = Math.max(...weeklyCommitsWithIsToday.map((d) => d.value), 1);

  if (loading) return <div className="flex items-center justify-center p-8 text-slate-500">読み込み中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Growth Timeline</h1>
        <p className="text-sm text-slate-500">あなたの成長は、一粒の種から始まります。</p>
      </div>

      {/* Momentum Card */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Learning Momentum</p>
            <p className="mt-1 text-4xl font-bold text-slate-900">
              {growthData?.momentum ?? 0}
              <span className="text-lg font-normal text-slate-400">/100</span>
            </p>
          </div>
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-all duration-1000 ${streak >= 7 ? "bg-gradient-to-br from-pink-400 to-rose-500" : "bg-gradient-to-br from-emerald-400 to-teal-500"}`}>
            <span className="text-3xl">{stage.icon}</span>
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000"
            style={{ width: `${growthData?.momentum ?? 0}%` }}
          />
        </div>
        <div className={`mt-3 flex items-center gap-2 rounded-xl p-3 border ${stage.bg} border-current/10`}>
          <Sparkles size={16} className={stage.color} />
          <p className={`text-sm font-medium ${stage.color}`}>{stage.message}</p>
        </div>
      </div>

      {/* Commit Graph */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab("weekly")} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "weekly" ? "bg-emerald-50 text-emerald-700" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <BarChart3 size={16} /> 週間
          </button>
        </div>

        {activeTab === "weekly" && (
          <div className="mt-6">
            <div className="flex items-end gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              {weeklyCommitsWithIsToday.map((day, index) => (
                <div key={`${day.dayOfWeek}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full flex flex-col items-center justify-end h-[140px]">
                    {day.value > 0 && (
                      <div
                        className={`w-full rounded-full shadow-md transition-all ${day.isToday ? "bg-gradient-to-t from-emerald-400 to-teal-500" : "bg-slate-300"}`}
                        style={{ height: `${Math.max((day.value / weeklyMax) * 140, 8)}px` }}
                      />
                    )}
                  </div>
                  <span className={`text-xs font-semibold ${day.isToday ? "text-slate-700 border-b-2 border-emerald-600 pb-0.5" : "text-slate-500"}`}>{day.dayOfWeek}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-sm text-slate-500">週間合計</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{weeklyCommitsWithIsToday.reduce((a, b) => a + b.value, 0)} <span className="text-sm font-normal text-slate-500">commits</span></p>
          </div>
          
          {/* ストリークカードの成長デザイン */}
          <div className={`rounded-2xl p-4 border transition-colors duration-700 ${stage.bg} border-current/10`}>
            <p className="text-sm text-slate-500">学習ストリーク</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-2xl font-bold text-slate-900">{streak}<span className="text-sm font-normal text-slate-500">日連続</span></p>
              <span className="text-2xl animate-bounce">{stage.icon}</span>
            </div>
            <p className={`text-xs font-bold mt-1 ${stage.color}`}>{stage.label}ステージ：{stage.message}</p>
          </div>
        </div>
      </div>

      <SkillMap skills={growthData?.skillMap || []} />

      {/* AIコーチに成長ステージに基づいたセリフを喋らせる */}
      <AICoach message={`現在の成長ステージは「${stage.label}」です。${stage.message}`} />
    </div>
  );
}