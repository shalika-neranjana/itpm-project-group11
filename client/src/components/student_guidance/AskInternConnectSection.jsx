import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { streamAskInternConnectMessage } from '../../api/student_guidance/guidanceApi'

function formatTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function generateDynamicPrompts(chatHistory, interests, skills, examResults) {
  const messageCount = chatHistory.length
  const hasInterests = interests && interests.length > 0
  const hasSkills = skills && skills.length > 0
  const hasExamResults = examResults && examResults.length > 0
  
  // Detect chat topics from recent messages
  const recentChat = chatHistory.slice(-2).join(' ').toLowerCase()
  const topics = {
    skills: recentChat.includes('skill') || recentChat.includes('learn') || recentChat.includes('capability'),
    career: recentChat.includes('career') || recentChat.includes('path') || recentChat.includes('role'),
    interview: recentChat.includes('interview') || recentChat.includes('prepare') || recentChat.includes('practice'),
    profile: recentChat.includes('profile') || recentChat.includes('improve') || recentChat.includes('strengthen'),
    internship: recentChat.includes('internship') || recentChat.includes('placement') || recentChat.includes('opportunity'),
  }

  const prompts = []

  // First few messages - foundational questions
  if (messageCount === 0) {
    prompts.push(
      'How can I improve my internship profile?',
      'What skills should I focus on learning?',
      'Help me prepare for internship interviews'
    )
    if (hasInterests) {
      prompts.push('Suggest career paths based on my interests')
    }
  }
  // After initial questions - follow-ups based on topic
  else if (messageCount === 1) {
    if (!topics.profile) {
      prompts.push('How can I strengthen my profile?')
    }
    if (!topics.interview) {
      prompts.push('Give me interview preparation tips')
    }
    if (!topics.skills && hasSkills) {
      prompts.push('What new technical skills should I learn?')
    }
    if (!topics.internship) {
      prompts.push('What makes a strong internship application?')
    }
  }
  // Mid-conversation - deeper dives
  else if (messageCount <= 4) {
    if (topics.skills) {
      prompts.push(
        'How do I build projects to showcase my skills?',
        'What certifications would help my career?'
      )
    } else if (topics.career) {
      prompts.push(
        'What companies are hiring in my field?',
        'What growth opportunities exist in these roles?'
      )
    } else if (topics.interview) {
      prompts.push(
        'How should I answer behavioral questions?',
        'What questions should I ask interviewers?'
      )
    } else {
      prompts.push(
        'What are the current trends in tech?',
        'How can I network effectively?'
      )
    }
  }
  // Later conversations - advanced topics
  else {
    if (hasExamResults) {
      prompts.push('How can I improve my academic performance?')
    }
    if (hasInterests) {
      prompts.push('How do my interests align with market demand?')
    }
    prompts.push(
      'What next steps should I take after this internship?',
      'How do I create a 6-month learning roadmap?'
    )
  }

  // Shuffle and return top 4 unique prompts
  return [...new Set(prompts)].sort(() => Math.random() - 0.5).slice(0, 4)
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
  const [statusTag, setStatusTag] = useState('')
  const [hasStartedStreaming, setHasStartedStreaming] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [dynamicPrompts, setDynamicPrompts] = useState([])
  const chatEndRef = useRef(null)
  const chunkBufferRef = useRef('')
  const chunkAnimationFrameRef = useRef(null)
  const hasStartedStreamingRef = useRef(false)

  const flushBufferedChunk = (assistantMessageId) => {
    if (!chunkBufferRef.current) {
      return
    }

    const bufferedChunk = chunkBufferRef.current
    chunkBufferRef.current = ''

    setMessages((current) =>
      current.map((item) =>
        item.id === assistantMessageId ? { ...item, text: `${item.text}${bufferedChunk}` } : item,
      ),
    )
  }

  const queueChunkAppend = (assistantMessageId, delta) => {
    if (!delta) {
      return
    }

    chunkBufferRef.current += delta

    if (chunkAnimationFrameRef.current) {
      return
    }

    chunkAnimationFrameRef.current = window.requestAnimationFrame(() => {
      flushBufferedChunk(assistantMessageId)
      chunkAnimationFrameRef.current = null
    })
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isTyping])

  useEffect(() => {
    return () => {
      if (chunkAnimationFrameRef.current) {
        window.cancelAnimationFrame(chunkAnimationFrameRef.current)
      }
    }
  }, [])

  // Update dynamic prompts based on chat history and student context
  useEffect(() => {
    const prompts = generateDynamicPrompts(chatHistory, interests, skills, examResults)
    setDynamicPrompts(prompts)
  }, [chatHistory, interests, skills, examResults])
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

    const assistantMessageId = `assistant-stream-${Date.now()}`
    const assistantPlaceholder = {
      id: assistantMessageId,
      role: 'assistant',
      text: '',
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

    setMessages((current) => [...current, userMessage, assistantPlaceholder])
    setChatHistory((current) => [...current, text])
    setInput('')
    setIsTyping(true)
    hasStartedStreamingRef.current = false
    setHasStartedStreaming(false)
    setStatusTag('InternConnect is thinking...')
    chunkBufferRef.current = ''

    try {
      await streamAskInternConnectMessage({
        message: text,
        history,
        onStatus: (statusMessage) => {
          if (!hasStartedStreamingRef.current) {
            setStatusTag(statusMessage)
          }
        },
        onChunk: (delta) => {
          if (!delta) {
            return
          }

          hasStartedStreamingRef.current = true
          setHasStartedStreaming(true)
          setStatusTag('')
          queueChunkAppend(assistantMessageId, delta)
        },
        onDone: (payload) => {
          flushBufferedChunk(assistantMessageId)

          if (!hasStartedStreamingRef.current && payload?.reply) {
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantMessageId ? { ...item, text: payload.reply } : item,
              ),
            )
          }
        },
        onError: () => {
          flushBufferedChunk(assistantMessageId)
        },
      })
    } catch (error) {
      const fallbackText =
        error.message || 'I am unable to reach the AI service right now. Please try again in a moment.'

      setMessages((current) =>
        current.map((item) =>
          item.id === assistantMessageId
            ? {
                ...item,
                text: item.text
                  ? `${item.text}\n\n${fallbackText}`
                  : fallbackText,
              }
            : item,
        ),
      )
    } finally {
      setIsTyping(false)
      setStatusTag('')
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage(input)
  }

  const handleClearChat = () => {
    if (chunkAnimationFrameRef.current) {
      window.cancelAnimationFrame(chunkAnimationFrameRef.current)
      chunkAnimationFrameRef.current = null
    }

    chunkBufferRef.current = ''
    setMessages([buildInitialMessage(student.name)])
    setInput('')
    setIsTyping(false)
    hasStartedStreamingRef.current = false
    setStatusTag('')
    setHasStartedStreaming(false)
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
                  {message.role === 'assistant' ? (
                    <div className="text-[#1A1D27]">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: ({ ...props }) => <h2 className="mt-3 mb-2 text-base font-bold" {...props} />,
                          h3: ({ ...props }) => <h3 className="mt-3 mb-2 text-sm font-bold" {...props} />,
                          p: ({ ...props }) => <p className="my-2 text-sm leading-6" {...props} />,
                          ul: ({ ...props }) => <ul className="my-2 list-disc pl-5 text-sm leading-6" {...props} />,
                          ol: ({ ...props }) => <ol className="my-2 list-decimal pl-5 text-sm leading-6" {...props} />,
                          li: ({ ...props }) => <li className="my-1" {...props} />,
                          strong: ({ ...props }) => <strong className="font-semibold text-[#0F172A]" {...props} />,
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                  <p
                    className={`mt-2 text-[11px] font-semibold ${
                      message.role === 'assistant' ? 'text-[#8092B5]' : 'text-[#DBE8FF]'
                    }`}
                  >
                    {message.time}
                  </p>
                </article>
              ))}

              {isTyping && !hasStartedStreaming && statusTag && (
                <article className="mr-auto rounded-2xl border border-[#E8EAF0] bg-white px-4 py-3 text-sm text-[#6B7280]">
                  {statusTag}
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
                {dynamicPrompts.map((prompt) => (
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
