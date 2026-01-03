"use client"; // ← これが一番上に必要です

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">ログインページ</h1>
        <p className="text-slate-400 mb-8">ここからログイン処理を行います</p>
        
        <button 
          onClick={() => signIn("github", { callbackUrl: "/log/new" })} // ← ここを変更
          className="rounded-lg bg-blue-600 px-6 py-2 hover:bg-blue-700"
        >
          GitHubでログインする
        </button>
      </div>
    </div>
  );
}