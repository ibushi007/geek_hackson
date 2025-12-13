import { reportController } from "@/server/controller";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    return reportController.createReport(request);
}