<script setup>
const props = defineProps({
  currentThreadId: String,
})

const threadStore = useThreadStore()

const { $bus } = useNuxtApp()
const message = ref("")
const messageList = ref(null)

const runThread = async (additionalMessages = []) => {
  const responseMessage = ref("...")

  messageList.value.push({
    role: "assistant",
    content: responseMessage,
  })

  return threadStore.runThread(
    responseMessage,
    {
      additional_messages: additionalMessages,
    },
    props.currentThreadId,
  )
}

const sendMessage = async () => {
  if (!message.value) return

  const userMessage = { role: "user", content: message.value }

  if (!props.currentThreadId) {
    const { thread } = await threadStore.createThread({
      messages: [userMessage],
      metadata: { title: "New Thread" },
    })

    await navigateTo(`/threads/${thread.id}`)

    return
  }

  if (messageList.value) {
    messageList.value.push({
      ...userMessage,
    })
  }

  message.value = ""

  await runThread([userMessage])
}

onMounted(() => {
  threadStore.fetchThread(props.currentThreadId)

  $bus.on("threads.run", async () => {
    await runThread()
  })
})
</script>

<template>
  <div class="flex-grow p-6 overflow-y-auto">
    <MessageList
      v-if="props.currentThreadId"
      :currentThreadId="props.currentThreadId"
      ref="messageList"
    />
  </div>

  <form @submit.prevent="sendMessage">
    <div class="p-4 border-t flex">
      <textarea
        class="textarea textarea-bordered w-full"
        placeholder="Type a message..."
        v-model="message"
      >
      </textarea>
      <button type="submit" class="btn btn-primary ms-2">Send</button>
    </div>
  </form>
</template>
