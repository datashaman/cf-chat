import OpenAI from "openai"

export const useOpenAI = (context) => {
  const env = context.cloudflare.env

  const client = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  })

  const assistantParams = (params = {}) => {
    return {
      model: env.OPENAI_MODEL,
      name: env.OPENAI_ASSISTANT_NAME,
      instructions:
        "You are a helpful AI assistant. You can provide information, answer questions, and help users get things done.",
      temperature: env.OPENAI_ASSISTANT_TEMPERATURE,
      ...params,
    }
  }

  const listAssistants = async () => {
    return client.beta.assistants.list()
  }

  const findAssistant = async (name = env.OPENAI_ASSISTANT_NAME) => {
    const assistants = await listAssistants()
    return assistants.data.find((assistant) => assistant.name === name)
  }

  const createAssistant = async (params) => {
    return client.beta.assistants.create(params)
  }

  const updateAssistant = async (assistantId, params) => {
    return client.beta.assistants.update(assistantId, params)
  }

  return {
    listAssistants,
    findAssistant,
    createAssistant,
    createOrUpdateAssistant: async (params = {}) => {
      const assistant = await findAssistant()
      params = assistantParams(params)

      return assistant
        ? updateAssistant(assistant.id, params)
        : createAssistant(params)
    },
    deleteAssistant: async (assistantId) => {
      return client.beta.assistants.delete(assistantId)
    },
    createThread: async (params = {}) => {
      return client.beta.threads.create(params)
    },
    getThread: async (threadId) => {
      const cache_key = `thread-${threadId}`
      let thread = await env.CACHE.get(cache_key)

      if (!thread) {
        thread = JSON.stringify({
          created_at: new Date() / 1000,
          value: await client.beta.threads.retrieve(threadId),
        })

        await env.CACHE.put(`thread-${threadId}`, thread)
      }

      return JSON.parse(thread).value
    },
    deleteThread: async (threadId) => {
      return client.beta.threads.delete(threadId)
    },
    listMessages: async (threadId, query = { order: "asc" }) => {
      let response = null
      const messages = []

      do {
        response = await client.beta.threads.messages.list(threadId, query)
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
    createMessage: async (threadId, params) => {
      return client.beta.threads.messages.create(threadId, params)
    },
    deleteMessage: async (threadId, messageId) => {
      return client.beta.threads.messages.delete(threadId, messageId)
    },
    runThread: async (threadId, params) => {
      return client.beta.threads.runs.stream(threadId, params)
    },
  }
}
