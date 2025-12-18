"use client";

import { useState } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";

type Props = {
  message: string;
};

export function AICoach({ message }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30 transition hover:scale-105 lg:bottom-6"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-20 right-4 z-50 lg:bottom-6 ${
        isMinimized ? "w-auto" : "w-72"
      }`}
    >
      <div className="ai-coach-float glass-card overflow-hidden rounded-2xl shadow-xl shadow-slate-200/50">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3">
          <div className="flex items-center gap-2 text-white">
            <Sparkles size={18} />
            <span className="text-sm font-semibold">AI Learning Coach</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="rounded-full p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              <span className="text-xs">{isMinimized ? "開く" : "−"}</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        {!isMinimized && (
          <div className="p-4">
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100">
                <span className="text-lg">🤖</span>
              </div>
              {/* Message bubble */}
              <div className="flex-1">
                <p className="text-sm leading-relaxed text-slate-600">
                  {message}
                </p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">
                💪 ありがとう！
              </button>
              <button className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200">
                📝 日報を書く
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




