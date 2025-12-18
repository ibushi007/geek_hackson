"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PenLine, ArrowLeft, BookOpen } from "lucide-react";
import { LogCard } from "@/components/LogCard";
import type { ReportResponse, ShowReportsResponse } from "@/types/report";

export default function LogsPage() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/reports");

        if (!response.ok) {
          throw new Error("日報の取得に失敗しました");
        }

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

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
      >
        <ArrowLeft size={16} />
        ダッシュボードに戻る
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100">
              <BookOpen size={24} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">学習ログ一覧</h1>
              <p className="text-sm text-slate-500">
                {isLoading ? "読み込み中..." : `全${reports.length}件の日報`}
              </p>
            </div>
          </div>
        </div>

        {/* New Log Button */}
        <Link
          href="/log/new"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <PenLine size={16} />
          新しい日報を書く
        </Link>
      </div>

      {/* Stats Card */}
      {!isLoading && !error && reports.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <BookOpen size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">総日報数</p>
                <p className="text-2xl font-bold text-slate-900">{reports.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <span className="text-lg">📊</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">総PR数</p>
                <p className="text-2xl font-bold text-slate-900">
                  {reports.reduce((sum, r) => sum + r.prCount, 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <span className="text-lg">💻</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">総コミット数</p>
                <p className="text-2xl font-bold text-slate-900">
                  {reports.reduce((sum, r) => sum + r.commitCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learning Logs */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">すべての学習ログ</h2>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                <p className="mt-4 text-sm text-slate-500">読み込み中...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
              <div className="text-center">
                <p className="text-lg text-red-600">{error}</p>
                <Link
                  href="/dashboard"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  <ArrowLeft size={16} />
                  ダッシュボードに戻る
                </Link>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <BookOpen size={32} className="text-slate-400" />
                </div>
                <p className="text-lg font-semibold text-slate-700">
                  まだ日報がありません
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  最初の日報を作成してみましょう
                </p>
                <Link
                  href="/log/new"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <PenLine size={16} />
                  最初の日報を書く
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Count Display */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-600">
                  全 <span className="font-bold text-slate-900">{reports.length}</span> 件の日報
                </p>
                <p className="text-xs text-slate-500">
                  新しい順に表示
                </p>
              </div>

              {/* Log Cards */}
              {reports.map((log) => (
                <LogCard key={log.id} log={log} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
