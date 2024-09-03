import { useDatabase } from "@/composables/useDatabase"
import { useOpenAI } from "@/composables/useOpenAI"

export default defineEventHandler(async ({ context }) => {
  const database = useDatabase(context)
  const openai = useOpenAI(context.cloudflare.env)

  const dbThreads = await database.listThreads()

  const threads = []

  for (const dbThread of dbThreads) {
    const thread = await openai.getThread(dbThread)

    if (thread) {
      threads.push(thread)
    } else {
      await database.deleteThread(dbThread)
    }
  }

  return {
    threads,
  }
})
