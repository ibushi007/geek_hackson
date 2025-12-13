import { reportController } from "@/server/controller";

export async function GET() {
  return reportController.showReports();
}
