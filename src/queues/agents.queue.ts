import { Queue, Worker } from "bullmq"
import { bullConnection } from "@/lib/redis"
import { prisma } from "@/lib/prisma"
import { agentPrompts } from "@/prompts/agents"
import { callText } from "@/lib/openai"
import { enqueueCompileReport } from "@/queues/compile.queue"
export const agentQueue = new Queue("agents", { connection: bullConnection })
export async function enqueueAgentJob(agent: string, missionId: string, briefId: string) {
  await agentQueue.add("run_agent", { agent, missionId, briefId }, { attempts: 3, backoff: { type: "exponential", delay: 7000 } as any })
}

export function registerAgentsWorker() {
  new Worker(
    "agents",
    async job => {
      const { agent, missionId, briefId } = job.data as { agent: keyof typeof agentPrompts; missionId: string; briefId: string }
      const brief = await prisma.brief.findUniqueOrThrow({ where: { id: briefId } })
      const prompt = agentPrompts[agent as keyof typeof agentPrompts]
      const outputText = await callText(prompt.system, prompt.user(brief.contentJson))
      await prisma.deliverable.create({ data: { missionId, briefId, agent, output: { content: outputText } } })
      await prisma.brief.update({ where: { id: briefId }, data: { status: "done" } })
      const total = await prisma.brief.count({ where: { missionId } })
      const done = await prisma.brief.count({ where: { missionId, status: "done" } })
      if (total > 0 && done === total) {
        await enqueueCompileReport(missionId)
      }
    },
    { connection: bullConnection }
  )
}


