<script setup>
const { loggedIn } = useUserSession()
const route = useRoute()

if (import.meta.env.PROD && !loggedIn.value && route.path !== "/login") {
  navigateTo("/login")
}
</script>
<template>
  <div>
    <div class="flex h-screen bg-base-100">
      <div class="w-64 flex-none border-r">
        <UserCard />
        <KeepAlive>
          <ThreadList />
        </KeepAlive>
      </div>
      <div class="flex flex-col flex-grow">
        <slot />
      </div>
    </div>
  </div>
</template>
