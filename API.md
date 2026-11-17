# Fresher.AI — REST API Documentation
*Engineered by Kisara Harini*

All client requests target the API Gateway (`http://localhost:5000/api`). Protected routes require an `Authorization: Bearer <token>` header containing a Firebase ID token or the student demo token (`Bearer mock_token_demo_user_harini_123`).

All API responses follow the standard format:
- **Success**: `{ "success": true, "data": ... }`
- **Error**: `{ "success": false, "message": "...", "code": "...", "details": ... }`

---

## 1. Authentication & User Profile (`user-service` via Gateway)

### POST `/api/auth/sync`
Upserts a user profile on login.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "firebaseUid": "demo_user_harini_123",
  "name": "Kisara Harini",
  "email": "harini.kisara@college.edu",
  "photoURL": "https://example.com/avatar.jpg"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "_id": "6650a1b2c3d4e5f6a7b8c9d0",
    "firebaseUid": "demo_user_harini_123",
    "name": "Kisara Harini",
    "email": "harini.kisara@college.edu",
    "coins": 3590,
    "resume": {
      "fileName": "Harini_Kisara_Resume.pdf",
      "text": "Experienced full stack developer...",
      "uploadedAt": "2026-11-02T15:00:00.000Z"
    }
  }
}
```

### GET `/api/me`
Retrieves current authenticated user details and coin balance.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "_id": "6650a1b2c3d4e5f6a7b8c9d0",
    "name": "Kisara Harini",
    "coins": 3590,
    "resume": { ... }
  }
}
```

### POST `/api/me/coins/add`
Instantly recharges interview coins for demo testing.
- **Request Body**:
```json
{
  "amount": 500,
  "reason": "Pro Pack Purchase (+500)"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "newBalance": 4090,
    "added": 500
  }
}
```

---

## 2. Dashboard (`user-service` via Gateway, Redis-Cached 60s)

### GET `/api/dashboard/stats`
Returns aggregated interview stats, 8-axis spider radar metrics for Technical and HR interviews, and recent sessions.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "cached": false,
  "data": {
    "totals": 21,
    "questionsSolved": 126,
    "completed": 15,
    "averageScore": 88,
    "counts": {
      "technical": 12,
      "hr": 3
    },
    "radar": {
      "technical": {
        "correctness": 88,
        "clarity": 86,
        "relevance": 90,
        "detail": 84,
        "efficiency": 85,
        "communication": 86,
        "problemSolving": 92,
        "creativity": 82
      },
      "hr": {
        "correctness": 85,
        "clarity": 89,
        "relevance": 91,
        "detail": 82,
        "efficiency": 84,
        "communication": 91,
        "problemSolving": 85,
        "creativity": 84
      }
    },
    "recentInterviews": [
      {
        "_id": "demo_interview_tech_1",
        "role": "Backend Developer",
        "type": "technical",
        "status": "completed",
        "overallScore": 88,
        "currentIndex": 6,
        "createdAt": "2026-11-02T13:00:00.000Z"
      }
    ]
  }
}
```

---

## 3. Resume Scorer & Builder (`resume-service` via Gateway)

### POST `/api/resume/upload`
Uploads and parses a PDF resume into clean text (Multipart, field `"resume"`).
- **Headers**: `Content-Type: multipart/form-data`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "fileName": "Resume.pdf",
    "textLength": 3420,
    "message": "Resume uploaded and parsed successfully"
  }
}
```

