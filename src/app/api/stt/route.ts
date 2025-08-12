import { NextRequest, NextResponse } from "next/server"
import { openai } from "@/lib/openai"
export const runtime = "nodejs"
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || ""
    let file: File | null = null
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData()
      const audio = form.get("audio")
      if (audio && audio instanceof File) {
        file = audio
      }
    } else {
      const buf = Buffer.from(await req.arrayBuffer())
      file = new File([buf], "audio.webm", { type: contentType || "audio/webm" })
    }

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    const res = await (openai as any).audio.transcriptions.create({
      file,
      model: "gpt-4o-mini-transcribe"
    })
    const text: string = res.text || res?.data?.text || ""
    return NextResponse.json({ text })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Transcription failed" }, { status: 500 })
  }
}


