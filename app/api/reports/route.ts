import { NextRequest, NextResponse } from 'next/server';
// 今セッション中のユーザーの取得
import { getServerSession } from 'next-auth';
// DB関係のモジュール提供
import { PrismaClient } from '@prisma/client';
// 自分たちで定義しているログイン認証のルール
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { CreateReportInput } from '@/types/report';

// DBクライアントの初期化 (Spring Bootの@Autowired repositoryに近い感覚)
const prisma = new PrismaClient();

export async function GET() {

    // セッション定義
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.dailyReport.findMany({
        where: {
          userId: session.user.id, // ログインユーザーのIDでフィルタリング
        },
        orderBy: {
          createdAt: 'desc', // 作成日時の降順
        },
    });

    // Spring Bootでいう ResponseEntity.ok(body) です
    // { reports: ... } という形式でJSONを返します
    return NextResponse.json({ reports: reports });
}