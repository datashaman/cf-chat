import type { Context } from 'hono'

import { Hono } from 'hono'
import { cors } from 'hono/cors'

import database from '../../database'
import openai from '../../openai'

const getThread = async (c: Context, id: string) => {
  const thread = await openai.getThread(c, id)

  if (!thread) {
    return null
  }

  return {
    id,
    href: `${c.env.APP_URL}/api/threads/${id}`,
    title: thread.metadata.title ?? 'Untitled Thread',
  }
}

const app = new Hono()

app.get('/', async (c: Context) => {
  const dbThreads =  await database.listThreads(c)
  const threads = await Promise.all(
    dbThreads
      .map((id: string) => getThread(c, id))
  )
  return c.json({ threads })
})

app.post('/', async (c: Context) => {
  const body = await c.req.parseBody()
  const thread = await openai.createThread(c, body)
  await database.createThread(c, thread.id)
  return c.json({ thread: await getThread(c, thread.id)})
})

app.get('/:id', async (c: Context) => {
  const thread = await getThread(c, c.req.param('id'))
  return c.json({ thread })
})

app.put('/:id', async (c: Context) => {
  const body = await c.req.parseBody()
  const thread = await openai.updateThread(c, c.req.param('id'), body)
  return c.json({ thread })
})

app.delete('/:id', async (c: Context) => {
  const thread = await openai.deleteThread(c, c.req.param('id'))
  await database.deleteThread(c, c.req.param('id'))
  return c.json({ thread })
})

app.get('/:id/messages', async (c: Context) => {
  const body = await c.req.parseBody()
  const response = await openai.listMessages(c, c.req.param('id'), body)
  return c.json({ messages: response.data })
})

app.post('/:id/messages', async (c: Context) => {
  const body = await c.req.parseBody()
  const message = await openai.createMessage(c, c.req.param('id'), body)
  return c.json({ message })
})

export default app
