"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  GitPullRequest,
  Code2,
  Sparkles,
  TrendingUp,
  Mail,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Award,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { AICoach } from "@/components/AICoach";
import { aiCoachMessages, weeklyDigest } from "@/lib/mock";
import type { TechTag } from "@/types/report";

interface WeeklyStats {
  weekLabel: string;
  startDate: string;
  endDate: string;
  totalCommits: number;
  totalLinesChanged: number;
  totalPRs: number;
  dailyReportCount: number;
  weeklyMomentum: number;
  newTechCount: number;
  newTechTags: string[];
  allTechTags: TechTag[];
  dailyBreakdown: Array<{
    date: string;
    dayOfWeek: string;
    commits: number;
    prs: number;
    lines: number;
  }>;
  mostProductiveDay: {
    date: string;
    dayOfWeek: string;
    commits: number;
  };
  biggestChange: {
    title: string;
    lines: number;
    date: string;
  } | null;
}

export default function WeeklyPage() {
  const { data: session } = useSession();
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0); // 0=今週、-1=先週

  const fetchWeeklyStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/weekly?weekOffset=${weekOffset}`);

      if (!response.ok) {
        throw new Error("週次データの取得に失敗しました");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "データの取得に失敗しました");
      }

      setWeeklyStats(result.data);
    } catch (error) {
      console.error("Failed to fetch weekly stats:", error);
      const errorMessage =
        error instanceof Error ? error.message : "データの取得に失敗しました";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [weekOffset]);

  useEffect(() => {
    if (session?.user) {
      fetchWeeklyStats();
    }
  }, [session, fetchWeeklyStats]);

  // ローディング状態
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-emerald-500"
            aria-hidden="true"
          />
          <p className="mt-2 text-sm text-slate-500">
            週次データを読み込んでいます...
          </p>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error || !weeklyStats) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <AlertCircle size={32} className="text-red-500" aria-hidden="true" />
        <p className="mt-2 text-sm font-semibold text-red-700">
          {error || "データが見つかりませんでした"}
        </p>
        <button
          onClick={fetchWeeklyStats}
          className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Week Navigation */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail size={24} className="text-emerald-600" />
            <h1 className="text-3xl font-bold text-slate-900">
              Weekly Learning Digest
            </h1>
          </div>

          {/* 週の切り替えボタン */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="rounded-lg border border-slate-300 p-2 transition hover:bg-slate-50"
              aria-label="前の週"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="min-w-[80px] text-center text-sm font-semibold text-slate-700">
              {weekOffset === 0 ? "今週" : `${Math.abs(weekOffset)}週間前`}
            </span>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              disabled={weekOffset >= 0}
              className="rounded-lg border border-slate-300 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="次の週"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar size={16} />
          <span>{weeklyStats.weekLabel}の振り返りレポート</span>
          <span className="text-slate-400">•</span>
          <span>{weeklyStats.dailyReportCount}日分の日報</span>
        </div>
      </div>

      {/* 週間AIレビュー */}
      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Sparkles size={20} />
            <span className="text-sm font-semibold">週間AIレビュー</span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">
                {weeklyDigest.aiMessage}
              </p>
              <div className="mt-4 rounded-xl bg-emerald-50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <Star size={16} className="text-amber-500" />
                  今週の提案
                </p>
                <p className="mt-1 text-sm text-emerald-600">
                  {weeklyDigest.suggestion}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メイン統計カード */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* コミット数 */}
        <div className="glass-card rounded-2xl p-5 text-center">
          <GitPullRequest size={24} className="mx-auto text-emerald-500" />
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {weeklyStats.totalCommits}
          </p>
          <p className="text-sm text-slate-500">コミット数</p>
        </div>

        {/* 変更行数 */}
        <div className="glass-card rounded-2xl p-5 text-center">
          <Code2 size={24} className="mx-auto text-blue-500" />
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {weeklyStats.totalLinesChanged.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500">lines changed</p>
        </div>

        {/* Momentum Score */}
        <div className="glass-card rounded-2xl p-5 text-center">
          <TrendingUp size={24} className="mx-auto text-orange-500" />
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {weeklyStats.weeklyMomentum}
          </p>
          <p className="text-sm text-slate-500">Momentum Score</p>
        </div>

        {/* 新技術 */}
        <div className="glass-card rounded-2xl p-5 text-center">
          <Sparkles size={24} className="mx-auto text-purple-500" />
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {weeklyStats.newTechCount}
          </p>
          <p className="text-sm text-slate-500">新技術</p>
        </div>
      </div>

      {/* 全技術タグ */}
      {weeklyStats.allTechTags.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-900">
            🏷️ 今週使用した技術（全{weeklyStats.allTechTags.length}個）
          </h3>
          <div className="flex flex-wrap gap-2">
            {weeklyStats.allTechTags.map((tag) => (
              <span
                key={tag.name}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
              >
                {tag.name}
                {tag.isNew && (
                  <span className="ml-1 text-xs text-emerald-600">🆕</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 週間サマリー */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
          <Award size={20} className="text-amber-500" />
          週間ハイライト
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* 最もコミットした曜日 */}
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
            <p className="text-sm font-medium text-slate-600">
              最もコミットした曜日
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {weeklyStats.mostProductiveDay.dayOfWeek || "データなし"}
            </p>
            <p className="text-sm text-emerald-600">
              {weeklyStats.mostProductiveDay.commits > 0
                ? `${weeklyStats.mostProductiveDay.commits} commits`
                : "-"}
            </p>
          </div>

          {/* 最も変更が大きかった日報 */}
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <p className="text-sm font-medium text-slate-600">
              最も変更が大きかった日報
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {weeklyStats.biggestChange?.title || "データなし"}
            </p>
            {weeklyStats.biggestChange && (
              <p className="text-sm text-blue-600">
                {weeklyStats.biggestChange.lines.toLocaleString()} lines
              </p>
            )}
          </div>
        </div>
      </div>

      {/* AI Coach（他のメンバーが実装中） */}
      <AICoach message={aiCoachMessages.weekly} />
    </div>
  );
}
