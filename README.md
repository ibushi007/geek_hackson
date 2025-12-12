Hackathon App — README
🚀 Overview

このプロジェクトは Next.js + Prisma + PostgreSQL + NextAuth(GitHubログイン) を使用したフルスタック Web アプリです。

ハッカソンで素早く開発を進めるために、以下を標準で含みます：

Next.js 16 (App Router)

NextAuth（GitHub OAuth ログイン）

Prisma ORM（PostgreSQL）

Tailwind CSS（UIフレームワーク）

Axios（API クライアント）

Prettier & ESLint（コード整形・静的解析）

📦 1. Setup
✅ 1-1. リポジトリを clone
git clone <your-repository-url>
cd hackathon-app

✅ 1-2. 必要なパッケージをインストール
npm install

✅ 1-3. 環境変数を設定

.env.example がある場合：

cp .env.example .env

✅ 1-4. Prisma を初期化（DB マイグレーション）
npm run prisma:migrate


Prisma Studio を開く：

npm run prisma:studio

▶ 2. Development

開発サーバーを起動する：

npm run dev


ブラウザで：

http://localhost:3000


にアクセスできます。

🛠 3. Useful Commands
コマンド	説明
npm run dev	Next.js 開発サーバー
npm run build	本番ビルド
npm start	本番サーバー起動
npm run lint	ESLint チェック
npm run format	Prettier でコード整形
npm run prisma:migrate	DBマイグレーション
npm run prisma:generate	Prisma クライアント再生成
npm run prisma:studio	Prisma GUI（DB viewer）
🔐 4. Authentication (GitHub Login)

NextAuth を利用して GitHub ログインができます。

ディレクトリ構成例：

app/
 └─ api/
     └─ auth/
         └─ [...nextauth]/
             └─ route.ts


route.ts の例（GitHub Provider）：

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

🗂 5. Database (Prisma + PostgreSQL)

Prisma のモデルは prisma/schema.prisma で管理します。

例：

model DailyReport {
  id        String   @id @default(cuid())
  userId    String
  createdAt DateTime @default(now())

  workDurationSec Int
  githubUrl       String

  filesChanged Int?
  additions    Int?
  deletions    Int?

  aiScore      String?
  aiGoodPoints String?
  aiBadPoints  String?
  aiStudyTime  String?
}


マイグレーション：

npm run prisma:migrate

🎨 6. UI (Tailwind CSS)

Tailwind CSS がすでに組み込まれているので、どこでもクラスを記述できます。

例：

<button class="px-4 py-2 bg-blue-600 text-white rounded">
  Save
</button>

🤝 7. Contribution Guide（ハッカソンチーム向け）

新しい作業は 必ずブランチを切る

コード編集後は：

npm run format
npm run lint


動作確認してから PR を出してください

DB スキーマを変更した場合は、必ず：

npm run prisma:migrate


を実行し、チームにも共有してください
