import { Client } from "@notionhq/client"
const token = process.env.NOTION_TOKEN
const databaseId = process.env.NOTION_DATABASE_ID
export const notion = new Client({ auth: token })
export async function createMissionPage(args: {
  objective: string
  deadline?: Date
  status: string
  markdown: string
}) {
  if (!databaseId) throw new Error("NOTION_DATABASE_ID is not set")
  const res = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      "Mission": { title: [{ text: { content: `Mission: ${args.objective}` } }] },
      "Objectif global": { rich_text: [{ text: { content: args.objective } }] },
      "Statut": { status: { name: args.status } },
      ...(args.deadline ? { "Date limite": { date: { start: args.deadline.toISOString() } } } : {})
    } as any,
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: args.markdown.slice(0, 1900) } }] }
      }
    ]
  })
  return res.id
}


