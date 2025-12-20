"use client";

import { useEffect, useState } from "react";
import { PenLine, TrendingUp, Zap, LogOut } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogCard } from "@/components/LogCard";
import { AICoach } from "@/components/AICoach";

import {
  user,
  growthData as mockGrowthData,
  aiCoachMessages,
} from "@/lib/mock";
import type { GrowthData } from "@/types/growth";
import type { ReportResponse, ShowReportsResponse } from "@/types/report";

export default function DashboardPage() {
  const { data: session } = useSession();

  // ===== growth (/api/growth) =====
  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
  const [growthLoading, setGrowthLoading] = useState(true);

  // ===== reports (/api/reports) =====
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- fetch growth ----
  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const response = await fetch("/api/growth");
        if (!response.ok) throw new Error("Failed to fetch growth data");
        const data: GrowthData = await response.json();
        setGrowthData(data);
      } catch (err) {
        console.error("Error fetching growth data:", err);
        // エラー時はモックデータへフォールバック
        setGrowthData({
          weeklyCommits: mockGrowthData.weeklyCommits,
          streak: mockGrowthData.streak,
          momentum: mockGrowthData.momentum,
        });
      } finally {
        setGrowthLoading(false);
      }
    };

    fetchGrowthData();
  }, []);

  // ---- fetch reports ----
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        setError(null);

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

  // growth は上部の数字に直結するので、最低限ロード中表示を入れる（reports はセクション内で表示済み）
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
          <div className="flex items-center gap-3 mb-2">
            <img
              src={session?.user?.image || ""}
              alt="GitHub Avatar"
              className="w-8 h-8 rounded-full border-2 border-slate-200"
            />
            <p className="text-sm font-semibold text-slate-500">
              おかえりなさい、{session?.user?.name}さん
            </p>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Learning Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/log/new"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <PenLine size={16} />
            今日の日報を書く
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            ログアウト
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
              <span className="text-lg">🔥</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">学習ストリーク</p>
              <p className="text-2xl font-bold text-slate-900">
                {growthData?.streak ?? 0}日連続
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <TrendingUp size={20} className="text-emerald-600" />
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Zap size={20} className="text-blue-600" />
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
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                <p className="mt-4 text-sm text-slate-500">読み込み中...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <p className="text-sm text-red-600">{error}</p>
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

      {/* AI Coach */}
      <AICoach message={aiCoachMessages.dashboard} />
    </div>
  );
}
