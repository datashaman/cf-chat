<script setup>
const loginWithGitHub = async () => {
  await navigateTo("/auth/github", {
    external: true,
  })
}
</script>
<template>
  <div>
    <NuxtLayout name="auth">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <NuxtLink
            to="/auth/facebook"
            class="btn btn-neutral text-white bg-black text-left justify-start"
            external
          >
            <svg
              height="24"
              width="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              class="fill-white"
            >
              <path
                d="M22.675 0h-21.35C.594 0 0 .593 0 1.326v21.348C0 23.407.594 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.412c0-3.1 1.892-4.788 4.659-4.788 1.325 0 2.465.099 2.796.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.312h3.588l-.467 3.622h-3.121V24h6.116C23.406 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z"
              />
            </svg>
            <span>Login with Facebook</span>
          </NuxtLink>
          <NuxtLink
            to="/auth/google"
            class="btn btn-neutral text-white bg-black text-left justify-start"
            external
          >
            <svg
              height="24"
              width="24"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="fill-white"
            >
              <path
                d="M44.5 20H24v8.5h11.7C34.1 32.9 30.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.7 1.1 7.7 3l6.5-6.5C34.7 5.3 29.6 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c10.3 0 19-7.5 19-20 0-1.3-.2-2.7-.5-4z"
                fill="#FFFFFF"
              />
            </svg>
            <span>Login with Google</span>
          </NuxtLink>
          <NuxtLink
            to="/auth/github"
            class="btn btn-neutral text-white bg-black justify-start"
            external
          >
            <!-- GitHub Octocat Logo -->
            <svg
              height="24"
              width="24"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
              class="fill-white"
            >
              <path
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
            <span>Login with GitHub</span>
          </NuxtLink>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>
