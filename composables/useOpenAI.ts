export const useOpenAI = (context) => {
  const env = context.cloudflare.env

  const openai = async (path: string, options: object = {}) => {
    return $fetch(`${env.OPENAI_ENDPOINT}/${path}`, {
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
      ...options,
    })
  }

  const assistantBody = () => {
    return {
      model: env.OPENAI_MODEL,
      name: env.OPENAI_ASSISTANT_NAME,
      instructions:
        "You are a helpful AI assistant. You can provide information, answer questions, and help users get things done.",
      temperature: env.OPENAI_ASSISTANT_TEMPERATURE,
    }
  }

  const listAssistants = async () => {
    return openai("assistants")
  }

  return {
    listAssistants,
    createAssistant: async () => {
      const body = assistantBody()
      console.log("Creating assistant with body:", body)
      return openai("assistants", {
        method: "POST",
        body: JSON.stringify(body),
      })
    },
    createOrModifyAssistant: async () => {
      const assistants = await listAssistants()
      const assistant = assistants.data.find(
        (assistant) => assistant.name === c.env.OPENAI_ASSISTANT_NAME,
      )
      const path = assistant ? `assistants/${assistant.id}` : "assistants"

      return openai(path, {
        method: "POST",
        body: JSON.stringify(assistantBody(c)),
      })
    },
    deleteAssistant: async () => {
      const assistants = await listAssistants()
      const assistant = assistants.data.find(
        (assistant) => assistant.name === c.env.OPENAI_ASSISTANT_NAME,
      )

      return openai(`assistants/${assistant.id}`, {
        method: "DELETE",
      })
    },
    createThread: async (body = {}) => {
      return openai("threads", {
        method: "POST",
        body: JSON.stringify(body),
      })
    },
    getThread: async (threadId) => {
      const cache_key = `thread-${threadId}`
      let thread = await env.CACHE.get(cache_key)

      if (!thread) {
        thread = JSON.stringify({
          created_at: new Date() / 1000,
          value: await openai(`threads/${threadId}`),
        })

        await env.CACHE.put(`thread-${threadId}`, thread)
      }

      return JSON.parse(thread).value
    },
    deleteThread: async (threadId) => {
      return openai(`threads/${threadId}`, {
        method: "DELETE",
      })
    },
    listMessages: async (threadId, params = {}) => {
      let response = null
      let queryString = ""

      const messages = []

      do {
        queryString = params
          ? "?" +
            Object.entries(params)
              .map(([key, value]) => `${key}=${value}`)
              .join("&")
          : ""
        response = await openai(`threads/${threadId}/messages${queryString}`)
        messages.push(...response.data)
      } while (response.has_more)

      return messages.map((message) => {
        return {
          id: message.id,
          created_at: message.created_at,
          content: message.content[0].text.value,
          role: message.role,
        }
      })
    },
    createMessage: async (threadId, body) => {
      return openai(`threads/${threadId}/messages`, {
        method: "POST",
        body: JSON.stringify(body),
      })
    },
    deleteMessage: async (threadId, messageId) => {
      return openai(`threads/${threadId}/messages/${messageId}`, {
        method: "DELETE",
      })
    },
    runThread: async (threadId, body = {}) => {
      return openai(`threads/${threadId}/runs`, {
        method: "POST",
        body: JSON.stringify({
          assistant_id: env.OPENAI_ASSISTANT_ID,
          temperature: env.OPENAI_TEMPERATURE,
          ...body,
        }),
      })
    },
  }
}
