import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: missionId } = await params;
    
    const briefs = await prisma.brief.findMany({
      where: { missionId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        agent: true,
        contentJson: true,
        status: true,
        createdAt: true
      }
    });

    return NextResponse.json({ briefs });
  } catch (error) {
    console.error("GET Briefs Error:", error);
    return NextResponse.json({ briefs: [] });
  }
}
