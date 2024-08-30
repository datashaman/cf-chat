/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import { useState } from 'hono/jsx'

export const App = () => {
  const [threads, setThreads] = useState({
    1: {
      title: 'Thread 1',
      messages: [
        {
          role: 'user',
          content: 'Hello!',
        },
        {
          role: 'bot',
          content: 'Hi!',
        },
      ],
    },
  })
  const [currentThread, setCurrentThread] = useState(1)
  const [message, setMessage] = useState('')

  const sendMessage = (e) => {
    e.preventDefault()

    const messages = threads[currentThread].messages

    setThreads({
      ...threads,
      [currentThread]: {
        ...threads[currentThread],
        messages: [...messages, {
          role: 'user',
          content: message,
        }],
      },
    })

    setMessage('')
  }

  return (
    <div class="flex h-screen bg-base-100">
      <div class="w-64 border-r">
        <ul class="menu">
          <li class="menu-item">
            <a href="#">Welcome</a>
          </li>
          <li class="menu-item">
            <a href="#">About</a>
          </li>
          <li class="menu-item">
            <a href="#">Contact</a>
          </li>
        </ul>
        <ul class="menu rounded-box">
          <li class="menu-title">Threads</li>
          {Object.entries(threads).map(([id, thread]) => (
            <li class="menu-item">
              <a href="#" class={id == currentThread ? 'active' : ''} onClick={() => setCurrentThread(id)}>{thread.title}</a>
            </li>
          ))}
        </ul>
      </div>

      <div class="flex flex-col flex-grow">
        <div class="flex-grow p-6 overflow-y-auto">
          {threads[currentThread].messages.map((msg, index) => (
            msg.role === 'user' ? (
              <div class="chat chat-end">
                <div class="chat-bubble chat-bubble-success">{msg.content}</div>
              </div>
            ) : (
              <div class="chat chat-start">
                <div class="chat-bubble chat-bubble-info">{msg.content}</div>
              </div>
            )
          ))}
        </div>

        <form onSubmit={sendMessage}>
          <div class="p-4 border-t flex">
            <input type="text" class="input input-bordered w-full" placeholder="Type a message..." value={message} onInput={(e) => setMessage(e.target.value)} />
            <button type="submit" class="btn btn-primary ms-2">Send</button>
          </div>
        </form>
      </div>
    </div>
  )
}
