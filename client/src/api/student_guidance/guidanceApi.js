import api from '../axios'

const getAuthConfig = () => {
  const token = localStorage.getItem('token')

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

// Journey API
export const fetchJourneys = async () => {
  const response = await api.get('/student-guidance/journeys', getAuthConfig())
  return response.data.data
}

export const createJourney = async (payload) => {
  const response = await api.post('/student-guidance/journeys', payload, getAuthConfig())
  return response.data.data
}

export const updateJourney = async (id, payload) => {
  const response = await api.put(`/student-guidance/journeys/${id}`, payload, getAuthConfig())
  return response.data.data
}

export const deleteJourney = async (id) => {
  const response = await api.delete(`/student-guidance/journeys/${id}`, getAuthConfig())
  return response.data
}

export const generateJourneySteps = async (payload) => {
  const response = await api.post('/student-guidance/journeys/generate-ai', payload, getAuthConfig())
  return response.data.data
}

export const toggleJourneyStep = async (payload) => {
  const response = await api.post('/student-guidance/journeys/toggle-completion', payload, getAuthConfig())
  return response.data.data
}

export const fetchStudentGuidance = async () => {
  const response = await api.get('/student-guidance', getAuthConfig())
  return response.data.data
}

export const updateStudentInterests = async (payload) => {
  const response = await api.put('/student-guidance/interests', payload, getAuthConfig())
  return response.data.data
}

export const updateStudentSkills = async (payload) => {
  const response = await api.put('/student-guidance/skills', payload, getAuthConfig())
  return response.data.data
}

export const refreshCareerSuggestions = async () => {
  const response = await api.post('/student-guidance/career-suggestions/refresh', {}, getAuthConfig())
  return response.data.data
}

export const fetchCareerAnalysis = async (careerId, options = {}) => {
  const params = options.forceRefresh ? { refresh: 'true' } : undefined

  const response = await api.get(
    `/student-guidance/career-suggestions/${encodeURIComponent(careerId)}/analysis`,
    {
      ...getAuthConfig(),
      params,
    }
  )

  return response.data.data
}

export const streamAskInternConnectMessage = async ({
  message,
  history,
  onStatus,
  onChunk,
  onDone,
  onError,
  signal,
}) => {
  const token = localStorage.getItem('token')
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

  const response = await fetch(`${baseUrl}/student-guidance/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history }),
    signal,
  })

  if (!response.ok) {
    let messageText = 'Unable to stream AI response.'

    try {
      const errorPayload = await response.json()
      messageText = errorPayload?.message || messageText
    } catch {
      // Ignore JSON parse errors and keep fallback text.
    }

    throw new Error(messageText)
  }

  if (!response.body) {
    throw new Error('Streaming is not supported by this browser.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  const parseEventBlock = (block) => {
    const lines = block.split('\n')
    let eventName = 'message'
    const dataLines = []

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim()
      }

      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim())
      }
    }

    if (!dataLines.length) {
      return null
    }

    try {
      return {
        eventName,
        payload: JSON.parse(dataLines.join('\n')),
      }
    } catch {
      return null
    }
  }

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() || ''

    for (const block of blocks) {
      const parsed = parseEventBlock(block)

      if (!parsed) {
        continue
      }

      if (parsed.eventName === 'status') {
        onStatus?.(parsed.payload?.message || '')
      }

      if (parsed.eventName === 'chunk') {
        onChunk?.(parsed.payload?.delta || '')
      }

      if (parsed.eventName === 'error') {
        const errorMessage = parsed.payload?.message || 'Stream interrupted. Please try again.'
        onError?.(new Error(errorMessage))
        throw new Error(errorMessage)
      }

      if (parsed.eventName === 'done') {
        onDone?.(parsed.payload)
        return parsed.payload
      }
    }
  }

  onDone?.({ completed: true })
  return { completed: true }
}
