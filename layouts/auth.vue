<script setup>
const { loggedIn } = useUserSession()
const route = useRoute()

if (import.meta.env.PROD && !loggedIn.value && route.path !== "/login") {
  navigateTo("/login")
}
</script>
<template>
  <div>
    <div class="flex items-center justify-center min-h-screen bg-base-200">
      <slot />
    </div>
  </div>
</template>
