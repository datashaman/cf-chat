<script setup>
const route = useRoute()
const threads = ref([])

let worker

const createThread = async () => {
  return worker.postMessage({
    type: "createThread",
    payload: {
      metadata: { title: "New Thread" },
    },
  })
}

const deleteThread = async (threadId) => {
  return worker.postMessage({
    type: "deleteThread",
    payload: { threadId },
  })
}

onMounted(async () => {
  const { $bus } = useNuxtApp()

  worker = useWorker({
    deletedThread: async (payload) => {
      threads.value = threads.value.filter(
        (thread) => thread.id !== payload.thread.id,
      )

      if (route.params.id === payload.thread.id) {
        await navigateTo(`/`)
      }
    },
    threads: (payload) => (threads.value = payload.threads),
  })

  // This is done via bus because a thread can be created
  // from thread list and / or message list components
  $bus.on("newThread", async ({ thread }) => {
    threads.value = [thread, ...threads.value]
    return navigateTo(`/threads/${thread.id}`)
  })

  worker.postMessage({ type: "fetchThreads" })
})

onBeforeUnmount(() => {
  worker.terminate()
})
</script>
<template>
  <ul class="menu rounded-box">
    <li class="menu-item">
      <NuxtLink href="/" :class="{ active: !route.params.id }"
        >Create Thread</NuxtLink
      >
    </li>
    <li v-for="thread in threads" :key="thread.id" class="menu-item">
      <NuxtLink
        :to="{ name: 'threads-id', params: { id: thread.id } }"
        :class="{
          flex: true,
          flexRow: true,
          active: thread.id == route.params.id,
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
