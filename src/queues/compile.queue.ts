import { Queue, Worker } from "bullmq"
import { bullConnection } from "@/lib/redis"
import { prisma } from "@/lib/prisma"
import { callText } from "@/lib/openai"
import { jackCompiler } from "@/prompts/captainJack.prompt"
import { enqueueArchive } from "@/queues/archive.queue"
export const compileQueue = new Queue("compile_report", { connection: bullConnection })
export async function enqueueCompileReport(missionId: string) {
  await compileQueue.add("compile", { missionId }, { attempts: 2 })
}

export function registerCompileWorker() {
  new Worker(
    "compile_report",
    async job => {
      const { missionId } = job.data as { missionId: string }
      const mission = await prisma.mission.findUniqueOrThrow({ where: { id: missionId }, include: { deliverables: true } })
      const sections = Object.fromEntries(mission.deliverables.map(d => [d.agent, d.output]))
      const markdown = await callText(jackCompiler.system, jackCompiler.user(mission.objective, sections))
      await prisma.report.upsert({
        where: { missionId },
        update: { summary: mission.objective, detailsMd: markdown },
        create: { missionId, summary: mission.objective, detailsMd: markdown }
      })
      await prisma.mission.update({ where: { id: missionId }, data: { status: "compiled" } })
      await enqueueArchive(missionId)
    },
    { connection: bullConnection }
  )
}


