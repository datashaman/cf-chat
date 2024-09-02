<script setup>
import { ref } from "vue"
import { marked } from "marked"
import markedLinkifyIt from "marked-linkify-it"
import DOMPurify from "dompurify"

const props = defineProps({
  currentThread: String,
})

marked
  .use({
    breaks: true,
  })
  .use(markedLinkifyIt())

const messages = ref([])

const renderMarkdown = (content) => {
  const html = marked.parseInline(content)
  return DOMPurify.sanitize(html)
}

const push = (message) => {
  messages.value.push({
    id: messages.value.length + 1,
    ...message,
  })
}

onMounted(async () => {
  if (!props.currentThread) {
    return
  }

  const { messages: data } = await $fetch(
    `/api/threads/${props.currentThread}/messages`,
  )

  messages.value = data
})

defineExpose({
  push,
})
</script>
<template>
  <div>
    <template v-if="props.currentThread">
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
</template>
