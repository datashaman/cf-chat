export default (handlers) => {
  const { $bus } = useNuxtApp()

  const worker = new SharedWorker(
    new URL("../workers/threads.worker.js", import.meta.url),
    {
      type: "module",
    },
  )

  handlers.debug = (payload) => {
    console.log(payload)
  }

  handlers.newThread = (payload) => {
    $bus.emit("newThread", payload)
  }

  worker.port.onmessage = (message) => {
    const { type, payload } = message.data
    const handler = handlers[type]
    if (handler) handler(payload)
  }

  return worker
}
