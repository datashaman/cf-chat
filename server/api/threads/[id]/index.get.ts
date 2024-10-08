import { useOpenAI } from "@/composables/useOpenAI"

export default defineEventHandler(async (event) => {
  const openai = useOpenAI(event.context.cloudflare.env)
  const id = getRouterParam(event, "id")

  return {
    thread: await openai.getThread(id),
  }
})
