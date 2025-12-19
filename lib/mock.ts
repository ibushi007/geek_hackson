// ========================================
// Mock Data for Developer Studyplus
// ========================================

import type { TechTag, ChangeSize } from "@/types/report";

export type { TechTag };

export type LearningLog = {
  id: string;
  userId: string;
  createdAt: Date;
  // Auto-generated (80%)
  title: string; // LLM生成タイトル
  prCount: number;
  commitCount: number;
  linesChanged: number;
  changeSize: ChangeSize;
  techTags: TechTag[];
  prSummary: string; // LLM整形された作業内容
  githubUrl: string;
  // Manual input (20%)
  todayLearning: string; // 今日の学び（必須）
  struggles?: string; // 詰まったところ（任意）
  tomorrow?: string; // 明日やること（任意）
  // AI Coach comment
  aiCoachComment?: string;
};

export type WeeklyDigest = {
  weekLabel: string;
  prCount: number;
  totalLines: number;
  newTech: string[];
  momentum: number; // 0-100
  aiMessage: string; // LLM生成
  suggestion: string;
};

export type GrowthData = {
  weeklyCommits: { dayOfWeek: string; value: number; dateKey: string }[];
  monthlyCommits: { weekLabel: string; value: number }[];
  techSkillMap: { name: string; level: number; isNew: boolean }[];
  streak: number;
  momentum: number; // Learning Momentum score
};

// ========================================
// ユーザー情報
// ========================================
export const user = {
  id: "user-001",
  name: "Ibuki",
  githubId: "ibuki007",
  avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
  streak: 7,
};

// ========================================
// 学習ログ（日報）
// ========================================
export const learningLogs: LearningLog[] = [
  {
    id: "log-001",
    userId: "user-001",
    createdAt: new Date("2025-12-16"),
    title: "🔐 認証フローを一段深く理解した日",
    prCount: 2,
    commitCount: 8,
    linesChanged: 240,
    changeSize: "M",
    githubUrl: "https://github.com/example/auth-implementation",
    techTags: [
      { name: "NextAuth", isNew: true },
      { name: "Prisma", isNew: false },
      { name: "TypeScript", isNew: false },
    ],
    prSummary:
      "認証機能の実装を中心に、比較的大きな変更を行いました。GitHub OAuthの設定とユーザー情報のDB保存を完成させました。",
    todayLearning: "セッション管理とJWTトークンの違いを理解した",
    struggles: "NextAuthの型定義で苦戦した",
    tomorrow: "日報APIのテストを書く",
    aiCoachComment:
      "認証周りは複雑ですが、着実に理解を深めていますね！JWTの知識は今後も役立ちます。",
  },
  {
    id: "log-002",
    userId: "user-001",
    createdAt: new Date("2025-12-15"),
    title: "🗃️ データ設計を見直した集中の日",
    prCount: 1,
    commitCount: 5,
    linesChanged: 156,
    changeSize: "M",
    githubUrl: "https://github.com/example/schema-refactor",
    techTags: [
      { name: "Prisma", isNew: false },
      { name: "PostgreSQL", isNew: true },
    ],
    prSummary:
      "Prismaスキーマの見直しとマイグレーションを実施。DailyReportテーブルの設計を最適化しました。",
    todayLearning: "リレーションの設計パターンを学んだ",
    struggles: undefined,
    tomorrow: "認証機能の実装",
    aiCoachComment:
      "データベース設計は地味ですが重要な作業です。きちんと向き合えていて素晴らしい！",
  },
  {
    id: "log-003",
    userId: "user-001",
    createdAt: new Date("2025-12-14"),
    title: "⚡ 環境構築を乗り越えた日",
    prCount: 1,
    commitCount: 12,
    linesChanged: 89,
    changeSize: "S",
    githubUrl: "https://github.com/example/initial-setup",
    techTags: [
      { name: "Next.js", isNew: false },
      { name: "Tailwind CSS", isNew: false },
    ],
    prSummary:
      "プロジェクトの初期セットアップとTailwind CSSの設定を完了。基本的なレイアウトを作成しました。",
    todayLearning: "Tailwind v4の新しい設定方法を覚えた",
    struggles: "Prismaのバージョン問題で詰まった",
    tomorrow: "データベーススキーマの設計",
    aiCoachComment:
      "環境構築は最初のハードルですが、見事にクリアしました！この勢いで進んでいきましょう。",
  },
];

// ========================================
// 週次ダイジェスト
// ========================================
export const weeklyDigest: WeeklyDigest = {
  weekLabel: "12月9日〜15日",
  prCount: 8,
  totalLines: 1234,
  newTech: ["NextAuth", "PostgreSQL"],
  momentum: 78,
  aiMessage: `今週は認証周りに集中した一週間でした。
新しい技術にも挑戦できており、
着実に実装の幅が広がっています。`,
  suggestion: "テストコードを書く習慣をつけると、さらに成長が加速しますよ！",
};

// ========================================
// 成長データ
// ========================================
export const growthData: GrowthData = {
  weeklyCommits: [
    { dayOfWeek: "Mon", value: 8, dateKey: "2025-12-16" },
    { dayOfWeek: "Tue", value: 5, dateKey: "2025-12-17" },
    { dayOfWeek: "Wed", value: 12, dateKey: "2025-12-18" },
    { dayOfWeek: "Thu", value: 7, dateKey: "2025-12-19" },
    { dayOfWeek: "Fri", value: 3, dateKey: "2025-12-20" },
    { dayOfWeek: "Sat", value: 2, dateKey: "2025-12-21" },
    { dayOfWeek: "Sun", value: 1, dateKey: "2025-12-22" },
  ],
  monthlyCommits: [
    { weekLabel: "W1", value: 21 },
    { weekLabel: "W2", value: 34 },
    { weekLabel: "W3", value: 28 },
    { weekLabel: "W4", value: 38 },
  ],
  techSkillMap: [
    { name: "TypeScript", level: 70, isNew: false },
    { name: "Next.js", level: 60, isNew: false },
    { name: "Prisma", level: 45, isNew: false },
    { name: "NextAuth", level: 30, isNew: true },
    { name: "PostgreSQL", level: 25, isNew: true },
    { name: "Tailwind CSS", level: 55, isNew: false },
  ],
  streak: 7,
  momentum: 78,
};

// ========================================
// AIコーチのメッセージ（ページごと）
// ========================================
export const aiCoachMessages = {
  dashboard: "今日も学習お疲れ様です！少しずつでも毎日続けることが大切ですよ。",
  growth: "グラフが右肩上がり！この調子で続けていきましょう 📈",
  newLog: "今日の学びを記録しましょう。1行でも大丈夫ですよ！",
  weekly: "一週間の振り返りは成長を実感できる大切な時間です ✨",
};

