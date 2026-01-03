import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  // 1. セッション（ログイン）チェック
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. GitHub API からコミット情報を取得（例：直近1週間の author 指定）
    const githubRes = await fetch(
      `https://api.github.com/search/commits?q=author:${session.user.githubId}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: "application/vnd.github.cloak-preview",
        },
      }
    );

    if (!githubRes.ok) throw new Error("GitHub API error");
    const data = await githubRes.json();

    // 3. リアルなデータに加工して返す
    return NextResponse.json({
      streak: 0, // ※ストリーク計算ロジックが必要（後述）
      weeklyCommits: [
        { date: "Mon", value: data.total_count }, // 暫定的に合計値をセット
        // 本来は日付ごとに集計した配列を返します
      ],
      momentum: 50, // 暫定値
    });

  } catch (error) {
    console.error("Growth API Error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}