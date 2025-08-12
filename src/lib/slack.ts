import { WebClient } from "@slack/web-api"
const token = process.env.SLACK_BOT_TOKEN
const defaultChannel = process.env.SLACK_CHANNEL_ID
export const slack = token ? new WebClient(token) : null
export async function notifySlack({ text, channel }: { text: string; channel?: string }) {
  if (!slack) return ""
  const ch = channel || defaultChannel
  if (!ch) return ""
  const res = await slack.chat.postMessage({ channel: ch, text })
  return res.ts ?? ""
}


