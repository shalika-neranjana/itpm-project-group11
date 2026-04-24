import { test, expect } from '@playwright/test';

test.describe('My Tasks Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login by setting token in localStorage
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-token');
      window.localStorage.setItem('student', JSON.stringify({
        studentId: 'ST123',
        firstName: 'Test',
        lastName: 'Student'
      }));
    });

    // Mock internships list
    await page.route('**/api/my-internships/student/ST123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { 
            _id: 'int123', 
            title: 'Test Internship', 
            specialization: 'Software Engineering',
            studentName: 'Test Student',
            status: 'ongoing',
            startDate: '2023-01-01',
            duration: 6
          }
        ])
      });
    });

    // Mock tasks
    await page.route('**/api/tasks/internship/int123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            _id: 'task1',
            taskName: 'Initial Task',
            priority: 'Medium',
            dueDate: '2023-10-30T00:00:00.000Z',
            completed: false,
            internship: 'int123'
          }
        ])
      });
    });

    await page.goto('/dashboard?tab=myInternships');
    await page.click('text=Open Dashboard');
    await page.click('button:has-text("My Tasks")');
  });

  test('should display existing tasks', async ({ page }) => {
    await expect(page.locator('h3:has-text("My Tasks")')).toBeVisible();
    await expect(page.getByTestId('task-item-task1')).toBeVisible();
    await expect(page.locator('span:has-text("Initial Task")')).toBeVisible();
  });

  test('should add a new task', async ({ page }) => {
    await page.route('**/api/tasks', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            _id: 'task2',
            taskName: 'New Task',
            priority: 'High',
            dueDate: '2023-11-01T00:00:00.000Z',
            completed: false,
            internship: 'int123'
          })
        });
      }
    });

    await page.getByTestId('add-task-btn').click();
    await page.getByTestId('task-name-input').fill('New Task');
    await page.getByTestId('task-priority-select').selectOption('High');
    await page.getByTestId('task-due-date-input').fill('2023-11-01');
    
    await page.getByTestId('task-save-btn').click();

    await expect(page.locator('text=Task Added!')).toBeVisible();
    await page.click('button:has-text("OK")');

    await expect(page.getByTestId('task-item-task2')).toBeVisible();
    await expect(page.locator('span:has-text("New Task")')).toBeVisible();
  });

  test('should edit an existing task', async ({ page }) => {
    await page.route('**/api/tasks/task1', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            _id: 'task1',
            taskName: 'Updated Task',
            priority: 'Low',
            dueDate: '2023-10-30T00:00:00.000Z',
            completed: false,
            internship: 'int123'
          })
        });
      }
    });

    await page.getByTestId('task-edit-btn-task1').click();
    await page.getByTestId('task-name-input').fill('Updated Task');
    await page.getByTestId('task-priority-select').selectOption('Low');
    await page.getByTestId('task-save-btn').click();

    await expect(page.locator('text=Task Updated!')).toBeVisible();
    await page.click('button:has-text("OK")');
    await expect(page.locator('span:has-text("Updated Task")')).toBeVisible();
  });

  test('should toggle task completion', async ({ page }) => {
    await page.route('**/api/tasks/task1', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            _id: 'task1',
            taskName: 'Initial Task',
            priority: 'Medium',
            dueDate: '2023-10-30T00:00:00.000Z',
            completed: true,
            internship: 'int123'
          })
        });
      }
    });

    await page.getByTestId('task-complete-btn-task1').click();
    await expect(page.locator('text=Task Completed!')).toBeVisible();
    await page.click('button:has-text("OK")');
    
    // Check for line-through or color change indicating completion
    const taskTitle = page.locator('span:has-text("Initial Task")');
    await expect(taskTitle).toHaveClass(/line-through/);
  });

  test('should delete a task', async ({ page }) => {
    await page.route('**/api/tasks/task1', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ 
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Deleted' })
        });
      }
    });

    await page.getByTestId('task-delete-btn-task1').click();
    await page.click('button:has-text("Yes, delete")');

    await expect(page.locator('text=Deleted!')).toBeVisible();
    await page.click('button:has-text("OK")');
    await expect(page.getByTestId('task-item-task1')).not.toBeVisible();
  });

  test('should filter tasks by priority', async ({ page }) => {
    // Add another task with different priority
    await page.route('**/api/tasks/internship/int123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            _id: 'task1',
            taskName: 'Medium Task',
            priority: 'Medium',
            dueDate: '2023-10-30T00:00:00.000Z',
            completed: false,
            internship: 'int123'
          },
          {
            _id: 'task2',
            taskName: 'High Task',
            priority: 'High',
            dueDate: '2023-10-31T00:00:00.000Z',
            completed: false,
            internship: 'int123'
          }
        ])
      });
    });
    
    // Re-navigate to pick up new mock data
    await page.goto('/dashboard?tab=myInternships');
    await page.click('text=Open Dashboard');
    await page.click('button:has-text("My Tasks")');

    await page.getByTestId('tasks-filter-toggle').click();
    await page.getByTestId('filter-priority-High').click();

    await expect(page.locator('span:has-text("High Task")')).toBeVisible();
    await expect(page.locator('span:has-text("Medium Task")')).not.toBeVisible();

    await page.getByTestId('clear-filters-btn').click();
    await expect(page.locator('span:has-text("Medium Task")')).toBeVisible();
  });
});
