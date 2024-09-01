import { useDatabase } from "@/composables/useDatabase"
import { useOpenAI } from "@/composables/useOpenAI"

export default defineEventHandler(async (event) => {
  const database = useDatabase(event.context)
  const openai = useOpenAI(event.context.env)
  const body = await readBody(event)
  const thread = await openai.createThread(body)
  await database.createThread(thread.id)

  return {
    thread,
  }
})
