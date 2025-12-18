import { NextResponse } from "next/server";
import { growthData } from "@/lib/mock";

export async function GET() {
try {
  return NextResponse.json(growthData);
  } catch (error) {
    console.error("Failed to fetch growth data:", error);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}