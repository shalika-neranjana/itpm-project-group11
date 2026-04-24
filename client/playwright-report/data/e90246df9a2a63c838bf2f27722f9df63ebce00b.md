# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: it23554290-rathnayaka-internship-opportunities\internship-opportunities.spec.js >> Company Registration & Account Management >> validates email and password inputs on login
- Location: tests\it23554290-rathnayaka-internship-opportunities\internship-opportunities.spec.js:277:3

# Error details

```
Error: locator.fill: Error: strict mode violation: getByLabel('Password') resolved to 2 elements:
    1) <input value="" required="" id="password" type="password" name="password" aria-invalid="true" autocomplete="current-password" placeholder="Enter your password" aria-describedby="password-error" class="w-full rounded-lg border bg-white py-3 pl-10 pr-11 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 border-red-300 focus:border-red-400 focus:ring-red-500/30"/> aka getByRole('textbox', { name: 'Password' })
    2) <button type="button" aria-label="Show password" class="rounded p-1 text-gray-500 transition-all duration-300 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60">…</button> aka getByRole('button', { name: 'Show password' })

Call log:
  - waiting for getByLabel('Password')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - banner [ref=e5]:
    - generic [ref=e6]:
      - link "InternConnect logo InternConnect" [ref=e7] [cursor=pointer]:
        - /url: /
        - img "InternConnect logo" [ref=e8]
        - generic [ref=e9]: InternConnect
      - link "Back to Home" [ref=e10] [cursor=pointer]:
        - /url: /
  - main [ref=e11]:
    - generic [ref=e12]:
      - generic [ref=e13]:
        - img "InternConnect logo mark" [ref=e14]
        - heading "Welcome back" [level=1] [ref=e15]
        - paragraph [ref=e16]: Sign in to continue managing your internship workflow.
      - generic [ref=e17]:
        - heading "Login" [level=2] [ref=e19]
        - generic [ref=e20]:
          - generic [ref=e21]:
            - generic [ref=e22]: Email Address
            - generic [ref=e23]:
              - generic:
                - img
              - textbox "Email Address" [active] [ref=e24]:
                - /placeholder: name@organization.com
                - text: invalid-email
          - generic [ref=e25]:
            - generic [ref=e26]: Password
            - generic [ref=e27]:
              - generic:
                - img
              - textbox "Password" [ref=e28]:
                - /placeholder: Enter your password
              - button "Show password" [ref=e30]:
                - img [ref=e31]
            - paragraph [ref=e34]: Password is required.
          - button "Sign In" [ref=e35] [cursor=pointer]:
            - text: Sign In
            - img [ref=e36]
        - paragraph [ref=e38]:
          - text: Don't have an account?
          - button "Create account" [ref=e39] [cursor=pointer]: Create account
```

# Test source

