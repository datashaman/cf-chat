<script setup>
const { loggedIn, user, clear } = useUserSession()

const logout = async () => {
  await clear()
  return navigateTo("/login")
}
</script>
<template>
  <div>
    <AuthState v-slot="{ loggedIn, user, clear }">
      <div v-if="loggedIn">
        {{ user }}
        <p>Welcome, {{ user.name }}!</p>
        <button @click="logout">Logout</button>
      </div>
      <div v-else>
        <p>You are not logged in.</p>
      </div>
    </AuthState>
  </div>
</template>
