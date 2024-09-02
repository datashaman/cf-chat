<script setup>
import { ref, onMounted, computed } from "vue"

const threads = ref([])
const messages = ref({})
const currentThread = ref(null)
const message = ref("")

const createThread = async () => {
  const { thread: data } = await $fetch("/api/threads", {
    method: "POST",
    body: JSON.stringify({ metadata: { title: "New Thread" } }),
  })
  threads.value.unshift(data)
}

const setCurrentThread = async (id) => {
  currentThread.value = id
  const { messages: data } = await $fetch(`/api/threads/${id}/messages`)
  messages.value[currentThread.value] = data
}

const sendMessage = async () => {
  if (!message.value) return

  if (!currentThread.value) {
    await createThread()
    await setCurrentThread(threads.value[0].id)
  }

  const userMessage = { role: "user", content: message.value }
  const responseMessage = ref("...")

  messages.value[currentThread.value].push({
    ...userMessage,
    id: messages.value[currentThread.value].length + 1,
  })

  message.value = ""

  messages.value[currentThread.value].push({
    role: "assistant",
    content: responseMessage,
    id: messages.value[currentThread.value].length + 1,
  })

  const response = await $fetch(`/api/threads/${currentThread.value}/runs`, {
    method: "POST",
    body: JSON.stringify({
      additional_messages: [userMessage],
    }),
    responseType: "stream",
  })

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

const currentMessages = computed(() => {
  return messages.value[currentThread.value] || []
})

const supportsRequestStreams = () => {
  let duplexAccessed = false

  const hasContentType = new Request("", {
    body: new ReadableStream(),
    method: "POST",
    get duplex() {
      duplexAccessed = true
      return "half"
    },
  }).headers.has("Content-Type")

  return duplexAccessed && !hasContentType
}

onMounted(async () => {
  console.log("supportsRequestStreams", supportsRequestStreams())
  const { threads: data } = await $fetch("/api/threads")
  threads.value = data
})
</script>

<template>
  <div class="flex h-screen bg-base-100">
    <div class="w-64 flex-none border-r">
      <ul class="menu">
        <li class="menu-item">
          <a href="#">Welcome</a>
        </li>
        <li class="menu-item">
          <a href="#">About</a>
        </li>
        <li class="menu-item">
          <a href="#">Contact</a>
        </li>
      </ul>
      <ul class="menu rounded-box">
        <li class="menu-title flex flex-row">
          <div class="flex-grow">Threads</div>
          <div>
            <button
              class="btn btn-square btn-primary btn-xs"
              @click="createThread"
            >
              +
            </button>
          </div>
        </li>
        <li v-for="thread in threads" :key="thread.id" class="menu-item">
          <a
            href="#"
            :class="{ active: thread.id == currentThread }"
            @click="() => setCurrentThread(thread.id)"
          >
            {{ thread.metadata?.title }}
          </a>
        </li>
      </ul>
    </div>

    <div class="flex flex-col flex-grow">
      <div class="flex-grow p-6 overflow-y-auto">
        <template v-if="currentThread">
          <template v-for="message in currentMessages" :key="message.id">
            <div v-if="message.role === 'user'" class="chat chat-end">
              <div class="chat-bubble chat-bubble-success">
                {{ message.content }}
              </div>
            </div>
            <div v-else class="chat chat-start">
              <div class="chat-bubble chat-bubble-info">
                <template v-if="message.content === '...'">
                  <span class="loading loading-dots loading-xs"></span>
                </template>
                <template v-else>
                  {{ message.content }}
                </template>
              </div>
            </div>
          </template>
        </template>
        <div v-else>Select a thread to start chatting</div>
      </div>

      <form @submit.prevent="sendMessage">
        <div class="p-4 border-t flex">
          <input
            type="text"
            class="input input-bordered w-full"
            placeholder="Type a message..."
            v-model="message"
            @onInput="(e) => setMessage(e.target.value)"
          />
          <button type="submit" class="btn btn-primary ms-2">Send</button>
        </div>
      </form>
    </div>
  </div>
</template>
