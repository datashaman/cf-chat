const openai = async (c, path, options) => {
  const endpoint = c.env.OPENAI_ENDPOINT

  const response = await fetch(`${endpoint}/${path}`, {
    headers: {
      'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
    },
    ...options,
  })

  return response.json()
}

const assistantBody = (c) => {
  return {
    model: c.env.OPENAI_MODEL,
    name: c.env.OPENAI_ASSISTANT_NAME,
    instructions: 'You are a helpful AI assistant. You can provide information, answer questions, and help users get things done.',
    temperature: c.env.OPENAI_ASSISTANT_TEMPERATURE,
  }
}

export const listAssistants = async (c) => {
  return openai(c, 'assistants')
}

export const createAssistant = async (c) => {
  const body = assistantBody(c)
  console.log('Creating assistant with body:', body)
  return openai(c, 'assistants', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const createOrUpdateAssistant = async (c) => {
  const assistants = await listAssistants(c)
  const assistant = assistants.data.find((assistant) => assistant.name === c.env.OPENAI_ASSISTANT_NAME)
  const path = assistant ? `assistants/${assistant.id}` : 'assistants'

  return openai(c, path, {
    method: 'POST',
    body: JSON.stringify(assistantBody(c)),
  })
}

export const deleteAssistant = async (c) => {
  const assistants = await listAssistants(c)
  const assistant = assistants.data.find((assistant) => assistant.name === c.env.OPENAI_ASSISTANT_NAME)

  return openai(c, `assistants/${assistant.id}`, {
    method: 'DELETE',
  })
}

export const createThread = async (c, body = {}) => {
  return openai(c, `threads`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const getThread = async (c, threadId) => {
  const cache_key = `thread-${threadId}`
  let thread = await c.env.CACHE.get(cache_key)

  if (!thread) {
    thread = JSON.stringify({
      created_at: (new Date()) / 1000,
      value: await openai(c, `threads/${threadId}`),
    })

    await c.env.CACHE.put(`thread-${threadId}`, thread)
  }

  return JSON.parse(thread).value
}

export const deleteThread = async (c, threadId) => {
  return openai(c, `threads/${threadId}`, {
    method: 'DELETE',
  })
}

export const listMessages = async (c, threadId, params = {}) => {
  let response = null
  let queryString = ''

  const messages = []

  do {
    queryString = params
      ? '?' + Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')
      : ''
    response = await openai(c, `threads/${threadId}/messages${queryString}`)
    messages.push(...response.data)
  } while (response.has_more)

  return messages
}

export const createMessage = async (c, threadId, body) => {
  return openai(c, `threads/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const runThread = async (c, threadId, additional_instructions = null, additional_messages = []) => {
  return openai(c, `threads/${threadId}/runs`, {
    method: 'POST',
    body: JSON.stringify({
      additional_instructions,
      additional_messages,
      assistant_id: c.env.OPENAI_ASSISTANT_ID,
      temperature: c.env.OPENAI_TEMPERATURE,
    }),
  })
}

export default {
  createAssistant,
  createMessage,
  createOrUpdateAssistant,
  createThread,
  deleteAssistant,
  deleteThread,
  getThread,
  listAssistants,
  listMessages,
  runThread,
}
