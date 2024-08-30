/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import { Hono } from 'hono'

import openai from './openai';

const app = new Hono();

app.get('/threads', async (c) => {
  return c.json({ threads: ['thread1', 'thread2'] });
});

app.post('/threads', async (c) => {
  const thread = await openai.createThread(c.env);

  return c.json({ thread });
});

app.get('/threads/:id', async (c) => {
  const thread = await openai.getThread(c.env, req.params.id);

  return c.json({ thread });
});

app.put('/threads/:id', async (c) => {
  const thread = await openai.updateThread(c.env, req.params.id);

  return c.json({ thread });
});

app.delete('/threads/:id', async (c) => {
  const thread = await openai.deleteThread(c.env, req.params.id);

  return c.json({ thread });
});

app.get('/threads/:id/messages', async (c) => {
  const messages = await openai.listMessages(c.env, req.params.id);

  return c.json({ messages });
});

app.post('/threads/:id/messages', async (c) => {
  const body = await c.req.parseBody();
  const message = await openai.createMessage(c.env, req.params.id, body);

  return c.json({ message });
});

export default {
  async fetch(request, env, ctx) {
    // const assistant = await createOrUpdateAssistant(env);
    return app.fetch(request, env, ctx);
  },
};
