<script setup>
const { loggedIn, user, clear } = useUserSession()

const logout = async () => {
  await clear()
  return navigateTo("/login")
}
</script>
<template>
  <div class="p-2">
    <AuthState v-slot="{ loggedIn, user }">
      <div v-if="loggedIn">
        <div class="p-4">
          <h2 class="font-bold text-3xl">Welcome!</h2>
          <p>You're logged in as</p>
          <p>{{ user.name }}.</p>
          <div class="card-actions mt-2">
            <button @click="logout" class="btn btn-primary">Logout</button>
          </div>
        </div>
      </div>
    </AuthState>
  </div>
</template>
