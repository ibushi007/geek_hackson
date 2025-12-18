"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CreateReportInput } from "@/types/report";
import Link from "next/link";
import {
  ArrowLeft,
  GitPullRequest,
  Code2,
  Sparkles,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AICoach } from "@/components/AICoach";

export default function EditLogPage() {
  const params = useParams();
  const router = useRouter();
  const logId = params.id as string;

  // フォーム状態
  const [title, setTitle] = useState("");
  const [todayLearning, setTodayLearning] = useState("");
  const [struggles, setStruggles] = useState("");
  const [tomorrow, setTomorrow] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [prCount, setPrCount] = useState(0);
  const [commitCount, setCommitCount] = useState(0);
  const [linesChanged, setLinesChanged] = useState(0);
  const [changeSize, setChangeSize] = useState<"S" | "M" | "L">("M");
  const [prSummary, setPrSummary] = useState("");
  const [techTags, setTechTags] = useState<Array<{ name: string; isNew: boolean }>>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 既存データを取得して初期値設定
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/reports/${logId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("日報が見つかりませんでした");
          }
          if (response.status === 403) {
            throw new Error("この日報を編集する権限がありません");
          }
          throw new Error("日報の取得に失敗しました");
        }

        const data = await response.json();
        
        // フォームに初期値を設定
        setTitle(data.title || "");
        setTodayLearning(data.todayLearning || "");
        setStruggles(data.struggles || "");
        setTomorrow(data.tomorrow || "");
        setGithubUrl(data.githubUrl || "");
        setPrCount(data.prCount || 0);
        setCommitCount(data.commitCount || 0);
        setLinesChanged(data.linesChanged || 0);
        setChangeSize(data.changeSize || "M");
        setPrSummary(data.prSummary || "");
        setTechTags(data.techTags || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [logId]);

  const handleSubmit = async () => {
    // バリデーション
    if (!title.trim()) {
      toast.error("タイトルを入力してください");
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
      // 日報データを作成してAPIに送信
      const reportData: Partial<CreateReportInput> = {
        title: title,
        todayLearning: todayLearning,
        struggles: struggles || undefined,
        tomorrow: tomorrow || undefined,
        githubUrl: githubUrl,
        prCount: prCount,
        commitCount: commitCount,
        linesChanged: linesChanged,
        changeSize: changeSize,
        prSummary: prSummary,
        techTags: techTags,
      };

      const response = await fetch(`/api/reports/${logId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "日報の更新に失敗しました");
      }

      const updatedReport = await response.json();

      // 成功通知
      toast.success("日報を更新しました！");

      // 更新成功後、詳細画面に遷移
      setTimeout(() => {
        router.push(`/log/${updatedReport.id}`);
      }, 500);
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "日報の更新に失敗しました。もう一度お試しください"
      );
      setIsSubmitting(false);
    }
  };

  // ローディング中
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

  // エラー時
  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <p className="text-lg text-red-600">{error}</p>
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
        href={`/log/${logId}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
      >
        <ArrowLeft size={16} />
        詳細に戻る
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">学習ログを編集</h1>
        <p className="text-sm text-slate-500">
          内容を変更して更新ボタンを押してください
        </p>
      </div>

      {/* GitHub Stats Section */}
      <div className="glass-card rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
            <Sparkles size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              GitHub統計データ
            </p>
            <p className="text-xs text-slate-500">自動生成されたデータ</p>
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            📝 タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: セッション管理とJWTの違いを理解した"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <GitPullRequest size={18} className="mx-auto text-emerald-500" />
            <p className="mt-1 text-lg font-bold text-slate-900">{prCount}</p>
            <p className="text-xs text-slate-500">PR</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <Code2 size={18} className="mx-auto text-blue-500" />
            <p className="mt-1 text-lg font-bold text-slate-900">
              {linesChanged}
            </p>
            <p className="text-xs text-slate-500">lines</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <Clock size={18} className="mx-auto text-orange-500" />
            <p className="mt-1 text-lg font-bold text-slate-900">
              {commitCount}
            </p>
            <p className="text-xs text-slate-500">commits</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <span
              className={`inline-block rounded-full px-2 py-1 text-xs font-bold ${
                changeSize === "L"
                  ? "bg-orange-100 text-orange-700"
                  : changeSize === "M"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-200 text-slate-600"
              }`}
            >
              {changeSize}
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
            {techTags.map((tag) => (
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

        {/* PR Summary */}
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="mb-1 text-xs font-semibold text-slate-500">
            作業内容（LLM整形）
          </p>
          <p className="text-sm leading-relaxed text-slate-700">{prSummary}</p>
        </div>
      </div>

      {/* Manual Input Section */}
      <div className="glass-card rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <span className="text-sm">✍️</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700">
              あなたの振り返り
            </p>
            <p className="text-xs text-slate-500">編集可能な項目です</p>
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
          更新すると変更内容が保存されます
        </p>
        <div className="flex gap-3">
          <Link
            href={`/log/${logId}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            キャンセル
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                更新中...
              </>
            ) : (
              <>更新する</>
            )}
          </button>
        </div>
      </div>

      {/* AI Coach */}
      <AICoach message="編集することで、より良い振り返りになりますね！" />
    </div>
  );
}
