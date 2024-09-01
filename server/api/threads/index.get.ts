import { useDatabase } from "@/composables/useDatabase"
import { useOpenAI } from "@/composables/useOpenAI"

export default defineEventHandler(async ({ context }) => {
  const database = useDatabase(context)
  const openai = useOpenAI(context.cloudflare.env)

  const dbThreads = await database.listThreads()
  const threads = await Promise.all(
    dbThreads.map((id: string) => openai.getThread(id)),
  )

  return {
    threads,
  }
})
