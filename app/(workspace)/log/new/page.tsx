"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreateReportInput } from "@/types/report";
import Link from "next/link";
import {
  ArrowRight,
  GitPullRequest,
  Code2,
  Sparkles,
  Clock,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AICoach } from "@/components/AICoach";
import { aiCoachMessages } from "@/lib/mock";
import { getTodayISODate } from "@/lib/utils/date";

// GitHub統計データの型定義
interface GitHubStats {
  date: string;
  commits: {
    count: number;
    linesChanged: number;
    repositories: string[];
    details: Array<{
      repo: string;
      message: string;
      sha: string;
      additions: number;
      deletions: number;
      url: string;
      date: string;
    }>;
  };
  pullRequests: {
    count: number;
    merged: number;
    reviews: number;
    reviewStatus: string | null;
    details: Array<{
      repo: string;
      title: string;
      number: number;
      state: string;
      merged: boolean;
      body: string | null;
      url: string;
      additions: number;
      deletions: number;
      changedFiles: number;
      createdAt: string;
      mergedAt: string | null;
    }>;
  };
  techTags: Array<{
    name: string;
    isNew: boolean;
  }>;
  changeSize: "S" | "M" | "L";
  prSummary: string;
}

// LLM生成風のタイトル候補を生成する関数
const generateTitleSuggestions = (stats: GitHubStats | null): string[] => {
  if (!stats) {
    return [
      "📝 今日の学習記録",
      "💻 プログラミングの記録",
      "🚀 開発の一日",
    ];
  }

  const suggestions: string[] = [];
  const { commits, pullRequests, techTags } = stats;

  // PRベースのタイトル
  if (pullRequests.count > 0 && pullRequests.details.length > 0) {
    const mainPR = pullRequests.details[0];
    suggestions.push(`🚀 ${mainPR.title}`);
    if (pullRequests.merged > 0) {
      suggestions.push(`✅ PRマージ完了: ${mainPR.title}`);
    }
  }

  // 技術スタックベースのタイトル
  const newTechs = techTags.filter((t) => t.isNew);
  if (newTechs.length > 0) {
    suggestions.push(`🆕 ${newTechs[0].name}を学んだ日`);
  }

  // コミット数ベースのタイトル
  if (commits.count >= 5) {
    suggestions.push(`💪 ${commits.count}コミット達成の日`);
  }

  // デフォルトの候補
  if (suggestions.length === 0) {
    suggestions.push(
      "📝 今日の開発記録",
      "💻 コードと向き合った一日",
      "🎯 着実に前進した日",
    );
  }

  return suggestions.slice(0, 3);
};

