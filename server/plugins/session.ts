export default defineNitroPlugin(() => {
  sessionHooks.hook("clear", async (session, event) => {
    navigateTo("/login")
  })
})
