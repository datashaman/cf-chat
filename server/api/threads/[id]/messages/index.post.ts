import { useOpenAI } from "@/composables/useOpenAI"

export default defineEventHandler(async (event) => {
  const openai = useOpenAI(event.context)
  const id = getRouterParam(event, "id")
  const body = await readBody(event)

  return openai.createMessage(id, body)
})
