<script setup>
import { marked } from "marked"
import markedLinkifyIt from "marked-linkify-it"
import DOMPurify from "dompurify"

const props = defineProps({
  currentThreadId: String,
})

const threadStore = useThreadStore()

const { $bus } = useNuxtApp()

const messages = ref([])
const message = ref("")

marked
  .use({
    breaks: true,
  })
  .use(markedLinkifyIt())

const renderMarkdown = (content) => {
  const html = marked.parseInline(content)
  return DOMPurify.sanitize(html)
}

const runThread = async (additionalMessages = []) => {
  const responseMessage = ref("...")

  messages.value.push({
    role: "assistant",
    content: responseMessage,
  })

  return threadStore.runThread(
    {
      additional_messages: additionalMessages,
    },
    (delta) => {
      if (responseMessage.value === "...") {
        responseMessage.value = ""
      }

      responseMessage.value += delta
    },
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

  messages.value.push(userMessage)
  message.value = ""

  await runThread([userMessage])
}

onMounted(async () => {
  await threadStore.changeCurrentThread(props.currentThreadId)
  if (props.currentThreadId) messages.value = await threadStore.fetchMessages()
})
</script>

<template>
  <div class="flex-grow p-6 overflow-y-auto">
    <template v-if="props.currentThreadId">
      <template v-for="message in messages" :key="message.id">
        <div v-if="message.role === 'user'" class="chat chat-end">
          <div
            class="chat-bubble chat-bubble-success"
            v-html="renderMarkdown(message.content)"
          />
        </div>
        <div v-else class="chat chat-start">
          <div class="chat-bubble chat-bubble-info">
            <template v-if="message.content === '...'">
              <span class="loading loading-dots loading-xs"></span>
            </template>
            <div v-else v-html="renderMarkdown(message.content)" />
          </div>
        </div>
      </template>
    </template>
    <div v-else>Select a thread to start chatting</div>
  </div>

  <form @submit.prevent="sendMessage">
    <div class="p-4 border-t flex">
      <textarea
        class="textarea textarea-bordered w-full"
        placeholder="Type a message..."
        v-model="message"
        @keydown.meta.enter="sendMessage"
        @keydown.ctrl.enter="sendMessage"
      >
      </textarea>
      <button type="submit" class="btn btn-primary btn-lg ms-4">Send</button>
    </div>
  </form>
</template>
