# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: it23569140-samarakoon-reviews-feedbacks\review-crud-operations.spec.js >> Review CRUD Operations >> should create a new internship review
- Location: tests\it23569140-samarakoon-reviews-feedbacks\review-crud-operations.spec.js:63:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByPlaceholder('e.g. WSO2, Sysco LABS')
    - waiting for" http://localhost:5173/write-review" navigation to finish...
    - navigated to "http://localhost:5173/write-review"

```

# Page snapshot

```yaml
- generic [ref=e6]:
  - banner [ref=e7]:
    - generic [ref=e8]:
      - generic [ref=e9]:
        - img [ref=e11]
        - generic [ref=e13]:
          - heading "Write Anonymous Review" [level=1] [ref=e14]
          - paragraph [ref=e15]: Share internship feedback using the same structured layout as internship posting.
      - button "Back to Reviews" [ref=e16]:
        - img [ref=e17]
        - text: Back to Reviews
  - generic [ref=e19]:
    - complementary [ref=e20]:
      - paragraph [ref=e21]: Review Setup
      - paragraph [ref=e22]: Fill out your anonymous internship review. Your identity remains protected.
      - generic [ref=e23]:
        - paragraph [ref=e24]: Current Rating
        - paragraph [ref=e25]: "--"
        - paragraph [ref=e26]: Not selected
      - generic [ref=e27]:
        - paragraph [ref=e28]: Sentiment
        - paragraph [ref=e29]: Not Selected
    - generic [ref=e31]:
      - generic [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]: Company Name
          - textbox "e.g. TechCorp Malaysia" [ref=e35]
        - generic [ref=e36]:
          - generic [ref=e37]: Role / Position
          - textbox "e.g. Software Engineering Intern" [disabled] [ref=e38]
        - generic [ref=e39]:
          - generic [ref=e40]: Overall Rating
          - generic [ref=e41]:
            - button "★ 1" [ref=e42]
            - button "★ 2" [ref=e43]
            - button "★ 3" [ref=e44]
            - button "★ 4" [ref=e45]
            - button "★ 5" [ref=e46]
        - generic [ref=e47]:
          - generic [ref=e48]:
            - generic [ref=e49]: Experience
            - generic [ref=e50]: 0/1600
          - textbox "Describe your internship experience, mentorship, work culture, and learning outcomes." [ref=e51]
      - generic [ref=e52]:
        - button "Submit Review" [ref=e53]:
          - img [ref=e54]
          - text: Submit Review
        - button "Cancel" [ref=e57]
```