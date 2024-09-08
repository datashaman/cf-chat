export default oauthFacebookEventHandler({
  config: {
    emailRequired: false,
  },
  async onSuccess(event, { user, tokens }) {
    console.log("Facebook OAuth success:", user)

    await setUserSession(event, {
      provider: "facebook",
      user,
    })
    return sendRedirect(event, "/")
  },
  // Optional, will return a json error and 401 status code by default
  onError(event, error) {
    console.error("Facebook OAuth error:", error)
    return sendRedirect(event, "/")
  },
})
