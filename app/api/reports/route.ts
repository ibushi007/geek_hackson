// app/api/reports/route.ts
import { reportController } from "@/server/controller";

export async function GET() {
  // 本物のDBを見に行くControllerを呼び出す
  return reportController.showReports();
}