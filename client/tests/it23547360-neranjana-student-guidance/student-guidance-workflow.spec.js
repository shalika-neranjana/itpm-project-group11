import { test, expect } from '@playwright/test'

const createGuidanceState = () => ({
  examResults: [
    {
      year: 1,
      semester: 1,
      subjects: [
        { resultId: 'r1', subjectCode: 'CS101', subject: 'Programming Fundamentals', credits: 3, caPercentage: 85, grade: 'A' },
        { resultId: 'r2', subjectCode: 'MA101', subject: 'Discrete Mathematics', credits: 3, caPercentage: 72, grade: 'B+' },
      ],
    },
    {
      year: 2,
      semester: 1,
      subjects: [
        { resultId: 'r3', subjectCode: 'SE201', subject: 'Software Engineering', credits: 3, caPercentage: 78, grade: 'A-' },
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

test.describe('Student Guidance Workflow', () => {
  test.beforeEach(async ({ page }) => {
    let guidanceState = createGuidanceState()

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

      const ssePayload = [
        'event: status',
        'data: {"message":"Thinking..."}',
        '',
        'event: done',
        'data: {"reply":"Start by building one portfolio-ready project and documenting outcomes."}',
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
  })

  test('should load academic performance and apply subject search filter', async ({ page }) => {
    await page.goto('/dashboard?tab=guidance')

    await expect(page.getByRole('heading', { name: 'Academic Performance' })).toBeVisible()
    await expect(page.getByText('Programming Fundamentals')).toBeVisible()
    await expect(page.getByText('Discrete Mathematics')).toBeVisible()

    await page.fill('input[placeholder="Search subject code/name/grade..."]', 'CS101')

    await expect(page.getByText('Programming Fundamentals')).toBeVisible()
    await expect(page.getByText('Discrete Mathematics')).not.toBeVisible()
  })

  test('should add and remove an interest and update aspiration note', async ({ page }) => {
    await page.goto('/dashboard?tab=guidance')
    await page.getByRole('button', { name: 'My Interests' }).click()

    await page.getByRole('button', { name: 'Add Interest' }).click()
    await page.fill('input[placeholder="e.g., Product Design"]', 'Open Source')
    await page.selectOption('select', 'Technology')
    await page.locator('form button[type="submit"]').filter({ hasText: 'Add' }).click()

    await expect(page.getByText('Open Source')).toBeVisible()

    await page.getByRole('button', { name: 'Edit career aspiration' }).click()
    await page.fill('textarea[placeholder="I want to work on products that improve digital accessibility."]', 'I want to build accessible education tools.')
    await page.getByRole('button', { name: 'Save Note' }).click()

    await expect(page.getByText('I want to build accessible education tools.')).toBeVisible()

    const openSourceCard = page.locator('article', { hasText: 'Open Source' }).first()
    await openSourceCard.getByRole('button', { name: 'Delete interest' }).click()
    await expect(page.getByText('Open Source')).not.toBeVisible()
  })

  test('should add and edit a skill with filtering', async ({ page }) => {
    await page.goto('/dashboard?tab=guidance')
    await page.getByRole('button', { name: 'Skills' }).click()

    await page.getByRole('button', { name: 'Add Skill' }).click()
    await page.fill('input[placeholder="e.g., React"]', 'Playwright')
    await page.locator('form select').first().selectOption('Frontend')
    await page.locator('form button[type="submit"]').filter({ hasText: 'Add' }).click()

    await expect(page.getByText('Playwright')).toBeVisible()

    const playwrightCard = page.locator('article', { hasText: 'Playwright' }).first()
    await playwrightCard.getByRole('button', { name: 'Edit skill' }).click()
    await page.fill('input[placeholder="e.g., React"]', 'Playwright E2E')
    await page.getByRole('button', { name: 'Update' }).click()

    await page.fill('input[placeholder="Search skills..."]', 'Playwright E2E')
    await expect(page.getByText('Playwright E2E')).toBeVisible()
  })

  test('should refresh career suggestions and navigate to roadmap detail', async ({ page }) => {
    await page.goto('/dashboard?tab=guidance')
    await page.getByRole('button', { name: 'Career Suggestions' }).click()

    await expect(page.getByRole('heading', { name: 'Career Suggestions' })).toBeVisible()
    await page.getByRole('button', { name: 'Refresh AI Suggestions' }).click()
    await expect(page.getByText('QA Engineer')).toBeVisible()

    await page.getByRole('link', { name: 'View full AI analysis' }).first().click()

    await expect(page).toHaveURL(/\/student-guidance\/career\//)
    await expect(page.getByText('AI Career Guide')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Comprehensive AI Analysis' })).toBeVisible()

    await page.getByRole('button', { name: 'Back to Suggestions' }).first().click()
    await expect(page).toHaveURL(/\/dashboard\?tab=guidance/)
  })

  test('should send a message in Ask InternConnect and receive streamed reply', async ({ page }) => {
    await page.goto('/dashboard?tab=guidance')
    await page.getByRole('button', { name: 'Ask InternConnect' }).click()

    await page.fill('textarea[placeholder="Ask about profile improvements, internship readiness, or career direction..."]', 'How can I improve my internship profile?')
    await page.getByRole('button', { name: 'Send' }).click()

    await expect(page.getByText('How can I improve my internship profile?')).toBeVisible()
    await expect.poll(async () => page.locator('article').count()).toBeGreaterThan(2)
  })
})
