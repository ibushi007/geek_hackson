"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  GitPullRequest,
  Code2,
  Sparkles,
  Clock,
} from "lucide-react";
import { AICoach } from "@/components/AICoach";
import { learningLogs } from "@/lib/mock";

export default function LogDetailPage() {
  const params = useParams();
  const logId = params.id as string;

  const log = learningLogs.find((l) => l.id === logId);

  if (!log) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <p className="text-lg text-slate-500">ログが見つかりませんでした</p>
        <Link
          href="/dashboard"
          className="mt-4 text-sm font-semibold text-emerald-600 hover:underline"
        >
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
      <div>
        <p className="text-sm font-semibold text-slate-500">
          {formatDate(log.createdAt)}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{log.title}</h1>
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
          {log.techTags.map((tag) => (
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
            <p className="text-xs font-semibold text-slate-500">💡 今日の学び</p>
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

function formatDate(date: Date) {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}



