# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: it23569140-samarakoon-reviews-feedbacks\review-forum-filtering.spec.js >> Review Forum Filtering >> should filter reviews by rating
- Location: tests\it23569140-samarakoon-reviews-feedbacks\review-forum-filtering.spec.js:75:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByText('5 ★ & up')
    - waiting for" http://localhost:5173/dashboard?tab=reviews" navigation to finish...
    - navigated to "http://localhost:5173/dashboard?tab=reviews"

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - banner [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - img "InternConnect logo" [ref=e8]
        - generic [ref=e9]: InternConnect
      - navigation [ref=e10]:
        - button "Internship Opportunities" [ref=e11] [cursor=pointer]:
          - img [ref=e13]
          - generic [ref=e16]: Internship Opportunities
        - button "My Internships" [ref=e17] [cursor=pointer]:
          - img [ref=e19]
          - generic [ref=e22]: My Internships
        - button "Student Guidance" [ref=e23] [cursor=pointer]:
          - img [ref=e25]
          - generic [ref=e28]: Student Guidance
        - button "Reviews & Feedbacks" [ref=e29] [cursor=pointer]:
          - img [ref=e31]
          - generic [ref=e33]: Reviews & Feedbacks
      - generic [ref=e34]:
        - button "Notifications" [ref=e35]:
          - img [ref=e36]
        - generic [ref=e40]:
          - button "GP" [ref=e41]
          - button "User menu" [ref=e42]:
            - img [ref=e43]
  - main [ref=e45]:
    - generic:
      - heading [level=1]
    - generic [ref=e46]:
      - generic [ref=e47]:
        - heading "Community Reviews" [level=2] [ref=e48]:
          - img [ref=e49]
          - text: Community Reviews
        - generic [ref=e51]:
          - generic [ref=e52]:
            - img [ref=e53]
            - textbox "Search companies, roles..." [ref=e56]
          - button "Write Review" [ref=e57]:
            - img [ref=e58]
            - generic [ref=e63]: Write Review
      - generic [ref=e64]:
        - generic [ref=e65]:
          - generic [ref=e66]:
            - heading "Filters" [level=3] [ref=e67]:
              - img [ref=e68]
              - text: Filters
            - generic [ref=e70]:
              - heading "Rating" [level=4] [ref=e71]
              - generic [ref=e72]:
                - generic [ref=e73] [cursor=pointer]:
                  - checkbox "5 & up" [ref=e74]
                  - generic [ref=e75]:
                    - text: "5"
                    - img [ref=e76]
                    - text: "& up"
                - generic [ref=e78] [cursor=pointer]:
                  - checkbox "4 & up" [ref=e79]
                  - generic [ref=e80]:
                    - text: "4"
                    - img [ref=e81]
                    - text: "& up"
                - generic [ref=e83] [cursor=pointer]:
                  - checkbox "3 & up" [ref=e84]
                  - generic [ref=e85]:
                    - text: "3"
                    - img [ref=e86]
                    - text: "& up"
                - generic [ref=e88] [cursor=pointer]:
                  - checkbox "2 & up" [ref=e89]
                  - generic [ref=e90]:
                    - text: "2"
                    - img [ref=e91]
                    - text: "& up"
                - generic [ref=e93] [cursor=pointer]:
                  - checkbox "1 & up" [ref=e94]
                  - generic [ref=e95]:
                    - text: "1"
                    - img [ref=e96]
                    - text: "& up"
            - generic [ref=e98]:
              - heading "Companies" [level=4] [ref=e99]
              - paragraph [ref=e101]: No companies found
          - generic [ref=e102]:
            - heading "Your Voice Matters" [level=3] [ref=e103]
            - paragraph [ref=e104]: Sharing your internship experience helps junior students make informed career decisions. Your reviews can be completely anonymous.
        - generic [ref=e105]:
          - generic [ref=e106]:
            - generic [ref=e107]:
              - button "Latest" [ref=e108]
              - button "Top Rated" [ref=e109]
            - generic [ref=e110]: 0 discussions
          - generic [ref=e111]:
            - img [ref=e112]
            - heading "No reviews found" [level=3] [ref=e115]
            - paragraph [ref=e116]: Try adjusting your search or filters.
            - button "Clear all filters" [ref=e117]
        - generic [ref=e118]:
          - generic [ref=e119]:
            - heading "Trending Companies" [level=3] [ref=e120]:
              - img [ref=e121]
              - text: Trending Companies
            - paragraph [ref=e125]: Not enough data
          - generic [ref=e126]:
            - heading "Writing Guidelines" [level=3] [ref=e127]:
              - img [ref=e128]
              - text: Writing Guidelines
            - list [ref=e131]:
              - listitem [ref=e132]:
                - generic [ref=e134]: Be respectful and professional in your critique.
              - listitem [ref=e135]:
                - generic [ref=e137]: Focus on your day-to-day responsibilities and learning.
              - listitem [ref=e138]:
                - generic [ref=e140]: Do not share confidential company information.
```