export default function NewLogPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [todayLearning, setTodayLearning] = useState("");
  const [struggles, setStruggles] = useState("");
  const [tomorrow, setTomorrow] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // GitHub統計データの状態管理
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [isLoadingGitHub, setIsLoadingGitHub] = useState(true);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);

  // GitHubデータを取得する関数（useCallbackでメモ化）
  const fetchGitHubStats = useCallback(async (date?: string) => {
    setIsLoadingGitHub(true);
    setGithubError(null);

    try {
      const targetDate = date || getTodayISODate();
      const response = await fetch(
        `/api/github/daily-stats?date=${targetDate}`,
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("認証エラー: 再度ログインしてください");
        }
        throw new Error("GitHubデータの取得に失敗しました");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "データの取得に失敗しました");
      }

      setGithubStats(result.data);
      
      // タイトル候補を生成
      const suggestions = generateTitleSuggestions(result.data);
      setTitleSuggestions(suggestions);
      setTitle(suggestions[0]);

      toast.success("GitHubデータを取得しました！");
    } catch (error) {
      console.error("Failed to fetch GitHub stats:", error);
      const errorMessage =
        error instanceof Error ? error.message : "データの取得に失敗しました";
      setGithubError(errorMessage);
      toast.error(errorMessage);

      // エラー時はデフォルトのタイトル候補を設定
      const defaultSuggestions = generateTitleSuggestions(null);
      setTitleSuggestions(defaultSuggestions);
      setTitle(defaultSuggestions[0]);
    } finally {
      setIsLoadingGitHub(false);
    }
  }, []);

  // コンポーネントマウント時に自動取得
  useEffect(() => {
    fetchGitHubStats();
  }, [fetchGitHubStats]);

  const handleSubmit = async () => {
    // バリデーション
    if (!title.trim()) {
      toast.error("タイトルを選択してください");
      return;
    }
    if (!todayLearning.trim()) {
      toast.error("「今日の学び」は必須項目です");
      return;
    }
    if (todayLearning.trim().length < 5) {
      toast.error("「今日の学び」は5文字以上入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      // GitHubデータがない場合は警告
      if (!githubStats) {
        toast.error("GitHubデータを取得してください");
        setIsSubmitting(false);
        return;
      }

      // 日報データを作成してAPIに送信
      const reportData: CreateReportInput = {
        title: title,
        todayLearning: todayLearning,
        struggles: struggles || undefined,
        tomorrow: tomorrow || undefined,
        githubUrl:
          githubStats.commits.repositories[0] ||
          githubStats.pullRequests.details[0]?.url ||
          "https://github.com",
        prCount: githubStats.pullRequests.count,
        commitCount: githubStats.commits.count,
        linesChanged: githubStats.commits.linesChanged,
        changeSize: githubStats.changeSize,
        prSummary: githubStats.prSummary,
        techTags: githubStats.techTags,
      };

      const response = await fetch("/api/reports/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "日報の保存に失敗しました");
      }

      const savedReport = await response.json();

      // 成功通知
      toast.success("日報を保存しました！");

      // 保存成功後、詳細画面に遷移
      setTimeout(() => {
        router.push(`/log/${savedReport.id}`);
      }, 500);
    } catch (error) {
      console.error("Failed to submit report:", error);
      const errorMessage = 
        error instanceof Error 
          ? error.message 
          : "日報の作成に失敗しました";
      
      // エラーメッセージを日本語化
      if (errorMessage.includes("already exists") || errorMessage.includes("Failed to report creation")) {
        toast.error("今日の日報はすでに存在します。編集画面から修正してください。");
      } else {
        toast.error(errorMessage);
      }
    } finally {
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
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
              <Sparkles size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                自動生成（80%）
              </p>
              <p className="text-xs text-slate-500">
                {isLoadingGitHub
                  ? "GitHubから取得中..."
                  : githubError
                    ? "データ取得失敗"
                    : "GitHubから自動取得しました"}
              </p>
            </div>
          </div>
          
          {/* 再取得ボタン */}
          <button
            onClick={() => fetchGitHubStats()}
            disabled={isLoadingGitHub}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            title="GitHubデータを再取得"
            aria-label="GitHubデータを再取得"
            aria-busy={isLoadingGitHub}
          >
            <RefreshCw
              size={14}
              className={isLoadingGitHub ? "animate-spin" : ""}
              aria-hidden="true"
            />
            再取得
          </button>
        </div>

        {/* ローディング状態 */}
        {isLoadingGitHub && (
          <div 
            className="flex min-h-[200px] items-center justify-center"
            role="status"
            aria-live="polite"
          >
            <div className="text-center">
              <Loader2
                size={32}
                className="mx-auto animate-spin text-emerald-500"
                aria-hidden="true"
              />
              <p className="mt-2 text-sm text-slate-500">
                GitHubからデータを取得しています...
              </p>
            </div>
          </div>
        )}

        {/* エラー状態 */}
        {!isLoadingGitHub && githubError && (
          <div 
            className="flex min-h-[200px] flex-col items-center justify-center rounded-xl bg-red-50 p-6"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle size={32} className="text-red-500" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold text-red-700">
              {githubError}
            </p>
            <button
              onClick={() => fetchGitHubStats()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
              aria-label="GitHubデータ取得を再試行"
            >
              <RefreshCw size={14} aria-hidden="true" />
              再試行
            </button>
          </div>
        )}

        {/* データ表示 */}
        {!isLoadingGitHub && !githubError && githubStats && (
          <>
            {/* Title Selection */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                📝 今日のタイトル（AI生成）
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
                  {githubStats.pullRequests.count}
                </p>
                <p className="text-xs text-slate-500">PR</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <Code2 size={18} className="mx-auto text-blue-500" />
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {githubStats.commits.linesChanged}
                </p>
                <p className="text-xs text-slate-500">lines</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <Clock size={18} className="mx-auto text-orange-500" />
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {githubStats.commits.count}
                </p>
                <p className="text-xs text-slate-500">commits</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-bold ${
                    githubStats.changeSize === "L"
                      ? "bg-orange-100 text-orange-700"
                      : githubStats.changeSize === "M"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {githubStats.changeSize}
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
                {githubStats.techTags.length > 0 ? (
                  githubStats.techTags.map((tag) => (
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
                  ))
                ) : (
                  <p className="text-sm text-slate-400">技術タグなし</p>
                )}
              </div>
            </div>

            {/* Auto Summary */}
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="mb-1 text-xs font-semibold text-slate-500">
                作業内容（AI整形）
              </p>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {githubStats.prSummary || "本日の活動なし"}
              </p>
            </div>
          </>
        )}
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
            <p className="text-xs text-slate-500">
              1行でOK！学びを定着させよう
            </p>
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
          disabled={isSubmitting || isLoadingGitHub || !githubStats}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              保存中...
            </>
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
