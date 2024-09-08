import { mande } from "mande"

const addMany = async (db, storeName, records) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite")
    const objectStore = transaction.objectStore(storeName)

    // Iterate through the records and add them
    let count = 0
    for (const record of records) {
      const request = objectStore.add(record)

      request.onerror = function () {
        console.error("Error adding record:", request.error)
      }

      request.onsuccess = function () {
        count++
      }
    }

    // Resolve or reject the promise based on the transaction outcome
    transaction.oncomplete = function () {
      console.log(`${count} messages added`)
      resolve()
    }

    transaction.onerror = function () {
      console.error("Transaction failed:", transaction.error)
      reject(transaction.error)
    }
  })
}

self.withMessages = (callback) => {
  const request = indexedDB.open("messages", 2)

  request.onerror = (event) => {
    console.error("Error opening database", event)
  }

  request.onupgradeneeded = (event) => {
    const db = event.target.result
    const store = db.createObjectStore("messages", { keyPath: "id" })
    store.createIndex("threadId", "threadId", { unique: false })
  }

  request.onsuccess = (event) => {
    callback(event.target.result)
  }
}

self.withThreads = (callback) => {
  const request = indexedDB.open("threads", 1)

  request.onerror = (event) => {
    console.error("Error opening database", event)
  }

  request.onupgradeneeded = (event) => {
    const db = event.target.result
    const store = db.createObjectStore("threads", { keyPath: "id" })
  }

  request.onsuccess = (event) => {
    callback(event.target.result)
  }
}

self.fetchThreads = async () => {
  self.postMessage({
    type: "threads",
    payload: await mande("/api/threads").get(),
  })
}

self.fetchThread = async (payload) => {
  try {
    self.postMessage({
      type: "thread",
      payload: {
        thread: await mande(`/api/threads/${payload.threadId}`).get(),
      },
    })
  } catch (error) {
    if (error.response.status === 404) {
      self.postMessage({
        type: "thread",
        payload: { thread: null },
      })

      return
    }

    throw error
  }
}

self.createThread = async (payload) => {
  self.postMessage({
    type: "newThread",
    payload: await mande("/api/threads").post(payload),
  })
}

self.deleteThread = async (payload) => {
  self.withMessages(async (db) => {
    const transaction = db.transaction(["messages"], "readwrite")
    const store = transaction.objectStore("messages")

    const request = store
      .index("threadId")
      .getAllKeys(IDBKeyRange.only(payload.threadId))

    request.onsuccess = async (event) => {
      console.log(request, event)
      const keys = event.target.result

      keys.forEach(async (key) => {
        try {
          await store.delete(key)
        } catch (error) {
          console.error("Error deleting message", error)
        }
      })
    }

    request.onerror = (event) => {
      console.error("Error deleting messages", event)
    }

    transaction.onerror = (event) => {
      console.error("Transaction failed", event)
    }

    transaction.oncomplete = async (event) => {
      console.log("All messages deleted successfully")

      self.postMessage({
        type: "deletedThread",
        payload: await mande(`/api/threads/${payload.threadId}`).delete(),
      })
    }
  })
}

self.fetchMessages = async (payload) => {
  if (!payload.threadId) {
    self.postMessage({ type: "messages", payload: { messages: [] } })
    return
  }

  self.withMessages(async (db) => {
    const store = db
      .transaction("messages", "readwrite")
      .objectStore("messages")

    const request = store.index("threadId").getAll(payload.threadId)

    request.onsuccess = async (event) => {
      const messages = request.result
      messages.sort((a, b) => a.created_at - b.created_at)
      const lastId = messages.length ? messages[messages.length - 1].id : null

      let url = `/api/threads/${payload.threadId}/messages`
      if (lastId) {
        url += `?after=${lastId}`
      }

      const { messages: newMessages } = await mande(url).get()

      if (newMessages.length) {
        await addMany(db, "messages", newMessages)
        messages.push(...newMessages)
      }

      self.postMessage({
        type: "messages",
        payload: { messages },
      })
    }
  })
}

self.runThread = async (payload) => {
  const messageId = payload.messageId
  delete payload.messageId

  // Not using mande here because we need a stream response
  const response = await fetch(`/api/threads/${payload.threadId}/runs`, {
    method: "POST",
    body: JSON.stringify(payload),
    responseType: "stream",
  })

  const reader = response.pipeThrough(new TextDecoderStream()).getReader()

  while (true) {
    const { value, done } = await reader.read()

    if (done) {
      break
    }

    value
      .trim()
      .split("\n")
      .forEach((event) => {
        if (event) {
          const delta = JSON.parse(event).content[0].text.value
          self.postMessage({
            type: "delta",
            payload: { delta },
          })
        }
      })
  }
}

self.onmessage = async (message) => {
  const event = message.data
  self[event.type](event.payload)
}
