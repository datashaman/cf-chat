import { useOpenAI } from "@/composables/useOpenAI"
import { useTools } from "@/composables/useTools"

export default defineEventHandler(async (event) => {
  const openai = useOpenAI(event.context.cloudflare.env)
  const id = getRouterParam(event, "id")
  const assistant = await openai.findAssistant()
  const params = await readBody(event)
  const tools = useTools()

  const observeRunStream = async (stream, controller) => {
    stream
      .on("messageDelta", (delta) => {
        controller.enqueue(
          new TextEncoder().encode(JSON.stringify(delta) + "\n"),
        )
      })
      .on("end", async () => {
        const run = stream.currentRun()

        if (
          run.status === "requires_action" &&
          run.required_action.type === "submit_tool_outputs"
        ) {
          observeRunStream(
            openai.submitToolOutputs(
              run.thread_id,
              run.id,
              await Promise.all(
                run.required_action.submit_tool_outputs.tool_calls.map(
                  async (toolCall) => ({
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(
                      await tools.handleToolCall(toolCall),
                    ),
                  }),
                ),
              ),
            ),
            controller,
          )
        } else {
          controller.close()
        }
      })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const stream = openai.runThread(id, {
        assistant_id: assistant.id,
        ...params,
      })

      observeRunStream(stream, controller)
    },
  })

  return sendStream(event, stream)
})