### POST `/api/resume/score`
Performs ATS evaluation and scoring using the Resume Agent.
- **Request Body**: Multipart (`resume` file) OR JSON (`{ "useStoredResume": true }`).
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "_id": "analysis_12345",
    "candidateName": "Kisara Harini",
    "detectedRole": "Full Stack Developer",
    "score": 85,
    "label": "Strong",
    "strengths": [
      "Solid practical foundations in modern full-stack web technologies",
      "Clean standard single-column ATS readable format"
    ],
    "weaknesses": [
      "Needs more quantifiable metrics and measurable performance impact"
    ],
    "missingSkills": [
      "Docker & Containerization",
      "CI/CD GitHub Actions"
    ],
    "recommendations": [
      "Quantify accomplishments using Google XYZ formula."
    ]
  }
}
```

### POST `/api/resume/builder/generate`
Transforms raw descriptions into high-impact ATS bullet points.
- **Request Body**:
```json
{
  "role": "Backend Developer",
  "rawText": "worked on express APIs and connected mongodb database"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "bullets": [
      "Architected and deployed resilient Express.js REST APIs with MongoDB, decreasing latency by 24% across production traffic.",
      "Engineered secure schema validations and error-handling pipelines."
    ]
  }
}
```

### GET `/api/resume/builder/draft` & PUT `/api/resume/builder/draft`
Saves or restores the user's interactive resume builder draft.

---

## 4. Interview Mock Sessions (`interview-service` via Gateway)

### POST `/api/interviews`
Deducts 50 coins, initializes a 6-question mock interview, generates Question 1, and starts the 60s server-side countdown timer.
- **Request Body**:
```json
{
  "role": "Backend Developer",
  "type": "technical",
  "useResume": true
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "_id": "6650b2c3d4e5f6a7b8c9d1",
    "role": "Backend Developer",
    "type": "technical",
    "currentIndex": 1,
    "totalQuestions": 6,
    "status": "in_progress",
    "questions": [
      {
        "index": 1,
        "text": "What is the difference between null and undefined in JavaScript?",
        "difficulty": "easy"
      }
    ]
  }
}
```

### GET `/api/interviews/:id`
Retrieves live session state and the exact remaining seconds calculated by Redis.
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "_id": "6650b2c3d4e5f6a7b8c9d1",
    "currentIndex": 1,
    "secondsRemaining": 54,
    "currentQuestion": {
      "index": 1,
      "text": "What is the difference between null and undefined in JavaScript?",
      "difficulty": "easy"
    },
    "previousFeedback": null
  }
}
```

### POST `/api/interviews/:id/answer`
Submits an answer, evaluates it against the 8-axis scoring rubric, and loads the next question (or triggers BullMQ report generation after Q6).
- **Request Body**:
```json
{
  "answer": "undefined indicates a declared variable without value, null is an intentional empty object reference.",
  "code": "let a; console.log(a);",
  "timedOut": false
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "finished": false,
    "feedback": "Excellent explanation covering both primitive semantics and types.",
    "nextQuestion": {
      "index": 2,
      "text": "How do you handle state management in React?",
      "difficulty": "easy"
    }
  }
}
```

### GET `/api/interviews/:id/report`
Fetches the completed 6-question performance report.
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "_id": "6650b2c3d4e5f6a7b8c9d1",
    "role": "Backend Developer",
    "overallScore": 88,
    "summary": "Kisara Harini demonstrated strong technical proficiency across JavaScript internals...",
    "strengths": [ "High algorithmic problem solving", "Accurate closure semantics" ],
    "areasToImprove": [ "Expand on query profiling", "Detail Redis clustering" ],
    "recommendations": [ "Practice timed whiteboard challenges" ],
    "reportStatus": "ready",
    "questions": [ ... ]
  }
}
```

---

## 5. Roadmap Builder (`roadmap-service` via Gateway)

### POST `/api/roadmaps`
Generates a personalized chronological learning roadmap.
- **Request Body**:
```json
{
  "role": "Frontend Developer",
  "salaryLPA": "15 LPA",
  "useResume": true
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "_id": "roadmap_12345",
    "title": "Frontend Development Roadmap",
    "difficulty": "Intermediate",
    "durationMonths": 12,
    "modules": [
      {
        "order": 1,
        "title": "Introduction To HTML",
        "durationMonths": 1,
        "difficulty": "Easy",
        "description": "Master semantic HTML5, accessible forms, and SEO principles.",
        "topics": ["Semantic Tags", "Forms & Validation", "ARIA Roles"],
        "resources": ["MDN HTML Guide", "freeCodeCamp"]
      }
    ]
  }
}
```

