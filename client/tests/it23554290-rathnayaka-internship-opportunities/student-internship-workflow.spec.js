import { test, expect } from '@playwright/test'

test.describe('Student Internship Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'student-token')
      window.localStorage.setItem('role', 'student')
      window.localStorage.setItem(
        'student',
        JSON.stringify({
          firstName: 'Gayantha',
          email: 'gayantha@outlook.com'
        })
      )
    })
  })

  test('should view available internship listings and search internships using search bar', async ({ page }) => {
    await page.route('**/api/internships*', async (route) => {
      const url = new URL(route.request().url())
      const search = url.searchParams.get('search')
      
      const allInternships = [
        { _id: 'int-1', title: 'Software Engineer Intern', company: { name: 'Seylan Bank PLC' }, specialization: 'Computer Science', type: 'On-site', duration: '6 months', location: 'Colombo' },
        { _id: 'int-2', title: 'QA Intern', company: { name: 'WSO2' }, specialization: 'Software Engineering', type: 'Remote', duration: '3 months', location: 'Remote' }
      ]

      let filtered = allInternships
      if (search) {
        filtered = allInternships.filter(i => i.title.includes(search))
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: filtered })
      })
    })

    await page.goto('/marketplace')
    
    await expect(page.getByText('Software Engineer Intern')).toBeVisible()
    await expect(page.getByText('QA Intern')).toBeVisible()

    await page.fill('input[placeholder="Search internships..."]', 'Software Engineer')
    
    await expect(page.getByText('Software Engineer Intern')).toBeVisible()
    await expect(page.getByText('QA Intern')).not.toBeVisible()
  })

  test('should apply filters to refine results', async ({ page }) => {
    await page.route('**/api/internships*', async (route) => {
      const url = new URL(route.request().url())
      const specialization = url.searchParams.get('specialization')
      
      const allInternships = [
        { _id: 'int-1', title: 'Software Engineer Intern', company: { name: 'Seylan Bank PLC' }, specialization: 'Computer Science', type: 'On-site', duration: '6 months', location: 'Colombo' },
        { _id: 'int-2', title: 'Data Analyst Intern', company: { name: 'Dialog' }, specialization: 'Data Science', type: 'Hybrid', duration: '6 months', location: 'Colombo' }
      ]

      let filtered = allInternships
      if (specialization) {
        filtered = allInternships.filter(i => i.specialization === specialization)
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: filtered })
      })
    })

    await page.goto('/marketplace')
    await expect(page.getByText('Software Engineer Intern')).toBeVisible()
    await expect(page.getByText('Data Analyst Intern')).toBeVisible()

    await page.selectOption('select', { label: 'Data Science' })
    
    await expect(page.getByText('Data Analyst Intern')).toBeVisible()
    await expect(page.getByText('Software Engineer Intern')).not.toBeVisible()
  })

  test('should apply for an internship', async ({ page }) => {
    await page.route('**/api/internships/int-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { _id: 'int-1', title: 'Software Engineer Intern', company: { name: 'Seylan Bank PLC' }, description: 'Great role' }
        })
      })
    })

    await page.route('**/api/student/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { firstName: 'Gayantha', lastName: 'Perera', email: 'gayantha@outlook.com', phone: '+94771234567' }
        })
      })
    })

    await page.route('**/api/internships/int-1/apply', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Application submitted successfully' })
        })
      }
    })

    await page.goto('/apply/int-1')

    await page.fill('textarea[name="coverLetter"]', 'I am very interested in this role.')
    
    // Upload a mock resume
    const tinyPdf = Buffer.from('JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSPj4Kc3RyZWFtCgplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjAKZW5kb2JqCgoxIDAgb2JqCjw8L1R5cGUgL1BhZ2UKL1BhcmVudCA0IDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgMiAwIFIKPj4KZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUgL1BhZ2VzCi9LaWRzIFsxIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCgo1IDAgb2JqCjw8L1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDQgMCBSCj4+CmVuZG9iagoKNiAwIG9iago8PC9Qcm9kdWNlciAoU2thbWEpCj4+CmVuZG9iagoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDU0IDAwMDAwIG4gCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDAzNiAwMDAwMCBuIAowMDAwMDAwMTUxIDAwMDAwIG4gCjAwMDAwMDAyMDggMDAwMDAgbiAKMDAwMDAwMDI1NyAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNgovUm9vdCA1IDAgUgovSW5mbyA2IDAgUgo+PgpzdGFydHhyZWYKMjkyCiUlRU9GCg==', 'base64')
    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'resume.pdf',
      mimeType: 'application/pdf',
      buffer: tinyPdf
    })

    await page.getByRole('button', { name: 'Submit Application' }).click()

    await expect(page.getByText('Application submitted successfully!')).toBeVisible()
  })
})
