"use client";

import {
  GitPullRequest,
  Code2,
  Sparkles,
  TrendingUp,
  Mail,
  Star,
} from "lucide-react";
import { AICoach } from "@/components/AICoach";
import { weeklyDigest, aiCoachMessages } from "@/lib/mock";

export default function WeeklyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Mail size={24} className="text-emerald-600" />
          <h1 className="text-3xl font-bold text-slate-900">
            Weekly Learning Digest
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          {weeklyDigest.weekLabel}の振り返りレポート
        </p>
      </div>

      {/* AI Message Card (最重要) */}
      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Sparkles size={20} />
            <span className="text-sm font-semibold">AIからのメッセージ</span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">
                {weeklyDigest.aiMessage}
              </p>
              <div className="mt-4 rounded-xl bg-emerald-50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <Star size={16} className="text-amber-500" />
                  今週の提案
                </p>
                <p className="mt-1 text-sm text-emerald-600">
                  {weeklyDigest.suggestion}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card rounded-2xl p-5 text-center">
          <GitPullRequest size={24} className="mx-auto text-emerald-500" />
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {weeklyDigest.prCount}
          </p>
          <p className="text-sm text-slate-500">PR / コミット</p>
        </div>

        <div className="glass-card rounded-2xl p-5 text-center">
          <Code2 size={24} className="mx-auto text-blue-500" />
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {weeklyDigest.totalLines.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500">lines changed</p>
        </div>

        <div className="glass-card rounded-2xl p-5 text-center">
          <TrendingUp size={24} className="mx-auto text-orange-500" />
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {weeklyDigest.momentum}
          </p>
          <p className="text-sm text-slate-500">Momentum Score</p>
        </div>

        <div className="glass-card rounded-2xl p-5 text-center">
          <Sparkles size={24} className="mx-auto text-purple-500" />
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {weeklyDigest.newTech.length}
          </p>
          <p className="text-sm text-slate-500">新技術</p>
        </div>
      </div>

      {/* New Technologies */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
          🆕 今週初めて使った技術
        </h3>
        <div className="flex flex-wrap gap-3">
          {weeklyDigest.newTech.map((tech) => (
            <div
              key={tech}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <Sparkles size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{tech}</p>
                <p className="text-xs text-slate-500">初めて使用</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="mb-4 text-lg font-bold text-slate-900">
          📊 週間サマリー
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">最もコミットした日</p>
            <p className="mt-1 text-lg font-bold text-slate-900">水曜日</p>
            <p className="text-xs text-emerald-600">12 commits</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">最も変更が大きかったPR</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              認証機能の実装
            </p>
            <p className="text-xs text-blue-600">240 lines</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
          📤 レポートを共有
        </button>
        <button className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
          📥 PDFでダウンロード
        </button>
      </div>

      {/* AI Coach */}
      <AICoach message={aiCoachMessages.weekly} />
    </div>
  );
}



