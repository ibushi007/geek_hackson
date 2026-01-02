import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // すでにあるデータを一度消去（重複防止）
  await prisma.dailyReport.deleteMany();
  await prisma.user.deleteMany();

  // 1. ユーザー（あなた）を作成
  const user = await prisma.user.create({
    data: {
      id: "user-001",
      githubId: "ssaladaku39",
      name: "ssaladaku39",
      avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4", // 後で自動取得にできます
    },
  });

  // 2. 日報データ（Mockから拝借）をDBに保存
  await prisma.dailyReport.createMany({
    data: [
      {
        userId: user.id,
        title: "🔐 認証フローを一段深く理解した日",
        todayLearning: "セッション管理とJWTトークンの違いを理解した",
        struggles: "NextAuthの型定義で苦戦した",
        tomorrow: "日報APIのテストを書く",
        githubUrl: "https://github.com/example/auth-implementation",
        prCount: 2,
        commitCount: 8,
        linesChanged: 240,
        changeSize: "M",
        prSummary: "認証機能の実装を中心に、比較的大きな変更を行いました。",
        aiCoachComment: "認証周りは複雑ですが、着実に理解を深めていますね！",
        techTags: JSON.stringify([{ name: "NextAuth", isNew: true }]),
      },
      // ... 必要に応じて追加してください
    ],
  });

  console.log("Seed data inserted successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());