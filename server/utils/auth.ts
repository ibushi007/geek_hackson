import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * 認証チェック（共通処理）
 * @returns ユーザーIDまたはエラーレスポンス
 */
export async function authenticate(): Promise<
  { userId: string } | { error: NextResponse }
> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { userId: session.user.id };
}

/**
 * エラーハンドリング（共通処理）
 * @param error エラーオブジェクト
 * @param context エラーが発生したコンテキスト（例: "Report creation"）
 * @returns エラーレスポンス
 */
export function handleError(error: unknown, context: string): NextResponse {
  console.error(`${context} failed:`, error);

  if (error instanceof Error) {
    // 日報の重複エラー
    if (error.message.includes("already exists for today")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    // エラーメッセージに応じてステータスコードを変更
    if (error.message === "Report not found") {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    if (error.message.includes("required")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json(
    { error: `Failed to ${context.toLowerCase()}` },
    { status: 500 },
  );
}
