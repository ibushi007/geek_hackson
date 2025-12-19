import { NextRequest, NextResponse } from "next/server";
import { ReportUseCase } from "@/server/usecases/ReportUseCase";
import { CreateReportInput } from "@/types/report";
import { authenticate, handleError } from "@/server/utils/auth";
import { GrowthUseCase } from "@/server/usecases/GrowthUseCase";

export class GrowthController {
  private growthUsecase: GrowthUseCase;
  constructor(growthUsecase?: GrowthUseCase) {
    this.growthUsecase = growthUsecase ?? new GrowthUseCase();
  }

  async getGrowthData() {
    try {
      const auth = await authenticate();
      if ("error" in auth) return auth.error;
      const growthData = await this.growthUsecase.getGrowthData(auth.userId);
      return NextResponse.json(growthData, { status: 200 });
    } catch (error) {
      return handleError(error, "Get growth data");
    }
  }
}
