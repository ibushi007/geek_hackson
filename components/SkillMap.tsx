"use client";

import { Sparkles } from "lucide-react";

type Skill = {
  name: string;
  level: number;
  isNew: boolean;
};

type Props = {
  skills: Skill[];
};

export function SkillMap({ skills }: Props) {
  const sortedSkills = [...skills].sort((a, b) => b.level - a.level);

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={18} className="text-emerald-600" />
        <h3 className="text-sm font-semibold text-slate-700">
          スキルマップ（使用頻度）
        </h3>
      </div>

      <div className="space-y-3">
        {sortedSkills.map((skill) => (
          <div key={skill.name}>
            <div className="mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                {skill.isNew && (
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    NEW
                  </span>
                )}
                {skill.name}
              </span>
              <span className="text-xs text-slate-500">{skill.level}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  skill.isNew
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                    : "bg-slate-400"
                }`}
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




