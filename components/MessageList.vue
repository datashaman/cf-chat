<script setup>
import { marked } from "marked"
import markedLinkifyIt from "marked-linkify-it"
import DOMPurify from "dompurify"

const route = useRoute()

const messages = ref([])
const message = ref("")
let content = ref("")

let worker

marked
  .use({
    breaks: true,
  })
  .use(markedLinkifyIt())

const renderMarkdown = (content) => {
  const html = marked.parseInline(content)
  return DOMPurify.sanitize(html)
}

const runThread = async (params = {}) => {
  content = ref("...")

  messages.value.push({
    role: "assistant",
    content: content,
  })

  // Not using mande here because we need a stream response
  params = {
    method: "POST",
    body: JSON.stringify(params),
    responseType: "stream",
    tools: useTools().defineTools(["getCurrentTime"]),
  }

  const response = await $fetch(`/api/threads/${route.params.id}/runs`, params)

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

          if (content.value === "...") {
            content.value = ""
          }

          content.value += delta
          scrollToBottom()
        }
      })
  }
}

const sendMessage = async () => {
  if (!message.value) return

  const userMessage = { role: "user", content: message.value }

  if (!route.params.id) {
    await worker.port.postMessage({
      type: "createThread",
      payload: {
        messages: [userMessage],
        metadata: { title: "New Thread" },
      },
    })

    return
  }

  messages.value.push(userMessage)
  scrollToBottom()

  message.value = ""

  return runThread({
    additional_messages: [userMessage],
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    const chat = document.querySelector(".messages")
    chat.scrollTop = chat.scrollHeight
  })
}

onMounted(async () => {
  worker = useWorker({
    delta: (payload) => {
      if (content.value === "...") {
        content.value = ""
      }
      content.value += payload.delta
    },
    messages: async (payload) => {
      messages.value = payload.messages
      scrollToBottom()

      if (route.params.id && messages.value.length <= 1) {
        await runThread()
      }
    },
    thread: async (payload) => {
      if (!payload.thread) {
        await navigateTo("/")

        return
      }

      worker.port.postMessage({
        type: "fetchMessages",
        payload: { threadId: route.params.id },
      })
    },
  })

  if (route.params.id) {
    worker.port.postMessage({
      type: "fetchThread",
      payload: { threadId: route.params.id },
    })
  }

  worker.port.start()
})
</script>

<template>
  <div class="messages flex-grow p-6 overflow-y-auto">
    <template v-if="$route.params.id">
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
    <div v-else>
      Select a thread to continue chatting, or send a message to start a new
      thread.
    </div>
  </div>

  <form @submit.prevent="sendMessage">
    <div class="p-4 border-t flex">
      <textarea
        autofocus
        class="textarea textarea-bordered w-full"
        placeholder="Type a message..."
        v-model="message"
        @keydown.meta.enter="sendMessage"
        @keydown.ctrl.enter="sendMessage"
      >
      </textarea>
      <button type="submit" class="btn btn-primary ms-4">Send</button>
    </div>
  </form>
</template>
