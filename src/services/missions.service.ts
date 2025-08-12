import { prisma } from "@/lib/prisma"
import { z } from "zod"
const IntakeSchema = z.object({
  source: z.string().default("google_form"),
  externalId: z.string().min(1),
  objective: z.string().min(1),
  deadline: z.string().optional().nullable(),
  priority: z.string().optional().nullable(),
  context: z.string().optional().nullable(),
  raw: z.any().optional()
})
export type IntakePayload = z.infer<typeof IntakeSchema>
export async function upsertWebhookAndCreateMission(payload: any) {
  const data = IntakeSchema.parse(payload)
  const existing = await prisma.webhookEvent.findUnique({ where: { externalId: data.externalId } })
  if (existing?.processedAt && existing.missionId) {
    return { missionId: existing.missionId, isDuplicate: true }
  }

  const event = await prisma.webhookEvent.upsert({
    where: { externalId: data.externalId },
    update: { payload: data.raw ?? payload },
    create: { source: data.source, externalId: data.externalId, payload: data.raw ?? payload }
  })
  const mission = await prisma.mission.create({
    data: {
      source: data.source,
      sourceEventId: data.externalId,
      objective: data.objective,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      priority: data.priority ?? undefined,
      context: data.context ?? undefined,
      status: "received"
    }
  })
  await prisma.webhookEvent.update({ where: { id: event.id }, data: { missionId: mission.id, processedAt: new Date() } })
  return { missionId: mission.id, isDuplicate: false }
}


