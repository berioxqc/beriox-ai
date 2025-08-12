import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
export const runtime = "nodejs"
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: missionId } = await params
    const deliverables = await prisma.deliverable.findMany({
      where: { 
        missionId: missionId
      },
      orderBy: { createdAt: "asc" }
    })
    // Reformater pour correspondre au type attendu
    const formattedDeliverables = deliverables.map(d => ({
      id: d.id,
      agent: d.agent,
      output: d.output,
      createdAt: d.createdAt.toISOString()
    }))
    return NextResponse.json({ deliverables: formattedDeliverables })
  } catch (error) {
    console.error("GET Deliverables Error:", error)
    return NextResponse.json({ deliverables: [] })
  }
}
