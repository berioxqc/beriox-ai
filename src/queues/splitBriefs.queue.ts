import { Queue, Worker, JobsOptions } from "bullmq"
import { bullConnection } from "@/lib/redis"
import { callJson } from "@/lib/openai"
import { prisma } from "@/lib/prisma"
import { jackSplitPrompt } from "@/prompts/captainJack.prompt"
import { enqueueAgentJob } from "@/queues/agents.queue"
export const splitQueue = new Queue("split_briefs", { connection: bullConnection })
export async function enqueueSplitBriefs(missionId: string) {
  const backoff: JobsOptions["backoff"] = { type: "exponential", delay: 5000 } as any
  await splitQueue.add("split", { missionId }, { attempts: 3, backoff })
}

export function registerSplitWorker() {
  new Worker(
    "split_briefs",
    async job => {
      const { missionId } = job.data as { missionId: string }
      const mission = await prisma.mission.findUniqueOrThrow({ where: { id: missionId } })
      const briefs = (await callJson(
        jackSplitPrompt.system,
        jackSplitPrompt.user(mission.objective, mission.deadline, mission.priority, mission.context),
        jackSplitPrompt.schema
      )) as Record<string, unknown>
      await prisma.$transaction(async tx => {
        for (const [agent, content] of Object.entries(briefs)) {
          const brief = await tx.brief.create({ data: { missionId, agent, contentJson: content } })
          await enqueueAgentJob(agent, missionId, brief.id)
        }
        await tx.mission.update({ where: { id: missionId }, data: { status: "split" } })
      })
    },
    { connection: bullConnection }
  )
}


