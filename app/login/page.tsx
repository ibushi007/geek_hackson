"use client";

import { signIn } from "next-auth/react";
import { Github, PenLine } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="glass-card rounded-3xl p-8 w-full max-w-md mx-4 text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500">
              <PenLine size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Developer Studyplus
          </h1>
          <p className="text-sm text-slate-500">
            GitHubと連携して、あなたの学習を自動記録
          </p>
        </div>

        <button
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg shadow-slate-900/25 hover:shadow-xl hover:shadow-slate-900/30 transition-all hover:-translate-y-0.5"
        >
          <Github size={20} />
          GitHubでログイン
        </button>

        <p className="text-xs text-slate-400 mt-6">
          ログインすることで利用規約とプライバシーポリシーに同意したものとみなします
        </p>
      </div>
    </div>
  );
}
