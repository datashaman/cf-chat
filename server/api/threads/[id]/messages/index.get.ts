import { useOpenAI } from "@/composables/useOpenAI"

export default defineEventHandler(async (event) => {
  const openai = useOpenAI(event.context.cloudflare.env)
  const id = getRouterParam(event, "id")
  const query = getQuery(event)

  return {
    messages: await openai.listMessages(id, query),
  }
})
