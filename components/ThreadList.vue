<script setup>
import { ref, onMounted } from "vue"

const props = defineProps({
  currentThread: String,
})

const threads = ref([])

const createThread = async (messages = []) => {
  const { thread } = await $fetch("/api/threads", {
    method: "POST",
    body: JSON.stringify({ messages, metadata: { title: "New Thread" } }),
  })
  threads.value.unshift(thread)

  await navigateTo(`/threads/${thread.id}`)
}

const deleteThread = async (id) => {
  await $fetch(`/api/threads/${id}`, { method: "DELETE" })
  threads.value = threads.value.filter((thread) => thread.id !== id)

  if (props.currentThread === id) {
    await navigateTo(`/`)
  }
}

onMounted(async () => {
  const { threads: data } = await $fetch("/api/threads")
  threads.value = data
})
</script>
<template>
  <ul class="menu rounded-box">
    <li class="menu-title flex flex-row">
      <div class="flex-grow">Threads</div>
      <div>
        <button
          class="btn btn-square btn-primary btn-xs"
          @click="() => createThread()"
        >
          +
        </button>
      </div>
    </li>
    <li v-for="thread in threads" :key="thread.id" class="menu-item">
      <a
        :href="`/threads/${thread.id}`"
        :class="{
          flex: true,
          flexRow: true,
          active: thread.id == props.currentThread,
        }"
      >
        <div class="flex-grow">
          {{ thread.metadata?.title }}
        </div>
        <button
          class="btn btn-square btn-xs btn-error"
          @click="deleteThread(thread.id)"
        >
          X
        </button>
      </a>
    </li>
  </ul>
</template>
