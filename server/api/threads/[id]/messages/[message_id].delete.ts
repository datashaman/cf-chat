import { useOpenAI } from "@/composables/useOpenAI"

export default defineEventHandler(async (event) => {
  const openai = useOpenAI(event.context)
  const id = getRouterParam(event, "id")
  const messageId = getRouterParam(event, "message_id")
  const body = await readBody(event)

  return openai.deleteMessage(id, messageId)
})
