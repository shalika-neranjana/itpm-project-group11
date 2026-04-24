# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: it23554290-rathnayaka-internship-opportunities\internship-opportunities.spec.js >> Company Registration & Account Management >> validates phone uniqueness during company registration
- Location: tests\it23554290-rathnayaka-internship-opportunities\internship-opportunities.spec.js:242:3

# Error details

```
Error: locator.fill: Error: strict mode violation: getByLabel('Address') resolved to 2 elements:
    1) <input value="" required="" type="text" id="address" name="address" aria-invalid="false" placeholder="123, Main Street, Colombo" class="w-full cursor-text rounded-lg border bg-white py-3 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:ring-2 px-4 border-gray-300 focus:ring-blue-500"/> aka getByRole('textbox', { name: 'Address*', exact: true })
    2) <input value="" id="email" required="" type="email" name="email" aria-invalid="false" placeholder="you@email.com" class="w-full cursor-text rounded-lg border bg-white py-3 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:ring-2 pl-10 pr-4 border-gray-300 focus:ring-blue-500"/> aka getByRole('textbox', { name: 'Email Address*' })

Call log:
  - waiting for getByLabel('Address')

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
        - heading "Create your account" [level=1] [ref=e15]
        - paragraph [ref=e16]: Join InternConnect and start your internship journey.
      - generic [ref=e17]:
        - heading "Account setup" [level=2] [ref=e19]
        - generic [ref=e20]:
          - button "Student" [ref=e21] [cursor=pointer]:
            - img [ref=e22]
            - text: Student
          - button "Company" [ref=e25] [cursor=pointer]:
            - img [ref=e26]
            - text: Company
        - generic [ref=e30]:
          - generic [ref=e31]:
            - generic [ref=e32]:
              - generic [ref=e33]: Company Name*
              - generic [ref=e34]:
                - generic:
                  - img
                - textbox "Company Name*" [active] [ref=e35]:
                  - /placeholder: TechNova Sdn Bhd
                  - text: Seylan QA Pvt Ltd
            - generic [ref=e36]:
              - generic [ref=e37]: Industry*
              - combobox "Industry*" [ref=e39] [cursor=pointer]:
                - option "Select company industry" [disabled]
                - option "Technology & IT (Software, AI, Cybersecurity, SaaS, Data, Cloud)" [selected]
                - option "Finance & Business Services (Banking, Accounting, Consulting, Insurance, Legal)"
                - option "Healthcare & Life Sciences (Hospitals, Pharma, Biotech, Medical Services)"
                - option "Education & Training (Schools, Universities, EdTech, Training Institutes)"
                - option "Manufacturing & Engineering (Factories, Industrial, Automotive, Electronics)"
                - option "Retail & E-commerce (Online Stores, Supermarkets, Wholesale)"
                - option "Media, Marketing & Communication (Advertising, Digital Marketing, PR, Entertainment)"
                - option "Transportation & Logistics (Delivery, Shipping, Travel, Supply Chain)"
                - option "Energy, Agriculture & Environment (Farming, Renewable Energy, Utilities, Sustainability)"
                - option "Hospitality, Real Estate & Other Services (Hotels, Tourism, Property, NGOs, General Services)"
            - generic [ref=e40]:
              - generic [ref=e41]: Address*
              - textbox "Address*" [ref=e43]:
                - /placeholder: 123, Main Street, Colombo
            - generic [ref=e44]:
              - generic [ref=e45]: Website*
              - textbox "Website*" [ref=e47]:
                - /placeholder: https://company.com
            - generic [ref=e48]:
              - generic [ref=e49]: Phone*
              - generic [ref=e50]:
                - generic:
                  - img
                - textbox "Phone*" [ref=e51]:
                  - /placeholder: +94 77 123 4567
            - generic [ref=e52]:
              - generic [ref=e53]: Company Logo*
              - generic [ref=e54]:
                - generic [ref=e55]:
                  - img [ref=e57]
                  - generic [ref=e61]:
                    - paragraph [ref=e62]: Upload and crop to 1:1
                    - paragraph [ref=e63]: JPG/PNG up to 5MB
                - generic [ref=e64] [cursor=pointer]:
                  - img [ref=e65]
                  - text: Choose Logo
          - generic [ref=e69]:
            - generic [ref=e70]: Email Address*
            - generic [ref=e71]:
              - generic:
                - img
              - textbox "Email Address*" [ref=e72]:
                - /placeholder: you@email.com
          - generic [ref=e73]:
            - generic [ref=e74]:
              - generic [ref=e75]: Password*
              - generic [ref=e76]:
                - generic:
                  - img
                - textbox "Password*" [ref=e77]:
                  - /placeholder: Minimum 8 characters with letters and numbers
            - generic [ref=e78]:
              - generic [ref=e79]: Confirm Password*
              - generic [ref=e80]:
                - generic:
                  - img
                - textbox "Confirm Password*" [ref=e81]:
                  - /placeholder: Repeat password
          - generic [ref=e82]:
            - paragraph [ref=e83]: Password requirements
            - list [ref=e84]:
              - listitem [ref=e85]: • At least 8 characters
              - listitem [ref=e86]: • At least 1 uppercase letter
              - listitem [ref=e87]: • At least 1 lowercase letter
              - listitem [ref=e88]: • At least 1 number
              - listitem [ref=e89]: • At least 1 special character
          - button "Create Account" [ref=e90] [cursor=pointer]:
            - text: Create Account
            - img [ref=e91]
        - paragraph [ref=e93]:
          - text: Already have an account?
          - button "Sign in" [ref=e94] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const ONE_PIXEL_PNG_BASE64 =
  4   |   'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7ZJ7sAAAAASUVORK5CYII=';
  5   | 
  6   | const makePngFile = () => ({
  7   |   name: 'logo.png',
  8   |   mimeType: 'image/png',
  9   |   buffer: Buffer.from(ONE_PIXEL_PNG_BASE64, 'base64')
  10  | });
  11  | 
  12  | const makePdfFile = () => ({
  13  |   name: 'resume.pdf',
  14  |   mimeType: 'application/pdf',
  15  |   buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF')
  16  | });
  17  | 
  18  | const buildCompanyProfile = (overrides = {}) => ({
  19  |   _id: 'company1',
  20  |   name: 'Seylan Bank',
  21  |   industry: 'Finance',
  22  |   address: 'Colombo',
  23  |   website: 'https://www.seylan.lk',
  24  |   phone: '+94 11 200 0000',
  25  |   email: 'info@seylan.lk',
  26  |   logo: '',
  27  |   featured: false,
  28  |   ...overrides
  29  | });
  30  | 
  31  | const baseInternships = [
  32  |   {
  33  |     _id: 'int1',
  34  |     title: 'Software Engineering Intern',
  35  |     specialization: 'Software Engineering',
  36  |     type: 'Hybrid',
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
> 76  |   await page.getByLabel('Address').fill('No 10, Galle Road, Colombo');
      |                                    ^ Error: locator.fill: Error: strict mode violation: getByLabel('Address') resolved to 2 elements:
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
  137 |   await page.getByLabel('Password').fill('Seylanbank@123#');
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
```