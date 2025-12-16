import Link from "next/link";
import { ArrowRight, GitPullRequest, Code2 } from "lucide-react";
import type { LearningLog } from "@/lib/mock";

type Props = {
  log: LearningLog;
};

export function LogCard({ log }: Props) {
  return (
    <Link
      href={`/log/${log.id}`}
      className="glass-card block rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-500">
            {formatDate(log.date)}
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{log.title}</h3>
        </div>
        <ArrowRight size={18} className="mt-1 text-slate-400" />
      </div>

      {/* Stats */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <GitPullRequest size={14} className="text-emerald-500" />
          <span>{log.prCount} PR</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Code2 size={14} className="text-blue-500" />
          <span>{log.linesChanged} lines</span>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            log.changeSize === "L"
              ? "bg-orange-100 text-orange-700"
              : log.changeSize === "M"
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          {log.changeSize}
        </span>
      </div>

      {/* Tech Tags */}
      <div className="mt-3 flex flex-wrap gap-2">
        {log.techTags.map((tag) => (
          <span
            key={tag.name}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
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

      {/* Today's Learning */}
      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <p className="text-xs font-semibold text-slate-500">💡 今日の学び</p>
        <p className="mt-1 text-sm text-slate-700">{log.todayLearning}</p>
      </div>

      {/* AI Coach Comment */}
      <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50 p-3">
        <span className="text-sm">🤖</span>
        <p className="text-xs leading-relaxed text-emerald-700">
          {log.aiCoachComment}
        </p>
      </div>
    </Link>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

