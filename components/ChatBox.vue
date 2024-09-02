<script setup>
import { ref } from "vue"

const props = defineProps({
  currentThread: String,
})

const message = ref("")
const messageList = ref(null)

const sendMessage = async () => {
  if (!message.value) return

  if (!props.currentThread) {
    await createThread([{ role: "user", content: message.value }])
  }

  const userMessage = { role: "user", content: message.value }
  const responseMessage = ref("...")

  messageList.value.push({
    ...userMessage,
  })

  message.value = ""

  messageList.value.push({
    role: "assistant",
    content: responseMessage,
  })

  const response = await $fetch(`/api/threads/${props.currentThread}/runs`, {
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
</script>

<template>
  <div class="flex-grow p-6 overflow-y-auto">
    <MessageList :currentThread="props.currentThread" ref="messageList" />
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
</template>
