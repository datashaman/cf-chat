const openai = async (env, path, options) => {
  const endpoint = env.OPENAI_ENDPOINT;

  const response = await fetch(`${endpoint}/${path}`, {
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
    },
    ...options,
  });

  return response.json();
};

const assistantBody = (env) => {
  return {
    model: env.OPENAI_MODEL,
    name: env.OPENAI_ASSISTANT_NAME,
    instructions: 'You are a helpful AI assistant. You can provide information, answer questions, and help users get things done.',
    temperature: env.OPENAI_ASSISTANT_TEMPERATURE,
  };
};

export const listAssistants = async (env) => {
  return openai(env, 'assistants', {
    method: 'GET',
  });
};

export const createAssistant = async (env) => {
  return openai(env, 'assistants', {
    method: 'POST',
    body: JSON.stringify(assistantBody(env)),
  });
};

export const createOrUpdateAssistant = async (env) => {
  const assistants = await listAssistants(env);
  const assistant = assistants.data.find((assistant) => assistant.name === env.OPENAI_ASSISTANT_NAME);
  const path = assistant ? `assistants/${assistant.id}` : 'assistants';

  return openai(env, path, {
    method: 'POST',
    body: JSON.stringify(assistantBody(env)),
  });
};

export const deleteAssistant = async (env) => {
  const assistants = await listAssistants(env);
  const assistant = assistants.data.find((assistant) => assistant.name === env.OPENAI_ASSISTANT_NAME);

  return openai(env, `assistants/${assistant.id}`, {
    method: 'DELETE',
  });
};

export const createThread = async (env, title = 'New Thread', messages = []) => {
  return openai(env, `threads`, {
    method: 'POST',
    body: JSON.stringify({
      messages,
      metadata: {
        title,
      },
    }),
  });
};

export const getThread = async (env, threadId) => {
  return openai(env, `threads/${threadId}`, {
    method: 'GET',
  });
}

export const deleteThread = async (env, threadId) => {
  return openai(env, `threads/${threadId}`, {
    method: 'DELETE',
  });
};

export const listMessages = async (env, threadId) => {
  return openai(env, `threads/${threadId}/messages`, {
    method: 'GET',
  });
}

export const createMessage = async (env, threadId, content, role = 'user') => {
  return openai(env, `threads/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      role,
      content,
    }),
  });
};

export const runThread = async (env, threadId, additional_instructions = null, additional_messages = []) => {
  return openai(env, `threads/${threadId}/runs`, {
    method: 'POST',
    body: JSON.stringify({
      additional_instructions,
      additional_messages,
      assistant_id: env.OPENAI_ASSISTANT_ID,
      temperature: env.OPENAI_TEMPERATURE,
    }),
  });
};

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
};
