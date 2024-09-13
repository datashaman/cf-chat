import OpenAI from "openai"
import { ref } from "vue"

export const useOpenAI = (env) => {
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
    const assistants = []

    for await (const assistant of client.beta.assistants.list()) {
      assistants.push(assistant)
    }

    return assistants
  }

  const findAssistant = async (name = env.OPENAI_ASSISTANT_NAME) => {
    const assistants = await listAssistants()
    return assistants.find((assistant) => assistant.name === name)
  }

  const createAssistant = (params) => {
    return client.beta.assistants.create(params)
  }

  const updateAssistant = (assistantId, params) => {
    return client.beta.assistants.update(assistantId, params)
  }

  const createOrUpdateAssistant = async (params = {}) => {
    const assistant = await findAssistant()
    params = assistantParams(params)

    return assistant
      ? updateAssistant(assistant.id, params)
      : createAssistant(params)
  }

  return {
    listAssistants,
    findAssistant,
    createAssistant,
    createOrUpdateAssistant,
    deleteAssistant: (assistantId) => {
      return client.beta.assistants.del(assistantId)
    },
    createThread: (params = {}) => {
      return client.beta.threads.create(params)
    },
    getThread: (threadId) => {
      try {
        return client.beta.threads.retrieve(threadId)
      } catch (error) {
        console.error(error)
      }
    },
    deleteThread: (threadId) => {
      return client.beta.threads.del(threadId)
    },
    listMessages: async (threadId, query = {}) => {
      const messages = []
      query.order = "asc"

      for await (const message of client.beta.threads.messages.list(
        threadId,
        query,
      )) {
        messages.push({
          threadId: threadId,
          id: message.id,
          created_at: message.created_at,
          content: message.content[0].text.value,
          role: message.role,
        })
      }

      return messages
    },
    createMessage: (threadId, params) => {
      return client.beta.threads.messages.create(threadId, params)
    },
    deleteMessage: (threadId, messageId) => {
      return client.beta.threads.messages.del(threadId, messageId)
    },
    runThread: (threadId, params) => {
      return client.beta.threads.runs.stream(threadId, params)
    },
    submitToolOutputs: (threadId, runId, toolOutputs) => {
      return client.beta.threads.runs.submitToolOutputsStream(threadId, runId, {
        tool_outputs: toolOutputs,
      })
    },
  }
}
