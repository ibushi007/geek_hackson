import { reportController } from "@/server/controller";
import { NextRequest } from "next/server";

/**
 * GET /api/reports/[id]
 * 日報詳細を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return reportController.getReportById(id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  return reportController.updateReport(id, body);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return reportController.deleteReport(id);
}
