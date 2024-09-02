import { useDatabase } from "@/composables/useDatabase"
import { useOpenAI } from "@/composables/useOpenAI"

export default defineEventHandler(async (event) => {
  const database = useDatabase(event.context)
  const openai = useOpenAI(event.context.cloudflare.env)
  const id = getRouterParam(event, "id")

  await database.deleteThread(id)

  return {
    thread: await openai.deleteThread(id),
  }
})
