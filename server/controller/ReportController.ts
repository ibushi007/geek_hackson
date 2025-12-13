import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ReportUseCase } from "@/server/usecases/ReportUseCase";

const reportUseCase = new ReportUseCase();

export class ReportController {
    async createReport(request: NextRequest) {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        if(!body.githubUrl) {
            return NextResponse.json({ error: "Github URL is required" }, { status: 400 });
        }

        const report = await reportUseCase.createReport(session.user.id, body);
        return NextResponse.json(report, { status: 200 });
        } catch (error) {
            console.error("Report creation failed:", error);
            return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
        }
    }
}

