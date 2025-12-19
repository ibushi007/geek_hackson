"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PenLine, ArrowLeft, BookOpen, Search, Trash2 } from "lucide-react";
import { LogCard } from "@/components/LogCard";
import type { ReportResponse, ShowReportsResponse } from "@/types/report";

export default function LogsPage() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "prCount">("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitDeleteMode = () => {
    setIsDeleteMode(false);
    setSelectedIds(new Set());
  };

  const filteredReports = reports.filter((log) => {
    const title = (log.title ?? "").toLowerCase();
    const learning = (log.todayLearning ?? "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return title.includes(q) || learning.includes(q);
  });  

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return b.prCount - a.prCount;
  });
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = sortedReports.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    if (!window.confirm(`${selectedIds.size}件の日報を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      // 各日報を個別に削除
      const deletePromises = Array.from(selectedIds).map(id =>
        fetch(`/api/reports/${id}`, { method: "DELETE" })
      );

      const results = await Promise.all(deletePromises);
      
      const failedCount = results.filter(r => !r.ok).length;
      
      if (failedCount > 0) {
        throw new Error(`${failedCount}件の削除に失敗しました`);
      }

      // ローカル state からも削除して即時反映
      setReports((prev) => prev.filter((r) => !selectedIds.has(r.id)));

      // 削除後はモード解除 & 選択リセット
      exitDeleteMode();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsDeleting(false);
    }
  };

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
              <h1 className="text-3xl font-bold text-slate-900">
                学習ログ一覧
              </h1>
              <p className="text-sm text-slate-500">
                {isLoading ? "読み込み中..." : `全${sortedReports.length}件の日報`}{" "}
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
                <p className="text-2xl font-bold text-slate-900">
                  {reports.length}
                </p>
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

        {/* 👇 ここに操作UIをまとめる */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* 左：検索 */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="タイトルや学びで検索..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 pl-10 text-sm"
            />
            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />
          </div>

          {/* 右：並び替え / 削除 */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "prCount")}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            >
              <option value="date">新しい順</option>
              <option value="prCount">PR数が多い順</option>
            </select>

            {isDeleteMode ? (
              <>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0 ||  isDeleting}
                  className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  選択分を削除
                </button>

                <button
                  onClick={exitDeleteMode}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
                >
                  キャンセル
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsDeleteMode(true)}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
              >
                選択して削除
              </button>
            )}
          </div>
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
                  全{" "}
                  <span className="font-bold text-slate-900">
                    {sortedReports.length}
                  </span>{" "}
                  件の日報
                </p>
                <p className="text-xs text-slate-500">新しい順に表示</p>
              </div>

              {/* Log Cards */}
              {paginatedReports.map((log) => {
                const selected = selectedIds.has(log.id);

                return (
                  <div
                    key={log.id}
                    className={`relative transition ${
                      isDeleteMode ? "rounded-2xl bg-slate-50" : ""
                    }`}
                  >
                    {/* 選択レイヤー */}
                    {isDeleteMode && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleSelect(log.id);
                        }}
                        className={`absolute inset-0 z-10 flex items-start justify-end p-4 rounded-2xl transition
                          ${
                            selected
                              ? "bg-emerald-500/10 ring-2 ring-emerald-300"
                              : "hover:bg-slate-200/40"
                          }`}
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs font-bold
                            ${
                              selected
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                        >
                          {selected && "✓"}
                        </span>
                      </button>
                    )}

                    {/* 本体カード */}
                    <div className={isDeleteMode ? "pointer-events-none" : ""}>
                      <LogCard log={log} />
                    </div>
                  </div>
                );
              })}

              {/* ページネーション */}
              {sortedReports.length > itemsPerPage && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    前へ
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({
                      length: Math.ceil(sortedReports.length / itemsPerPage),
                    }).map((_, i) => {
                      const pageNum = i + 1;
                      const totalPages = Math.ceil(
                        sortedReports.length / itemsPerPage
                      );

                      // 最初のページ、最後のページ、現在のページ付近のみ表示
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        Math.abs(pageNum - currentPage) <= 1
                      ) {
                        return (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`h-10 w-10 rounded-lg text-sm font-semibold transition ${
                              currentPage === pageNum
                                ? "bg-emerald-500 text-white"
                                : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return (
                          <span key={i} className="px-2 text-slate-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(
                          Math.ceil(sortedReports.length / itemsPerPage),
                          p + 1
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(sortedReports.length / itemsPerPage)
                    }
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    次へ
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
