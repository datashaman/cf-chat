<script setup>
const { loggedIn } = useUserSession()
const route = useRoute()

if (!loggedIn.value && route.path !== "/login") {
  navigateTo("/login")
}
</script>
<template>
  <div>
    <div class="flex h-screen bg-base-100">
      <div class="w-64 flex-none border-r">
        <KeepAlive>
          <UserCard />
        </KeepAlive>
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
