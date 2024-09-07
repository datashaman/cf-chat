import { mande } from "mande"

const addMany = async (db, storeName, records) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite")
    const objectStore = transaction.objectStore(storeName)

    // Iterate through the records and add them
    for (const record of records) {
      const request = objectStore.add(record)

      request.onerror = function () {
        console.error("Error adding record:", request.error)
      }
    }

    // Resolve or reject the promise based on the transaction outcome
    transaction.oncomplete = function () {
      console.log("All records added successfully")
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

self.getThreads = async () => {
  self.postMessage({
    type: "threads",
    payload: await mande("/api/threads").get(),
  })
}

self.createThread = async (payload) => {
  self.postMessage({
    type: "newThread",
    payload: await mande("/api/threads").post(payload),
  })
}

self.deleteThread = async (payload) => {
  self.postMessage({
    type: "deletedThread",
    payload: await mande("/api/threads/${payload.threadId}").delete(),
  })
}

self.fetchMessages = async (payload) => {
  if (!payload.threadId) {
    self.postMessage({ type: "messages", payload: { messages: [] } })
    return
  }

  self.withMessages(async (db) => {
    const store = db
      .transaction("messages", IDBTransaction.READ_WRITE)
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
