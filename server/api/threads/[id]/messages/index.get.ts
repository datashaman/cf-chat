import { useOpenAI } from "@/composables/useOpenAI"

export default defineEventHandler(async (event) => {
  const openai = useOpenAI(event.context.env)
  const id = getRouterParam(event, "id")

  return {
    messages: await openai.listMessages(id),
  }
})
