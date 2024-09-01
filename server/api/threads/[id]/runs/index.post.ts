import { useOpenAI } from "@/composables/useOpenAI"
import { Readable } from "stream"

export default defineEventHandler(async (event) => {
  const openai = useOpenAI(event.context)
  const id = getRouterParam(event, "id")
  const assistant = await openai.findAssistant()
  const params = await readBody(event)

  const stream = new Readable({
    read() {},
  })

  const assistantStream = await openai.runThread(id, {
    assistant_id: assistant.id,
    ...params,
  })

  assistantStream.on("messageDelta", (event) => {
    stream.push(JSON.stringify(event) + "\n")
  })

  assistantStream.on("done", () => {
    stream.push(null)
  })

  return sendStream(event, stream)
})
