export const listThreads = async (env) => {
  const statement = await env.DB.prepare('SELECT ThreadId FROM Threads ORDER BY CreatedAt DESC')
  const { results } = await statement.all()
  return results.map((row) => row.ThreadID)
}

export const createThread = async (env, threadId) => {
  const statement = await env.DB.prepare('INSERT INTO Threads (ThreadId, CreatedAt, UpdatedAt) VALUES (?, ?, ?)')
  const now = new Date().toISOString()

  const result = await statement
    .bind(threadId, now, now)
    .run()

  if (result.success) {
    const id = result.meta.last_row_id
    return await getThread(env, id)
  }

  throw new Error('Failed to create thread')
}

export const getThread = async (env, threadId) => {
  const statement = await env.DB.prepare('SELECT * FROM Threads WHERE ThreadId = ?')
  const thread = await statement
    .bind(threadId)
    .first()
  return thread
}

export const deleteThread = async (env, threadId) => {
  const statement = await env.DB.prepare('DELETE FROM Threads WHERE ThreadId = ?')
  const result = await statement
    .bind(threadId)
    .run()
  return result.success
}

export default {
  createThread,
  deleteThread,
  getThread,
  listThreads,
}
