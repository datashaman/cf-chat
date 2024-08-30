/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import { Hono } from 'hono'
import { cors } from 'hono/cors'

import database from './database'
import openai from './openai'

const app = new Hono()

app.use('/*', cors())

app.get('/threads', async (c) => {
  const dbThreads =  await database.listThreads(c.env)
  const threads = await Promise.all(
    dbThreads
      .map((id) => openai.getThread(c.env, id))
  )
  return c.json({ threads })
})

app.post('/threads', async (c) => {
  const thread = await openai.createThread(c.env)
  await database.createThread(c.env, thread.id)
  return c.json({ thread })
})

app.get('/threads/:id', async (c) => {
  const thread = await openai.getThread(c.env, c.req.param('id'))
  return c.json({ thread })
})

app.put('/threads/:id', async (c) => {
  const thread = await openai.updateThread(c.env, c.req.param('id'))
  return c.json({ thread })
})

app.delete('/threads/:id', async (c) => {
  const thread = await openai.deleteThread(c.env, c.req.param('id'))
  await database.deleteThread(c.env, c.req.param('id'))
  return c.json({ thread })
})

app.get('/threads/:id/messages', async (c) => {
  const messages = await openai.listMessages(c.env, c.req.param('id'))
  return c.json({ messages })
})

app.post('/threads/:id/messages', async (c) => {
  const body = await c.req.parseBody()
  const message = await openai.createMessage(c.env, c.req.param('id'), body)
  return c.json({ message })
})

export default {
  async fetch(request, env, ctx) {
    // const assistant = await createOrUpdateAssistant(env)
    // console.log('updated or created assistant', assistant.id)
    return app.fetch(request, env, ctx)
  },
}
