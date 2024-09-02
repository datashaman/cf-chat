import { useOpenAI } from "@/composables/useOpenAI"

export default defineEventHandler(async (event) => {
  const openai = useOpenAI(event.context.cloudflare.env)
  const id = getRouterParam(event, "id")
  const assistant = await openai.findAssistant()
  const params = await readBody(event)

  const stream = new ReadableStream({
    async start(controller) {
      const assistantStream = await openai.runThread(id, {
        assistant_id: assistant.id,
        ...params,
      })

      assistantStream.on("messageDelta", (messageDelta) => {
        controller.enqueue(
          new TextEncoder().encode(JSON.stringify(messageDelta) + "\n"),
        )
      })

      assistantStream.on("end", () => {
        controller.close()
      })

      assistantStream.on("error", (error) => {
        console.error("Stream error:", error)
        controller.error(error)
      })
    },
  })

  return sendStream(event, stream)
})