```ts
  185 |             }
  186 |           })
  187 |         });
  188 |         return;
  189 |       }
  190 | 
  191 |       await route.continue();
  192 |     });
  193 | 
  194 |     await page.route('**/api/company/profile', async (route) => {
  195 |       await route.fulfill({
  196 |         status: 200,
  197 |         contentType: 'application/json',
  198 |         body: JSON.stringify({ success: true, data: buildCompanyProfile() })
  199 |       });
  200 |     });
  201 | 
  202 |     await page.route('**/api/internships/company/my', async (route) => {
  203 |       await route.fulfill({
  204 |         status: 200,
  205 |         contentType: 'application/json',
  206 |         body: JSON.stringify({ success: true, data: [] })
  207 |       });
  208 |     });
  209 | 
  210 |     await page.goto('/register');
  211 | 
  212 |     await fillCompanyRegistrationForm(page, {
  213 |       email: 'new-company@seylan.lk',
  214 |       phone: '+94 77 333 3333',
  215 |       password: 'SeylanQa@123'
  216 |     });
  217 | 
  218 |     await page.getByRole('button', { name: 'Create Account' }).click();
  219 |     await page.waitForURL('**/company-dashboard');
  220 |   });
  221 | 
  222 |   test('validates email uniqueness during company registration', async ({ page }) => {
  223 |     await page.route('**/api/company/register', async (route) => {
  224 |       await route.fulfill({
  225 |         status: 409,
  226 |         contentType: 'application/json',
  227 |         body: JSON.stringify({ message: 'Email already exists' })
  228 |       });
  229 |     });
  230 | 
  231 |     await page.goto('/register');
  232 |     await fillCompanyRegistrationForm(page, {
  233 |       email: 'info@seylan.lk',
  234 |       phone: '+94 77 444 4444',
  235 |       password: 'SeylanQa@123'
  236 |     });
  237 | 
  238 |     await page.getByRole('button', { name: 'Create Account' }).click();
  239 |     await expect(page.getByText('Email already exists')).toBeVisible();
  240 |   });
  241 | 
  242 |   test('validates phone uniqueness during company registration', async ({ page }) => {
  243 |     await page.route('**/api/company/register', async (route) => {
  244 |       await route.fulfill({
  245 |         status: 409,
  246 |         contentType: 'application/json',
  247 |         body: JSON.stringify({ message: 'Phone number already exists' })
  248 |       });
  249 |     });
  250 | 
  251 |     await page.goto('/register');
  252 |     await fillCompanyRegistrationForm(page, {
  253 |       email: 'qa+phone@seylan.lk',
  254 |       phone: '+94 11 200 0000',
  255 |       password: 'SeylanQa@123'
  256 |     });
  257 | 
  258 |     await page.getByRole('button', { name: 'Create Account' }).click();
  259 |     await expect(page.getByText('Phone number already exists')).toBeVisible();
  260 |   });
  261 | 
  262 |   test('enforces password validation rules', async ({ page }) => {
  263 |     await page.goto('/register');
  264 | 
  265 |     await fillCompanyRegistrationForm(page, {
  266 |       email: 'weak-password@seylan.lk',
  267 |       phone: '+94 77 555 5555',
  268 |       password: 'weakpass'
  269 |     });
  270 | 
  271 |     await page.getByRole('button', { name: 'Create Account' }).click();
  272 |     await expect(
  273 |       page.getByText('Password must include uppercase, lowercase, number, special character, and be at least 8 characters.')
  274 |     ).toBeVisible();
  275 |   });
  276 | 
  277 |   test('validates email and password inputs on login', async ({ page }) => {
  278 |     await page.goto('/login');
  279 | 
  280 |     await page.getByRole('button', { name: 'Sign In' }).click();
  281 |     await expect(page.getByText('Email is required.')).toBeVisible();
  282 |     await expect(page.getByText('Password is required.')).toBeVisible();
  283 | 
  284 |     await page.getByLabel('Email Address').fill('invalid-email');
> 285 |     await page.getByLabel('Password').fill('SomePassword@123');
      |                                       ^ Error: locator.fill: Error: strict mode violation: getByLabel('Password') resolved to 2 elements:
  286 |     await page.getByRole('button', { name: 'Sign In' }).click();
  287 | 
  288 |     await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  289 |   });
  290 | 
  291 |   test('edits and updates company profile details', async ({ page }) => {
  292 |     const updatedProfile = buildCompanyProfile({
  293 |       name: 'Seylan Bank PLC',
  294 |       phone: '+94 77 999 9999',
  295 |       website: 'https://careers.seylan.lk'
  296 |     });
  297 | 
  298 |     await loginAsCompany(page, {
  299 |       internships: [],
  300 |       profile: buildCompanyProfile()
  301 |     });
  302 | 
  303 |     await page.route('**/api/company/profile', async (route) => {
  304 |       if (route.request().method() === 'PUT') {
  305 |         await route.fulfill({
  306 |           status: 200,
  307 |           contentType: 'application/json',
  308 |           body: JSON.stringify({ success: true, data: updatedProfile })
  309 |         });
  310 |         return;
  311 |       }
  312 | 
  313 |       await route.continue();
  314 |     });
  315 | 
  316 |     await page.getByRole('button', { name: 'Company Profile' }).click();
  317 |     await page.getByRole('button', { name: 'Edit Profile' }).click();
  318 | 
  319 |     await page.locator('input[name="name"]').fill('Seylan Bank PLC');
  320 |     await page.locator('input[name="phone"]').fill('+94 77 999 9999');
  321 |     await page.locator('input[name="website"]').fill('https://careers.seylan.lk');
  322 | 
  323 |     await page.getByRole('button', { name: 'Save Changes' }).click();
  324 |     await expect(page.getByText('Seylan Bank PLC')).toBeVisible();
  325 |   });
  326 | });
  327 | 
  328 | test.describe('Internship Management (Company)', () => {
  329 |   test.beforeEach(async ({ page }) => {
  330 |     await loginAsCompany(page);
  331 |   });
  332 | 
  333 |   test('creates a new internship', async ({ page }) => {
  334 |     let internships = [...baseInternships];
  335 | 
  336 |     await page.route('**/api/internships/company/my', async (route) => {
  337 |       if (route.request().method() === 'GET') {
  338 |         await route.fulfill({
  339 |           status: 200,
  340 |           contentType: 'application/json',
  341 |           body: JSON.stringify({ success: true, data: internships })
  342 |         });
  343 |         return;
  344 |       }
  345 | 
  346 |       await route.continue();
  347 |     });
  348 | 
  349 |     await page.route('**/api/internships', async (route) => {
  350 |       if (route.request().method() === 'POST') {
  351 |         const newInternship = {
  352 |           _id: 'int2',
  353 |           title: 'QA Automation Intern',
  354 |           specialization: 'Software Engineering',
  355 |           type: 'Remote',
  356 |           duration: '6',
  357 |           location: 'Remote',
  358 |           stipend: 'LKR 50,000',
  359 |           deadline: '2026-12-25',
  360 |           slots: 2,
  361 |           applications: []
  362 |         };
  363 | 
  364 |         internships = [newInternship, ...internships];
  365 | 
  366 |         await route.fulfill({
  367 |           status: 201,
  368 |           contentType: 'application/json',
  369 |           body: JSON.stringify({ success: true, data: newInternship })
  370 |         });
  371 |         return;
  372 |       }
  373 | 
  374 |       await route.continue();
  375 |     });
  376 | 
  377 |     await page.getByRole('button', { name: 'Post New Internship' }).click();
  378 |     await expect(page).toHaveURL(/\/company-dashboard\/post-internship/);
  379 | 
  380 |     await page.getByLabel('Internship Title').fill('QA Automation Intern');
  381 |     await page.getByLabel('Specialization').selectOption('Software Engineering');
  382 |     await page.getByLabel('Type').selectOption('Remote');
  383 |     await page.getByLabel('Duration (months)').fill('6');
  384 |     await page.getByLabel('Location').fill('Remote');
  385 |     await page.getByLabel('Stipend').fill('50000');
```