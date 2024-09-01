import { useOpenAI } from "@/composables/useOpenAI"

export default defineEventHandler(async (event) => {
  const openai = useOpenAI(event.context)
  const id = getRouterParam(event, "id")
  const assistant = await openai.findAssistant()
  const params = await readBody(event)

  // Create a new web-compatible ReadableStream
  const stream = new ReadableStream({
    start(controller) {
      openai
        .runThread(id, {
          assistant_id: assistant.id,
          ...params,
        })
        .then((assistantStream) => {
          assistantStream.on("messageDelta", (event) => {
            // Serialize the event and enqueue it to the stream
            controller.enqueue(JSON.stringify(event) + "\n")
          })

          assistantStream.on("done", () => {
            // Close the stream when done
            controller.close()
          })
        })
        .catch((err) => {
          // Handle any errors and close the stream
          console.error(err)
          controller.error(err)
        })
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "application/json" },
  })
})
