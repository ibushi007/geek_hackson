"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  GitPullRequest,
  Code2,
  Sparkles,
  Clock,
} from "lucide-react";
import { AICoach } from "@/components/AICoach";
import { aiCoachMessages } from "@/lib/mock";

// モック: GitHub APIから取得する想定のデータ
const mockGitHubData = {
  prCount: 2,
  commitCount: 8,
  linesChanged: 240,
  changeSize: "M" as const,
  techTags: [
    { name: "NextAuth", isNew: true },
    { name: "Prisma", isNew: false },
    { name: "TypeScript", isNew: false },
  ],
  autoSummary:
    "認証機能の実装を中心に、比較的大きな変更を行いました。GitHub OAuthの設定とユーザー情報のDB保存を完成させました。",
};

// LLM生成風のタイトル候補
const titleSuggestions = [
  "🔐 認証フローを一段深く理解した日",
  "🚀 OAuth実装を完走した日",
  "💡 セッション管理の謎が解けた日",
];

export default function NewLogPage() {
  const router = useRouter();
  const [title, setTitle] = useState(titleSuggestions[0]);
  const [todayLearning, setTodayLearning] = useState("");
  const [struggles, setStruggles] = useState("");
  const [tomorrow, setTomorrow] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!todayLearning.trim()) {
      alert("「今日の学び」は必須です！");
      return;
    }
    setIsSubmitting(true);
    
    try {
      // 日報データを作成してAPIに送信
      const reportData = {
        githubUrl: "https://github.com/example/repo", // モックデータ
        dailyNote: `${title}\n\n💡 今日の学び: ${todayLearning}${struggles ? `\n😵 詰まったところ: ${struggles}` : ""}${tomorrow ? `\n🎯 明日やること: ${tomorrow}` : ""}`,
        diffCount: `+${mockGitHubData.linesChanged}`,
        aiScore: 85,
        aiGoodPoints: mockGitHubData.autoSummary,
        aiBadPoints: struggles || "特になし",
        aiStudyTime: "2時間30分",
        workDurationSec: 9000,
      };

      const response = await fetch("/api/reports/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error("日報の保存に失敗しました");
      }

      const savedReport = await response.json();
      
      // 保存成功後、詳細画面に遷移
      router.push(`/log/${savedReport.id}`);
    } catch (error) {
      console.error("Error saving report:", error);
      alert("日報の保存に失敗しました。もう一度お試しください。");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">今日の学習ログ</h1>
        <p className="text-sm text-slate-500">
          GitHubから自動取得 + あなたの振り返りで日報が完成します
        </p>
      </div>

      {/* Auto-generated Section (80%) */}
      <div className="glass-card rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
            <Sparkles size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              自動生成（80%）
            </p>
            <p className="text-xs text-slate-500">GitHubから自動取得しました</p>
          </div>
        </div>

        {/* Title Selection */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            📝 今日のタイトル（LLM生成）
          </label>
          <select
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
          >
            {titleSuggestions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <GitPullRequest size={18} className="mx-auto text-emerald-500" />
            <p className="mt-1 text-lg font-bold text-slate-900">
              {mockGitHubData.prCount}
            </p>
            <p className="text-xs text-slate-500">PR</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <Code2 size={18} className="mx-auto text-blue-500" />
            <p className="mt-1 text-lg font-bold text-slate-900">
              {mockGitHubData.linesChanged}
            </p>
            <p className="text-xs text-slate-500">lines</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <Clock size={18} className="mx-auto text-orange-500" />
            <p className="mt-1 text-lg font-bold text-slate-900">
              {mockGitHubData.commitCount}
            </p>
            <p className="text-xs text-slate-500">commits</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <span
              className={`inline-block rounded-full px-2 py-1 text-xs font-bold ${
                mockGitHubData.changeSize === "L"
                  ? "bg-orange-100 text-orange-700"
                  : mockGitHubData.changeSize === "M"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-200 text-slate-600"
              }`}
            >
              {mockGitHubData.changeSize}
            </span>
            <p className="mt-1 text-xs text-slate-500">変更規模</p>
          </div>
        </div>

        {/* Tech Tags */}
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            🏷️ 使用技術
          </p>
          <div className="flex flex-wrap gap-2">
            {mockGitHubData.techTags.map((tag) => (
              <span
                key={tag.name}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
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

        {/* Auto Summary */}
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="mb-1 text-xs font-semibold text-slate-500">
            作業内容（LLM整形）
          </p>
          <p className="text-sm leading-relaxed text-slate-700">
            {mockGitHubData.autoSummary}
          </p>
        </div>
      </div>

      {/* Manual Input Section (20%) */}
      <div className="glass-card rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <span className="text-sm">✍️</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700">
              あなたの振り返り（20%）
            </p>
            <p className="text-xs text-slate-500">1行でOK！学びを定着させよう</p>
          </div>
        </div>

        {/* Today's Learning (Required) */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            💡 今日の学び <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={todayLearning}
            onChange={(e) => setTodayLearning(e.target.value)}
            placeholder="例: セッション管理とJWTの違いを理解した"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* Struggles (Optional) */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            😵 詰まったところ（任意）
          </label>
          <input
            type="text"
            value={struggles}
            onChange={(e) => setStruggles(e.target.value)}
            placeholder="例: NextAuthの型定義で苦戦した"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* Tomorrow (Optional) */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            🎯 明日やること（任意）
          </label>
          <input
            type="text"
            value={tomorrow}
            onChange={(e) => setTomorrow(e.target.value)}
            placeholder="例: 日報APIのテストを書く"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          送信すると今日の学習ログが保存されます
        </p>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? (
            "保存中..."
          ) : (
            <>
              保存する
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      {/* AI Coach */}
      <AICoach message={aiCoachMessages.newLog} />
    </div>
  );
}

