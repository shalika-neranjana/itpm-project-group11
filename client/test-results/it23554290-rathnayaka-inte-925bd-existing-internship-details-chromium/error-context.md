# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: it23554290-rathnayaka-internship-opportunities\internship-opportunities.spec.js >> Internship Management (Company) >> edits existing internship details
- Location: tests\it23554290-rathnayaka-internship-opportunities\internship-opportunities.spec.js:395:3

# Error details

```
Error: locator.fill: Error: strict mode violation: getByLabel('Password') resolved to 2 elements:
    1) <input value="" required="" id="password" type="password" name="password" aria-invalid="false" autocomplete="current-password" placeholder="Enter your password" class="w-full rounded-lg border bg-white py-3 pl-10 pr-11 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 border-gray-300 focus:border-blue-500"/> aka getByRole('textbox', { name: 'Password' })
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
                - text: info@seylan.lk
          - generic [ref=e25]:
            - generic [ref=e26]: Password
            - generic [ref=e27]:
              - generic:
                - img
              - textbox "Password" [ref=e28]:
                - /placeholder: Enter your password
              - button "Show password" [ref=e30]:
                - img [ref=e31]
          - button "Sign In" [ref=e34] [cursor=pointer]:
            - text: Sign In
            - img [ref=e35]
        - paragraph [ref=e37]:
          - text: Don't have an account?
          - button "Create account" [ref=e38] [cursor=pointer]: Create account
```

# Test source

```ts
  37  |     duration: '6 months',
  38  |     location: 'Colombo',
  39  |     stipend: 'LKR 45,000',
  40  |     deadline: '2026-12-31T00:00:00.000Z',
  41  |     slots: 2,
  42  |     applications: [
  43  |       {
  44  |         _id: 'app1',
  45  |         name: 'Gayantha Perera',
  46  |         email: 'gayantha@outlook.com',
  47  |         phone: '+94 77 111 1111',
  48  |         coverLetter: 'I am interested in this role.',
  49  |         status: 'Pending',
  50  |         resume: ''
  51  |       },
  52  |       {
  53  |         _id: 'app2',
  54  |         name: 'Nimal Silva',
  55  |         email: 'nimal@example.com',
  56  |         phone: '+94 77 222 2222',
  57  |         coverLetter: 'Please consider my application.',
  58  |         status: 'Pending',
  59  |         resume: ''
  60  |       }
  61  |     ]
  62  |   }
  63  | ];
  64  | 
  65  | async function fillCompanyRegistrationForm(page, {
  66  |   email,
  67  |   phone,
  68  |   password,
  69  |   confirmPassword = password,
  70  |   companyName = 'Seylan QA Pvt Ltd'
  71  | }) {
  72  |   await page.getByRole('button', { name: 'Company' }).click();
  73  | 
  74  |   await page.getByLabel('Company Name').fill(companyName);
  75  |   await page.getByLabel('Industry').selectOption('Technology & IT');
  76  |   await page.getByLabel('Address').fill('No 10, Galle Road, Colombo');
  77  |   await page.getByLabel('Website').fill('https://qa.seylan.lk');
  78  |   await page.getByLabel('Phone').fill(phone);
  79  | 
  80  |   await page.locator('#companyLogo').setInputFiles(makePngFile());
  81  |   await expect(page.getByRole('button', { name: 'Use Cropped Image' })).toBeVisible();
  82  |   await page.getByRole('button', { name: 'Use Cropped Image' }).click();
  83  | 
  84  |   await page.getByLabel('Email Address').fill(email);
  85  |   await page.getByLabel('Password').fill(password);
  86  |   await page.getByLabel('Confirm Password').fill(confirmPassword);
  87  | }
  88  | 
  89  | async function loginAsCompany(page, { internships = baseInternships, profile = buildCompanyProfile() } = {}) {
  90  |   await page.route('**/api/company/login', async (route) => {
  91  |     if (route.request().method() === 'POST') {
  92  |       await route.fulfill({
  93  |         status: 200,
  94  |         contentType: 'application/json',
  95  |         body: JSON.stringify({
  96  |           success: true,
  97  |           data: {
  98  |             token: 'company-token',
  99  |             ...profile
  100 |           }
  101 |         })
  102 |       });
  103 |       return;
  104 |     }
  105 | 
  106 |     await route.continue();
  107 |   });
  108 | 
  109 |   await page.route('**/api/company/profile', async (route) => {
  110 |     if (route.request().method() === 'GET') {
  111 |       await route.fulfill({
  112 |         status: 200,
  113 |         contentType: 'application/json',
  114 |         body: JSON.stringify({ success: true, data: profile })
  115 |       });
  116 |       return;
  117 |     }
  118 | 
  119 |     await route.continue();
  120 |   });
  121 | 
  122 |   await page.route('**/api/internships/company/my', async (route) => {
  123 |     if (route.request().method() === 'GET') {
  124 |       await route.fulfill({
  125 |         status: 200,
  126 |         contentType: 'application/json',
  127 |         body: JSON.stringify({ success: true, data: internships })
  128 |       });
  129 |       return;
  130 |     }
  131 | 
  132 |     await route.continue();
  133 |   });
  134 | 
  135 |   await page.goto('/login');
  136 |   await page.getByLabel('Email Address').fill('info@seylan.lk');
> 137 |   await page.getByLabel('Password').fill('Seylanbank@123#');
      |                                     ^ Error: locator.fill: Error: strict mode violation: getByLabel('Password') resolved to 2 elements:
  138 |   await page.getByRole('button', { name: 'Sign In' }).click();
  139 |   await page.waitForURL('**/company-dashboard');
  140 | }
  141 | 
  142 | async function loginAsStudent(page) {
  143 |   await page.route('**/api/auth/login', async (route) => {
  144 |     if (route.request().method() === 'POST') {
  145 |       await route.fulfill({
  146 |         status: 200,
  147 |         contentType: 'application/json',
  148 |         body: JSON.stringify({
  149 |           success: true,
  150 |           data: {
  151 |             token: 'student-token',
  152 |             studentId: 'IT23554290',
  153 |             firstName: 'Gayantha',
  154 |             lastName: 'Perera',
  155 |             email: 'gayantha@outlook.com',
  156 |             phone: '+94 77 111 1111'
  157 |           }
  158 |         })
  159 |       });
  160 |       return;
  161 |     }
  162 | 
  163 |     await route.continue();
  164 |   });
  165 | 
  166 |   await page.goto('/login');
  167 |   await page.getByLabel('Email Address').fill('gayantha@outlook.com');
  168 |   await page.getByLabel('Password').fill('Gayantha123#');
  169 |   await page.getByRole('button', { name: 'Sign In' }).click();
  170 |   await page.waitForURL('**/dashboard');
  171 | }
  172 | 
  173 | test.describe('Company Registration & Account Management', () => {
  174 |   test('registers company when all required fields are completed', async ({ page }) => {
  175 |     await page.route('**/api/company/register', async (route) => {
  176 |       if (route.request().method() === 'POST') {
  177 |         await route.fulfill({
  178 |           status: 201,
  179 |           contentType: 'application/json',
  180 |           body: JSON.stringify({
  181 |             success: true,
  182 |             data: {
  183 |               token: 'company-token',
  184 |               ...buildCompanyProfile()
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
```