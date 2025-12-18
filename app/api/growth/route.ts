import { growthController } from "@/server/controller";
/**
 * GET /api/growth
 * 週間・月間のレポートを取得
 * @returns 週間・月間のレポート
 */
export async function GET() {
  return growthController.getGrowthData();
}