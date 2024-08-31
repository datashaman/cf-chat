export const listThreads = async (c) => {
  const statement = await c.env.DB.prepare('SELECT ThreadId FROM Threads ORDER BY CreatedAt DESC')
  const { results } = await statement.all()
  return results.map((row) => row.ThreadID)
}

export const createThread = async (c, threadId) => {
  const statement = await c.env.DB.prepare('INSERT INTO Threads (ThreadId, CreatedAt, UpdatedAt) VALUES (?, ?, ?)')
  const now = new Date().toISOString()

  const result = await statement
    .bind(threadId, now, now)
    .run()

  if (result.success) {
    const id = result.meta.last_row_id
    return getThread(c, id)
  }

  throw new Error('Failed to create thread')
}

export const getThread = async (c, threadId) => {
  const statement = await c.env.DB.prepare('SELECT * FROM Threads WHERE ThreadId = ?')
  return statement
    .bind(threadId)
    .first()
}

export const deleteThread = async (c, threadId) => {
  const statement = await c.env.DB.prepare('DELETE FROM Threads WHERE ThreadId = ?')
  return statement
    .bind(threadId)
    .run()
}

export default {
  createThread,
  deleteThread,
  getThread,
  listThreads,
}
