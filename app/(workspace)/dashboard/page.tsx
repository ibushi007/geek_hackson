"use client";

import { useEffect, useState } from "react";
import { PenLine, TrendingUp, Zap, Sparkles } from "lucide-react"; // Sparklesを追加
import Link from "next/link";
import { LogCard } from "@/components/LogCard";
import { AICoach } from "@/components/AICoach";

import { user, growthData as mockGrowthData } from "@/lib/mock"; // aiCoachMessagesは動的に生成するので削除
import type { GrowthData } from "@/types/growth";
import type { ReportResponse, ShowReportsResponse } from "@/types/report";

export default function DashboardPage() {
  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
  const [growthLoading, setGrowthLoading] = useState(true);
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 成長ステージの判定ロジック ---
  const streak = growthData?.streak ?? 0;
  const getGrowthStage = () => {
    if (streak >= 10)
      return {
        icon: "🌳",
        label: "大樹",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      };
    if (streak >= 7)
      return {
        icon: "🌸",
        label: "開花",
        color: "text-pink-600",
        bg: "bg-pink-50",
      };
    if (streak >= 4)
      return {
        icon: "🌷",
        label: "つぼみ",
        color: "text-amber-600",
        bg: "bg-amber-50",
      };
    if (streak > 0)
      return {
        icon: "🌱",
        label: "新芽",
        color: "text-blue-500",
        bg: "bg-blue-50",
      };
    return {
      icon: "🌚",
      label: "種",
      color: "text-slate-400",
      bg: "bg-slate-50",
    };
  };
  const stage = getGrowthStage();

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const response = await fetch("/api/growth");
        if (!response.ok) throw new Error("Failed");
        const data: GrowthData = await response.json();
        setGrowthData(data);
      } catch (err) {
        console.error("Error fetching growth data:", err);
        // 足りなかった skillMap を追加してエラーを消します
        setGrowthData({
          weeklyCommits: mockGrowthData.weeklyCommits,
          streak: mockGrowthData.streak,
          momentum: mockGrowthData.momentum,
          // もし skillMap が必要なら、モックデータから取得するか空配列を入れます
          skillMap:
            (mockGrowthData as any).techSkillMap?.map((skill: any) => ({
              name: skill.name,
              percentage: skill.level,
            })) || [],
        });
      } finally {
        setGrowthLoading(false);
      }
    };
    fetchGrowthData();
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/reports");
        if (!response.ok) throw new Error("日報の取得に失敗しました");
        const data: ShowReportsResponse = await response.json();
        setReports(data.reports);
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (growthLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-slate-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            おかえりなさい、{user.name}さん
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Learning Dashboard
          </h1>
        </div>
        <Link
          href="/log/new"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <PenLine size={16} />
          今日の日報を書く
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* 学習ストリーク：植物進化デザイン */}
        <div
          className={`glass-card rounded-2xl p-5 border-l-4 transition-all duration-700 ${
            streak >= 10
              ? "border-emerald-500"
              : streak >= 7
                ? "border-pink-400"
                : streak >= 4
                  ? "border-amber-400"
                  : streak > 0
                    ? "border-blue-400"
                    : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${stage.bg}`}
            >
              {stage.icon}
            </div>
            <div>
              <p className="text-sm text-slate-500">学習ストリーク</p>
              <p className="text-2xl font-bold text-slate-900">
                {streak}日連続
              </p>
            </div>
          </div>
          <p
            className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${stage.color}`}
          >
            Stage: {stage.label}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <TrendingUp size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Learning Momentum</p>
              <p className="text-2xl font-bold text-slate-900">
                {growthData?.momentum ?? 0}
                <span className="text-sm font-normal text-slate-500">/100</span>
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Zap size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">今週のコミット</p>
              <p className="text-2xl font-bold text-slate-900">
                {growthData?.weeklyCommits.reduce((a, b) => a + b.value, 0) ??
                  0}
                <span className="text-sm font-normal text-slate-500">
                  {" "}
                  commits
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Logs */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">最近の学習ログ</h2>
          <Link
            href="/logs"
            className="text-sm font-semibold text-emerald-600 hover:underline"
          >
            すべて見る →
          </Link>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-500">まだ日報がありません</p>
              <Link
                href="/log/new"
                className="mt-3 text-sm font-semibold text-emerald-600 hover:underline"
              >
                最初の日報を書く →
              </Link>
            </div>
          ) : (
            reports.map((log) => <LogCard key={log.id} log={log} />)
          )}
        </div>
      </div>

      {/* AI Coach: 植物の成長に合わせてセリフを変える */}
      <AICoach
        message={
          streak >= 10
            ? "素晴らしい！あなたの努力は大樹のように根を張り、周囲に良い影響を与えていますよ。"
            : streak >= 7
              ? "綺麗な花が咲きましたね！この調子で毎日水をあげるように学習を続けましょう。"
              : streak >= 4
                ? "つぼみが膨らんできました！三日坊主を乗り越えた今のあなたなら大丈夫です。"
                : streak > 0
                  ? "小さな芽が出ましたね。焦らず、一歩ずつ育てていきましょう。"
                  : "今日から新しい種をまきませんか？最初の一歩が一番大きな成長に繋がります。"
        }
      />
    </div>
  );
}
