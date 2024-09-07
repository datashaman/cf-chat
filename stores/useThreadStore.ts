import { mande } from "mande"

export const useThreadStore = defineStore("threads", () => {
  const { $bus } = useNuxtApp()

  const currentThreadId = ref("")
  const threads = ref([])

  async function fetchThreads() {
    const { threads: data } = await mande("/api/threads").get()
    threads.value = data
  }

  async function fetchMessages() {
    const { messages } = await mande(
      `/api/threads/${currentThreadId.value}/messages`,
    ).get()

    return messages
  }

  async function createThread(params) {
    const { thread } = await mande("/api/threads").post(params)
    threads.value = [thread, ...threads.value]

    return thread
  }

  async function deleteThread(threadId) {
    await mande(`/api/threads/${threadId}`).delete()
    threads.value = threads.value.filter((thread) => thread.id !== threadId)
  }

  async function changeCurrentThread(threadId) {
    currentThreadId.value = threadId
  }

  async function runThread(params, callback) {
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
        .forEach((event) => {
          if (event) {
            const delta = JSON.parse(event).content[0].text.value
            callback(delta)
          }
        })
    }
  }

  return {
    currentThreadId,
    threads,
    fetchThreads,
    fetchMessages,
    createThread,
    deleteThread,
    changeCurrentThread,
    runThread,
  }
})
