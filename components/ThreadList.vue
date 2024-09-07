<script setup>
const props = defineProps({
  currentThreadId: String,
})

const threadStore = useThreadStore()

const createThread = async (messages = []) => {
  const thread = await threadStore.createThread({
    messages,
    metadata: { title: "New Thread" },
  })

  await navigateTo(`/threads/${thread.id}`)
}

const deleteThread = async (id) => {
  await threadStore.deleteThread(id)

  if (props.currentThreadId === id) {
    await navigateTo(`/`)
  }
}

onMounted(async () => {
  await threadStore.fetchThreads()
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
    <li
      v-for="thread in threadStore.threads"
      :key="thread.id"
      class="menu-item"
    >
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
