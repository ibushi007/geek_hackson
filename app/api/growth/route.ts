import { NextResponse } from "next/server";
import { growthData } from "@/lib/mock";

// GETリクエスト（データ取得）が来た時の処理
export async function GET() {
  // 本物のサーバーっぽく、あえて少しだけ（0.5秒）待たせてみる設定
  // await new Promise((resolve) => setTimeout(resolve, 500));

  // 成功（200 OK）のレスポンスとしてデータを返す
  return NextResponse.json(growthData);
}