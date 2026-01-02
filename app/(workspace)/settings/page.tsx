"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Github,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isCheckingToken, setIsCheckingToken] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<{
    valid: boolean;
    message: string;
    rateLimit?: {
      limit: number;
      remaining: number;
      reset: Date;
    };
  } | null>(null);

  // Token有効性チェック（useCallbackでメモ化）
  const checkTokenValidity = useCallback(async () => {
    setIsCheckingToken(true);
    setTokenStatus(null);

    try {
      const response = await fetch("/api/github/test");

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("認証エラー: GitHubアクセストークンが無効です");
        }
        throw new Error("接続テストに失敗しました");
      }

      const result = await response.json();

      if (result.success) {
        setTokenStatus({
          valid: true,
          message: "GitHub連携は正常です",
          rateLimit: result.rateLimit,
        });
        toast.success("GitHub連携を確認しました");
      } else {
        throw new Error(result.error || "エラーが発生しました");
      }
    } catch (error) {
      console.error("Token check failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "接続テストに失敗しました";
      setTokenStatus({
        valid: false,
        message: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setIsCheckingToken(false);
    }
  }, []);

  // 初回マウント時にチェック
  useEffect(() => {
    if (session?.user) {
      checkTokenValidity();
    }
  }, [session, checkTokenValidity]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft size={16} />
          ダッシュボードに戻る
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">設定</h1>
        <p className="mt-1 text-sm text-slate-500">
          GitHub連携とアカウント設定
        </p>
      </div>

      {/* GitHub連携セクション */}
      <div className="glass-card rounded-2xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <Github size={24} className="text-slate-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">GitHub連携</h2>
            <p className="text-sm text-slate-500">
              GitHubアカウントとの連携状態
            </p>
          </div>
        </div>

        {/* ユーザー情報 */}
        {session?.user && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={48}
                  height={48}
                  className="rounded-full"
                  priority
                />
              )}
              <div>
                <p className="font-semibold text-slate-900">
                  {session.user.name || "名前未設定"}
                </p>
                <p className="text-sm text-slate-500">
                  @{(session.user as any).githubId || "unknown"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Token Status */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              アクセストークン状態
            </p>
            <button
              onClick={checkTokenValidity}
              disabled={isCheckingToken}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="GitHub連携状態を再確認"
              aria-busy={isCheckingToken}
            >
              <RefreshCw
                size={14}
                className={isCheckingToken ? "animate-spin" : ""}
                aria-hidden="true"
              />
              再確認
            </button>
          </div>

          {isCheckingToken && (
            <div 
              className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 p-3"
              role="status"
              aria-live="polite"
            >
              <RefreshCw size={16} className="animate-spin text-blue-600" aria-hidden="true" />
              <p className="text-sm text-blue-700">確認中...</p>
            </div>
          )}

          {!isCheckingToken && tokenStatus && (
            <div
              className={`mt-3 flex items-start gap-2 rounded-lg p-3 ${
                tokenStatus.valid
                  ? "bg-emerald-50"
                  : "bg-red-50"
              }`}
              role={tokenStatus.valid ? "status" : "alert"}
              aria-live="polite"
            >
              {tokenStatus.valid ? (
                <CheckCircle2 size={18} className="text-emerald-600" aria-hidden="true" />
              ) : (
                <XCircle size={18} className="text-red-600" aria-hidden="true" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${
                    tokenStatus.valid ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {tokenStatus.message}
                </p>
                {tokenStatus.valid && tokenStatus.rateLimit && (
                  <p className="mt-1 text-xs text-slate-600">
                    API制限: {tokenStatus.rateLimit.remaining} /{" "}
                    {tokenStatus.rateLimit.limit} 残り (
                    {new Date(tokenStatus.rateLimit.reset).toLocaleTimeString(
                      "ja-JP",
                    )}{" "}
                    にリセット)
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 説明 */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex gap-2">
            <Info size={16} className="mt-0.5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-blue-900">
                GitHub連携について
              </p>
              <p className="mt-1 text-xs leading-relaxed text-blue-700">
                このアプリはGitHub
                OAuthを使用してあなたのGitHubアカウントと連携しています。
                日報作成時に、コミット情報やPR情報を自動的に取得します。
              </p>
              <p className="mt-2 text-xs leading-relaxed text-blue-700">
                取得する権限: リポジトリの読み取り、ユーザー情報の読み取り
              </p>
            </div>
          </div>
        </div>

        {/* 問題が発生した場合 */}
        {tokenStatus && !tokenStatus.valid && (
          <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex gap-2">
              <AlertCircle
                size={16}
                className="mt-0.5 flex-shrink-0 text-orange-600"
              />
              <div>
                <p className="text-sm font-semibold text-orange-900">
                  問題の解決方法
                </p>
                <ul className="mt-2 space-y-1 text-xs text-orange-700">
                  <li>• 一度ログアウトして、再度ログインしてみてください</li>
                  <li>
                    • それでも解決しない場合は、GitHub側でアプリの連携を解除してから再連携してください
                  </li>
                  <li>
                    •{" "}
                    <a
                      href="https://github.com/settings/applications"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-orange-900"
                    >
                      GitHub設定ページ
                    </a>
                    から確認できます
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* その他の設定（将来の拡張用） */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">その他の設定</h2>
        <p className="text-sm text-slate-500">現在、設定項目はありません</p>
      </div>
    </div>
  );
}
