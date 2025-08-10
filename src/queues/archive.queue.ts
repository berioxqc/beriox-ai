import { Queue, Worker } from "bullmq";
import { bullConnection } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { createMissionPage } from "@/lib/notion";
import { notifySlack } from "@/lib/slack";
import { sendEmail } from "@/lib/email";

export const archiveQueue = new Queue("archive_notify", { connection: bullConnection });

export async function enqueueArchive(missionId: string) {
  await archiveQueue.add("archive", { missionId }, { attempts: 2 });
}

export function registerArchiveWorker() {
  new Worker(
    "archive_notify",
    async job => {
      const { missionId } = job.data as { missionId: string };
      const mission = await prisma.mission.findUniqueOrThrow({ where: { id: missionId }, include: { report: true } });
      const notionPageId = await createMissionPage({
        objective: mission.objective,
        deadline: mission.deadline ?? undefined,
        status: "Terminé",
        markdown: mission.report?.detailsMd ?? ""
      });
      await prisma.mission.update({ where: { id: missionId }, data: { notionPageId, status: "archived" } });

      const notionUrl = `https://www.notion.so/${notionPageId.replace(/-/g, "")}`;
      const slackTs = await notifySlack({
        text: `Mission terminée 🚀\nObjectif: ${mission.objective}\nNotion: ${notionUrl}`
      });
      await prisma.mission.update({ where: { id: missionId }, data: { slackMessageTs: slackTs, status: "notified" } });

      await sendEmail({ subject: `[Beriox AI] Mission terminée – ${mission.objective}`, html: `<p>Rapport final: <a href="${notionUrl}">Notion</a></p>` });
    },
    { connection: bullConnection }
  );
}


