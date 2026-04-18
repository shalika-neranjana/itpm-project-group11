# Career Data Migration - Database-Driven Approach

## Overview

The student guidance system has been refactored to fetch all data from the database instead of using hardcoded constants. This allows for dynamic, user-specific data that can be updated without code changes.

## What Changed

### 1. **Hardcoded Constants Removed**
   - ❌ `DEFAULT_INTERESTS` - Now initialized as empty arrays per user
   - ❌ `DEFAULT_SKILLS` - Now initialized as empty arrays per user
   - ❌ `CAREER_LIBRARY` - Now fetched from the Career collection

### 2. **New Career Model**
   - Created `server/src/models/student_guidance/Career.js`
   - Stores career paths with:
     - `title`: Career position name
     - `matchTags`: Array of matching interests/skills
     - `summary`: Career description
     - `nextStep`: Action items for students
     - `matchScore`: Relevance score (0-100)
     - `isActive`: Boolean to enable/disable careers
     - `timestamps`: Created/updated at dates

### 3. **Updated Functions**
   - `buildCareerSuggestions()` - Now async, fetches from Career model
   - `buildResponse()` - Now async
   - `getOrCreateStudentGuidance()` - Creates new records with empty interests/skills
   - All callers updated to await async functions

## Database Setup

### Step 1: Prepare the Database
Ensure MongoDB is running and connected.

### Step 2: Seed Default Careers
Run the seed script to populate the Career collection with initial data:

```bash
npm run seed:careers
```

This will:
- Clear existing careers (if any)
- Insert 6 default career paths:
  - Web Developer
  - Mobile Apps Developer
  - Desktop App Developer
  - Backend Developer
  - Data Analyst
  - UI/UX Designer

### Step 3: Verify Data
Check MongoDB to confirm careers were inserted:

```javascript
// In MongoDB shell
db.careers.find()
db.careers.countDocuments()
```

## User Data Flow

### For Existing Users
1. User logs in
2. System fetches their StudentGuidance record (interests & skills from DB)
3. Careers are matched against fetched interests/skills
4. Results displayed dynamically

### For New Users
1. User logs in for the first time
2. Empty StudentGuidance created (interests & skills = [])
3. User updates their interests/skills through the UI
4. Data persisted to StudentGuidance in DB
5. Career matches recalculated based on user data

## API Endpoints

### Get Student Guidance
```
GET /api/student-guidance
```
Returns personalized guidance with careers fetched from DB.

### Update Interests
```
PUT /api/student-guidance/interests
Body: { interests: [...], aspirations: "..." }
```
Updates user interests and triggers new career suggestions.

### Update Skills
```
PUT /api/student-guidance/skills
Body: { skills: [...] }
```
Updates user skills and triggers new career suggestions.

## Managing Career Data

### Add New Career
Use MongoDB shell or your admin interface:

```javascript
db.careers.insertOne({
  title: "Full Stack Developer",
  matchTags: ["Software Engineering", "JavaScript", "React", "Backend", "Database"],
  summary: "Build complete web applications from frontend to backend.",
  nextStep: "Build and deploy a full-stack application with authentication and database integration.",
  matchScore: 90,
  isActive: true
})
```

### Update Existing Career
```javascript
db.careers.updateOne(
  { title: "Web Developer" },
  { $set: { matchScore: 85, summary: "Updated description..." } }
)
```

### Deactivate Career
```javascript
db.careers.updateOne(
  { title: "Desktop App Developer" },
  { $set: { isActive: false } }
)
```

## Benefits

✅ **Dynamic Data**: No code changes needed to add/modify careers
✅ **User-Specific**: Each student has personalized interests/skills
✅ **Scalability**: Easy to add new careers or interests
✅ **Admin Control**: Manage careers through database
✅ **Historical Data**: Timestamps preserved for auditing
✅ **Active/Inactive Toggle**: Control which careers appear without deletion

## Troubleshooting

### Careers Not Appearing
1. Check if Career collection exists: `db.careers.countDocuments()`
2. Run seed script: `npm run seed:careers`
3. Verify career documents have `isActive: true`

### Student Guidance Not Found
1. Make sure user is authenticated (JWT token valid)
2. Check StudentGuidance collection has document for user ID
3. If missing, it will auto-create on first guidance request

### Empty Interests/Skills for New Users
This is expected! New users start with empty collections and add their own interests/skills through the UI.

## Related Files

- **Model**: `server/src/models/student_guidance/Career.js`
- **Controller**: `server/src/controllers/student_guidance/studentGuidanceController.js`
- **Routes**: `server/src/routes/student_guidance/studentGuidanceRoutes.js`
- **Seed Script**: `server/src/seeds/seedCareers.js`
- **StudentGuidance Model**: `server/src/models/student_guidance/StudentGuidance.js`

## Next Steps

1. Run `npm run seed:careers` to populate initial data
2. Test the API endpoints to verify careers are fetched
3. Have students update their interests/skills through the UI
4. Monitor and manage careers through MongoDB as needed
