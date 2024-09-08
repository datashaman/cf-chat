export default oauthGoogleEventHandler({
  config: {
    emailRequired: false,
  },
  async onSuccess(event, { user, tokens }) {
    console.log("Google OAuth success:", user)

    await setUserSession(event, {
      user: {
        facebookId: user.id,
      },
    })
    return sendRedirect(event, "/")
  },
  // Optional, will return a json error and 401 status code by default
  onError(event, error) {
    console.error("Google OAuth error:", error)
    return sendRedirect(event, "/")
  },
})
