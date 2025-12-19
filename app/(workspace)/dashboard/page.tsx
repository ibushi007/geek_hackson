"use client";

import { useState, useEffect } from "react";
import { PenLine, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { LogCard } from "@/components/LogCard";
import { AICoach } from "@/components/AICoach";
import { learningLogs, user, growthData as mockGrowthData, aiCoachMessages } from "@/lib/mock";
import type { GrowthData } from "@/types/growth";

export default function DashboardPage() {
  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);

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
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, []);

  if (loading) {
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
                {growthData?.weeklyCommits.reduce((a, b) => a + b.value, 0) ?? 0}
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
            href="/growth"
            className="text-sm font-semibold text-emerald-600 hover:underline"
          >
            すべて見る →
          </Link>
        </div>
        <div className="space-y-4">
          {learningLogs.map((log) => (
            <LogCard key={log.id} log={log} />
          ))}
        </div>
      </div>

      {/* AI Coach */}
      <AICoach message={aiCoachMessages.dashboard} />
    </div>
  );
}

