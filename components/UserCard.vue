<script setup>
const { loggedIn, user, clear } = useUserSession()
</script>
<template>
  <div>
    <AuthState v-slot="{ loggedIn, user, clear }">
      <div v-if="loggedIn">
        <p>Welcome, {{ user.name }}!</p>
        <button @click="clear">Logout</button>
      </div>
      <div v-else>
        <p>You are not logged in.</p>
      </div>
    </AuthState>
  </div>
</template>
