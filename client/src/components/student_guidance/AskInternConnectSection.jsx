import { useEffect, useRef, useState } from 'react'
import { sendAskInternConnectMessage } from '../../api/student_guidance/guidanceApi'

const quickPromptOptions = [
  'How can I improve my internship profile?',
  'What skills should I learn next?',
  'Help me prepare for internship interviews',
  'Suggest career paths from my interests',
]

function formatTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function buildInitialMessage(studentName) {
  return {
    id: `assistant-welcome-${Date.now()}`,
    role: 'assistant',
    text: `Hi ${studentName}. I am InternConnect Assistant. Ask me about internship readiness, skills, interviews, and career direction.`,
    time: formatTimestamp(),
  }
}

function AskInternConnectSection({ student, interests, skills, examResults }) {
  const [messages, setMessages] = useState(() => [buildInitialMessage(student.name)])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isTyping])

  const sendMessage = async (rawText) => {
    const text = rawText.trim()
    if (!text || isTyping) {
      return
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      time: formatTimestamp(),
    }

    const history = messages
      .filter(
        (item) =>
          (item.role === 'user' || item.role === 'assistant') &&
          !String(item.id).startsWith('assistant-welcome-'),
      )
      .map((item) => ({ role: item.role, text: item.text }))
      .slice(-10)

    setMessages((current) => [...current, userMessage])
    setChatHistory((current) => [...current, text])
    setInput('')
    setIsTyping(true)

    try {
      const response = await sendAskInternConnectMessage({
        message: text,
        history,
      })

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text:
          response.reply ||
          'I could not generate a response right now. Please try again with a more specific question.',
        time: formatTimestamp(),
      }

      setMessages((current) => [...current, assistantMessage])
    } catch (error) {
      const fallbackMessage = {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        text:
          error.response?.data?.message ||
          'I am unable to reach the AI service right now. Please try again in a moment.',
        time: formatTimestamp(),
      }

      setMessages((current) => [...current, fallbackMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage(input)
  }

  const handleClearChat = () => {
    setMessages([buildInitialMessage(student.name)])
    setInput('')
    setIsTyping(false)
    setChatHistory([])
  }

  return (
    <section className="rounded-2xl border border-[#E8EAF0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E8EAF0] pb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1A1D27]">Ask InternConnect</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Chat with your guidance assistant for profile, interview, skills, and career support.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#EEF2FD] px-3 py-1 text-xs font-semibold text-[#3B6FE8]">AI Powered</span>
          <button
            type="button"
            onClick={handleClearChat}
            className="rounded-[10px] border border-[#D4E0FA] px-3 py-2 text-xs font-semibold text-[#3B6FE8] transition hover:border-[#BFD4FF] hover:bg-[#EEF2FD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8DB2FF] focus-visible:ring-offset-2"
          >
            Clear Chat
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-2xl border border-[#E8EAF0] bg-[#FCFCFD] p-4">
          <div className="h-[420px] overflow-y-auto pr-1">
            <div className="space-y-3">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === 'assistant'
                      ? 'mr-auto border border-[#E8EAF0] bg-white text-[#1A1D27]'
                      : 'ml-auto bg-[#3B6FE8] text-white'
                  }`}
                >
                  <p>{message.text}</p>
                  <p
                    className={`mt-2 text-[11px] font-semibold ${
                      message.role === 'assistant' ? 'text-[#8092B5]' : 'text-[#DBE8FF]'
                    }`}
                  >
                    {message.time}
                  </p>
                </article>
              ))}

              {isTyping && (
                <article className="mr-auto rounded-2xl border border-[#E8EAF0] bg-white px-4 py-3 text-sm text-[#6B7280]">
                  InternConnect is typing...
                </article>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about profile improvements, internship readiness, or career direction..."
              rows={3}
              className="w-full resize-none rounded-[10px] border border-[#E8EAF0] bg-white px-4 py-3 text-sm outline-none transition hover:border-[#CAD8F5] focus:border-[#3B6FE8] focus-visible:ring-2 focus-visible:ring-[#BFD4FF]"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-[#8092B5]">Enter your message and press Send.</p>
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="rounded-[10px] bg-[#3B6FE8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2D5CD4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8DB2FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#E8EAF0] bg-[#FCFCFD] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Quick Prompts</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickPromptOptions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={isTyping}
                  className="rounded-full border border-[#D4E0FA] bg-white px-3 py-1.5 text-xs font-semibold text-[#3B6FE8] transition hover:border-[#BFD4FF] hover:bg-[#EEF2FD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8DB2FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8EAF0] bg-[#FCFCFD] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">Profile Context</p>
            <div className="mt-3 space-y-2 text-sm text-[#1A1D27]">
              <p>
                <span className="font-semibold">Student:</span> {student.name}
              </p>
              <p>
                <span className="font-semibold">Interests:</span> {interests.length}
              </p>
              <p>
                <span className="font-semibold">Skills:</span> {skills.length}
              </p>
              <p>
                <span className="font-semibold">Exam Results:</span> {examResults.length}
              </p>
              <p>
                <span className="font-semibold">Session Questions:</span> {chatHistory.length}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default AskInternConnectSection
