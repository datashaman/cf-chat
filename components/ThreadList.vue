<script setup>
const props = defineProps({
  currentThreadId: String,
})

const { $bus } = useNuxtApp()

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

  if (props.currentThreadId === id) {
    await navigateTo(`/`)
  }
}

onMounted(async () => {
  const { threads: data } = await $fetch("/api/threads")
  threads.value = data

  $bus.on("thread-created", (thread) => {
    threads.value.unshift(thread)
  })
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
      <NuxtLink
        :to="{ name: 'threads-id', params: { id: thread.id } }"
        :class="{
          flex: true,
          flexRow: true,
          active: thread.id == props.currentThreadId,
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
      </NuxtLink>
    </li>
  </ul>
</template>
