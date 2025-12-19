import { NextResponse } from "next/server";
import { weeklyDigest } from "@/lib/mock";

export async function GET() {
  try {
    // TODO: 実際のDBからデータを取得するように変更
    // 現時点ではモックデータを返却
    return NextResponse.json(weeklyDigest);
  } catch (error) {
    console.error("Failed to fetch weekly digest:", error);
    return NextResponse.json(
      { error: "週次データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
