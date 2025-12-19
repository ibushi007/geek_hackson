import { growthController } from "@/server/controller";
/**
 * GET /api/growth
 * ストローク、学習モメンタム、週間コミット数を取得
 * @returns ストローク、学習モメンタム、週間コミット数
 */
export async function GET() {
  return growthController.getGrowthData();
}