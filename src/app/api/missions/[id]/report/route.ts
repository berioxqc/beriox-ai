import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: missionId } = await params;
    
    const report = await prisma.report.findFirst({
      where: { missionId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        summary: true,
        detailsMd: true,
        cautions: true,
        nextSteps: true,
        createdAt: true
      }
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error("GET Report Error:", error);
    return NextResponse.json({ report: null });
  }
}
