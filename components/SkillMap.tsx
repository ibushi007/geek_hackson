"use client";

import { Sparkles, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type Skill = {
  name: string;
  level: number;
  isNew: boolean;
};

type Props = {
  skills: Skill[];
};

const DEFAULT_DISPLAY_COUNT = 5; // デフォルトで表示するスキル数
const MAX_HEIGHT = "400px"; // スクロール可能な最大高さ

export function SkillMap({ skills }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // 合計が100%になるように、各スキルのlevelをそのままパーセンテージとして使用
  const normalizedSkills = skills.map((skill) => ({
    ...skill,
    normalizedLevel: skill.level, // levelをそのままパーセンテージとして使用
    originalLevel: skill.level,
  }));

  const sortedSkills = [...normalizedSkills].sort(
    (a, b) => b.normalizedLevel - a.normalizedLevel,
  );

  // 表示するスキルを決定
  const displaySkills = showAll
    ? sortedSkills
    : sortedSkills.slice(0, DEFAULT_DISPLAY_COUNT);
  const hasMoreSkills = sortedSkills.length > DEFAULT_DISPLAY_COUNT;

  // 最大値のスキルを取得（マーカー表示用）
  const maxSkill = sortedSkills[0];

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-700">
              スキルマップ（使用頻度）
            </h3>
            {sortedSkills.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {sortedSkills.length}件
              </span>
            )}
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="説明を表示"
          >
            <Info size={16} />
          </button>
        </div>

        {/* 説明文 */}
        {showInfo && (
          <div className="mb-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <p className="mb-1 font-semibold">📊 表示方法について</p>
            <p className="leading-relaxed">
              各スキルの使用頻度をパーセンテージで表示しています。
              <br />
              全スキルの合計は100%になります。
            </p>
          </div>
        )}

      </div>

      {/* スキルリスト - スクロール可能なコンテナ */}
      <div
        className="space-y-3 overflow-y-auto transition-all duration-300"
        style={{
          maxHeight: showAll ? MAX_HEIGHT : "none",
        }}
      >
        {displaySkills.map((skill) => (
          <div key={skill.name}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                {skill.isNew && (
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    NEW
                  </span>
                )}
                {skill.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">
                  {skill.normalizedLevel}%
                </span>
                <span className="text-xs text-slate-400">
                  ({skill.originalLevel})
                </span>
              </div>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  skill.isNew
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                    : "bg-gradient-to-r from-slate-400 to-slate-500"
                }`}
                style={{ width: `${skill.normalizedLevel}%` }}
              />
              {/* 最大値のスキルには特別なマーカー */}
              {skill.normalizedLevel === maxSkill.normalizedLevel && (
                <div className="absolute right-0 top-0 h-full w-0.5 bg-emerald-600" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 「すべて表示」ボタン */}
      {hasMoreSkills && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          {showAll ? (
            <>
              <ChevronUp size={16} />
              折りたたむ
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              残り{sortedSkills.length - DEFAULT_DISPLAY_COUNT}件を表示
            </>
          )}
        </button>
      )}
    </div>
  );
}
