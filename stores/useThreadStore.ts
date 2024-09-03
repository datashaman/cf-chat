import { mande } from "mande"

export const useThreadStore = defineStore("threads", () => {
  const currentThreadId = ref(null)
  const messages = ref([])
  const threads = ref([])
  const { $bus } = useNuxtApp()

  async function fetchThreads() {
    threads.value = await mande("/api/threads").get()
    $bus.emit("threads.fetched", threads.value)
  }

  async function createThread(params) {
    const { thread } = await mande("/api/threads").post(params)
    threads.value = [thread, ...threads.value]
    $bus.emit("threads.created", thread)

    return thread
  }

  async function changeCurrentThread(threadId) {
    currentThreadId.value = threadId
    messages.value = threadId
      ? await mande(`/api/threads/${threadId}/messages`).get()
      : []
    const thread = threads.value.find((thread) => thread.id === threadId)
    $bus.emit("threads.changed", thread)
  }

  async function runThread(responseMessage, params) {
    const response = await $fetch(
      `/api/threads/${currentThreadId.value}/runs`,
      {
        method: "POST",
        body: JSON.stringify(params),
        responseType: "stream",
      },
    )

    const reader = response.pipeThrough(new TextDecoderStream()).getReader()

    while (true) {
      const { value, done } = await reader.read()

      if (done) {
        break
      }

      value
        .trim()
        .split("\n")
        .forEach((line) => {
          if (line) {
            if (responseMessage.value === "...") {
              responseMessage.value = ""
            }

            responseMessage.value += JSON.parse(line).content[0].text.value
          }
        })
    }
  }
})
