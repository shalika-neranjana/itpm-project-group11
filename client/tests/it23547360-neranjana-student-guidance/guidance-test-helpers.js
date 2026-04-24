export const createDefaultGuidanceState = () => ({
  examResults: [
    {
      year: 1,
      semester: 1,
      subjects: [
        {
          resultId: 'r1',
          subjectCode: 'CS101',
          subject: 'Programming Fundamentals',
          credits: 3,
          caPercentage: 85,
          grade: 'A',
        },
        {
          resultId: 'r2',
          subjectCode: 'MA101',
          subject: 'Discrete Mathematics',
          credits: 3,
          caPercentage: 72,
          grade: 'B+',
        },
      ],
    },
    {
      year: 2,
      semester: 1,
      subjects: [
        {
          resultId: 'r3',
          subjectCode: 'SE201',
          subject: 'Software Engineering',
          credits: 3,
          caPercentage: 78,
          grade: 'A-',
        },
      ],
    },
  ],
  interests: [
    { name: 'Web Development', category: 'Technology' },
    { name: 'Data Analytics', category: 'Analytics' },
  ],
  skills: [
    { name: 'React', category: 'Frontend', level: 'Intermediate' },
    { name: 'Node.js', category: 'Backend', level: 'Beginner' },
  ],
  aspirations: 'I want to become a full-stack engineer working on impactful products.',
  careerSuggestions: [
    {
      id: 'software-engineer',
      title: 'Software Engineer',
      matchScore: 88,
      summary: 'Build and deliver scalable web applications.',
      matchedAreas: ['React', 'Problem Solving'],
      nextStep: 'Build and publish two production-ready portfolio projects.',
    },
    {
      id: 'data-analyst',
      title: 'Data Analyst',
      matchScore: 67,
      summary: 'Analyze datasets and communicate insights.',
      matchedAreas: ['Analytics', 'Communication'],
      nextStep: 'Learn SQL dashboards and complete one analytics case study.',
    },
  ],
})

const createAnalysis = (careerId) => {
  const title = careerId === 'data-analyst' ? 'Data Analyst' : 'Software Engineer'

  return {
    id: careerId,
    title,
    summary: `AI guidance summary for ${title}.`,
    matchScore: careerId === 'data-analyst' ? 67 : 88,
    matchedAreas: ['Problem Solving', 'Communication'],
    comprehensiveDescription: `${title} is a strong trajectory based on your current profile signals.`,
    strengthsToLeverage: ['Consistency', 'Rapid learning'],
    skillGaps: ['System design', 'Testing depth'],
    roadmap: [
      {
        phase: 'Phase 1',
        timeline: '0-2 months',
        objective: 'Strengthen foundations and complete guided exercises.',
        actions: ['Complete 2 mini projects', 'Practice algorithmic thinking'],
        milestone: 'Portfolio baseline ready',
      },
    ],
    guidelines: ['Keep a weekly learning schedule', 'Get mentor feedback bi-weekly'],
    nextStep: 'Start with a project that demonstrates core practical skills.',
    confidenceNote: 'This recommendation is generated from your current profile and may evolve.',
  }
}

export const setupGuidanceMocks = async (
  page,
  { initialState = null, chatMode = 'success', chatReply = 'Start by building one portfolio-ready project and documenting outcomes.' } = {}
) => {
  let guidanceState = initialState ? structuredClone(initialState) : createDefaultGuidanceState()

  await page.addInitScript(() => {
    window.localStorage.setItem('token', 'student-token')
    window.localStorage.setItem('role', 'student')
    window.localStorage.setItem(
      'student',
      JSON.stringify({
        studentId: 'IT23547360',
        firstName: 'Neranjana',
        lastName: 'Silva',
        email: 'neranjana@example.com',
      })
    )
  })

  await page.route('**/api/students/notifications', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    })
  })

  await page.route('**/api/student-guidance', async (route) => {
    if (route.request().method() !== 'GET') {
      return route.continue()
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: guidanceState }),
    })
  })

  await page.route('**/api/student-guidance/interests', async (route) => {
    if (route.request().method() !== 'PUT') {
      return route.continue()
    }

    const payload = route.request().postDataJSON()
    guidanceState = {
      ...guidanceState,
      interests: Array.isArray(payload?.interests) ? payload.interests : guidanceState.interests,
      aspirations: typeof payload?.aspirations === 'string' ? payload.aspirations : guidanceState.aspirations,
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: guidanceState }),
    })
  })

  await page.route('**/api/student-guidance/skills', async (route) => {
    if (route.request().method() !== 'PUT') {
      return route.continue()
    }

    const payload = route.request().postDataJSON()
    guidanceState = {
      ...guidanceState,
      skills: Array.isArray(payload?.skills) ? payload.skills : guidanceState.skills,
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: guidanceState }),
    })
  })

  await page.route('**/api/student-guidance/career-suggestions/refresh', async (route) => {
    if (route.request().method() !== 'POST') {
      return route.continue()
    }

    guidanceState = {
      ...guidanceState,
      careerSuggestions: [
        ...guidanceState.careerSuggestions,
        {
          id: 'qa-engineer',
          title: 'QA Engineer',
          matchScore: 74,
          summary: 'Ensure software quality through testing strategies.',
          matchedAreas: ['Testing', 'Detail orientation'],
          nextStep: 'Create end-to-end tests for a portfolio app.',
        },
      ],
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: guidanceState }),
    })
  })

  await page.route('**/api/student-guidance/career-suggestions/**/analysis*', async (route) => {
    const pathPart = route.request().url().split('/career-suggestions/')[1] || ''
    const encodedId = pathPart.split('/analysis')[0] || 'software-engineer'
    const careerId = decodeURIComponent(encodedId)

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: createAnalysis(careerId) }),
    })
  })

  await page.route('**/api/student-guidance/chat', async (route) => {
    if (route.request().method() !== 'POST') {
      return route.continue()
    }

    if (chatMode === 'error') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unable to stream AI response.' }),
      })
      return
    }

    const ssePayload = [
      'event: status',
      'data: {"message":"Thinking..."}',
      '',
      'event: done',
      `data: ${JSON.stringify({ reply: chatReply })}`,
      '',
    ].join('\n')

    await route.fulfill({
      status: 200,
      headers: {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
      },
      body: ssePayload,
    })
  })
}
