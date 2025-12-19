"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  GitPullRequest,
  Code2,
  Sparkles,
  Clock,
  Pencil,
} from "lucide-react";
import { AICoach } from "@/components/AICoach";
import type { ReportResponse } from "@/types/report";

export default function LogDetailPage() {
  const params = useParams();
  const logId = params.id as string;

  const [log, setLog] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/reports/${logId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("日報が見つかりませんでした");
          }
          if (response.status === 403) {
            throw new Error("この日報を閲覧する権限がありません");
          }
          throw new Error("日報の取得に失敗しました");
        }

        const data = await response.json();
        setLog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLog();
  }, [logId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-sm text-slate-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <p className="text-lg text-red-600">
          {error || "日報が見つかりませんでした"}
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          <ArrowLeft size={16} />
          ダッシュボードに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
      >
        <ArrowLeft size={16} />
        ダッシュボードに戻る
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {formatDate(log.createdAt)}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            {log.title}
          </h1>
        </div>

        {/* Edit Button */}
        <Link
          href={`/log/${logId}/edit`}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          <Pencil size={16} />
          編集
        </Link>
      </div>

      {/* Stats */}
      <div className="glass-card rounded-2xl p-5">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <GitPullRequest size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{log.prCount}</p>
              <p className="text-xs text-slate-500">PR</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Code2 size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {log.linesChanged}
              </p>
              <p className="text-xs text-slate-500">lines</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
              <Clock size={18} className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {log.commitCount}
              </p>
              <p className="text-xs text-slate-500">commits</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
                log.changeSize === "L"
                  ? "bg-orange-100 text-orange-700"
                  : log.changeSize === "M"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {log.changeSize}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-700">変更規模</p>
              <p className="text-xs text-slate-500">
                {log.changeSize === "L"
                  ? "大きい"
                  : log.changeSize === "M"
                    ? "中程度"
                    : "小さい"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Tags */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">
          🏷️ 使用技術
        </h3>
        <div className="flex flex-wrap gap-2">
          {(log.techTags || []).map((tag) => (
            <span
              key={tag.name}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                tag.isNew
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tag.isNew && "🆕 "}
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* PR Summary */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Sparkles size={16} className="text-emerald-600" />
          作業内容（LLM生成）
        </h3>
        <p className="leading-relaxed text-slate-700">{log.prSummary}</p>
      </div>

      {/* Manual Input */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">
          ✍️ 振り返り
        </h3>

        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">
              💡 今日の学び
            </p>
            <p className="mt-1 text-slate-700">{log.todayLearning}</p>
          </div>

          {log.struggles && (
            <div className="rounded-xl bg-orange-50 p-4">
              <p className="text-xs font-semibold text-orange-600">
                😵 詰まったところ
              </p>
              <p className="mt-1 text-slate-700">{log.struggles}</p>
            </div>
          )}

          {log.tomorrow && (
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-xs font-semibold text-blue-600">
                🎯 明日やること
              </p>
              <p className="mt-1 text-slate-700">{log.tomorrow}</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Coach Comment */}
      {log.aiCoachComment && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                AI Learning Coach
              </p>
              <p className="mt-1 leading-relaxed text-slate-600">
                {log.aiCoachComment}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Coach Widget */}
      <AICoach message="詳細を見返すことで、学びがより深まりますね！" />
    </div>
  );
}

function formatDate(dateString: string | Date) {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}
