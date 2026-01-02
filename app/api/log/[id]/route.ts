import { reportController } from "@/server/controller";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. URLから送られてきたIDを「待機」して受け取る
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: "IDが指定されていません" }, { status: 400 });
    }

    // 2. Controllerの showReport を呼び出す
    // インスタンス化されている場合は reportController.showReport(id)
    return await reportController.showReport(id);

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "サーバー内部エラー" }, { status: 500 });
  }

  
}

// app/api/log/[id]/route.ts

// ...既存の GET 関数の下に書き足します...

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json(); // 画面から送られてきた新しい内容を読み取る

    // あなたが作った「updateReport」をここで実行！
    return await reportController.updateReport(id, body);
  } catch (error) {
    console.error("更新APIエラー:", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}