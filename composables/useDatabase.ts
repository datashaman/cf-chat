export const useDatabase = (context) => {
  const env = context.cloudflare.env

  const getThread = async (threadId: string) => {
    const statement = await env.DB.prepare(
      "SELECT * FROM Threads WHERE ThreadId = ?",
    )
    return statement.bind(threadId).first()
  }

  return {
    createThread: async (threadId: string) => {
      const statement = await env.DB.prepare(
        "INSERT INTO Threads (ThreadId, CreatedAt, UpdatedAt) VALUES (?, ?, ?)",
      )
      const now = new Date().toISOString()

      const result = await statement.bind(threadId, now, now).run()

      if (result.success) {
        const id = result.meta.last_row_id
        return getThread(id)
      }

      throw new Error("Failed to create thread")
    },
    deleteThread: async (threadId: string) => {
      const statement = await env.DB.prepare(
        "DELETE FROM Threads WHERE ThreadId = ?",
      )
      return statement.bind(threadId).run()
    },
    getThread,
    listThreads: async () => {
      const statement = await env.DB.prepare(
        "SELECT ThreadId FROM Threads ORDER BY CreatedAt DESC",
      )
      const { results } = await statement.all()
      return results.map((row) => row.ThreadID)
    },
  }
}
