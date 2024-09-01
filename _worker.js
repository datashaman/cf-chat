import { useOpenAI } from "@/composables/useOpenAI"

const getThreadId = (request) => {
  const url = new URL(request.url)
  const re = /\/api\/threads\/([^/]+)\/runs/
  const match = url.pathname.match(re)
  return match ? match[1] : null
}

const handleRun = async (request, env, context, threadId) => {
  const openai = useOpenAI(context)

  const assistant = await openai.findAssistant()
  const params = await request.body.read()

  // Create a new web-compatible ReadableStream
  const stream = new ReadableStream({
    start(controller) {
      console.log("Starting stream")
      openai
        .runThread(threadId, {
          assistant_id: assistant.id,
          ...params,
        })
        .then((assistantStream) => {
          assistantStream.on("messageDelta", (event) => {
            console.log("messageDelta", event)
            controller.enqueue(JSON.stringify(event) + "\n")
          })

          assistantStream.on("done", () => {
            console.log("done")
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
}

export default {
  async fetch(request, env, context) {
    console.log("Handling request", request.url)

    const threadId = getThreadId(request)

    if (threadId) {
      console.log("Handling run request")

      return handleRun(request, env, context, threadId)
    }
    // Otherwise, serve the static assets.
    // Without this, the Worker will error and no assets will be served.
    return env.ASSETS.fetch(request)
  },
}
