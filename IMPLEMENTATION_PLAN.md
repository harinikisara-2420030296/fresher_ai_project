# Fresher.AI — Implementation Plan & System Architecture

Fresher.AI is a Multi-Agent AI Interview Preparation Platform designed for students and fresh graduates. Tagline: *"Job Interviews Don't Have to Suck Anymore!"*

---

## 1. System Architecture & Monorepo Structure

```
fresher-ai/
├── client/                                # React 18 + Vite (port 5173), Tailwind CSS, Lucide icons, Recharts
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── assets/                        # AI interviewer illustration, avatar placeholders
│       ├── components/                    # Reusable design system components
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── SignInModal.jsx
│       │   ├── AddCoinsModal.jsx
│       │   ├── Toast.jsx
│       │   ├── RadarChart.jsx
│       │   └── CodeEditor.jsx
│       ├── context/
│       │   └── AuthContext.jsx            # Firebase Auth + Demo Guest Mode
│       ├── hooks/
│       │   ├── useSpeechRecognition.js    # Browser Web Speech API
│       │   └── useSpeechSynthesis.js      # Text-to-speech for AI Interviewer
│       ├── pages/
│       │   ├── LandingPage.jsx            # Route: /
│       │   ├── DashboardPage.jsx          # Route: /dashboard
│       │   ├── ResumeScorerPage.jsx       # Route: /scorer
│       │   ├── StartInterviewPage.jsx     # Route: /interview/new
│       │   ├── LiveInterviewPage.jsx      # Route: /interview/:id
│       │   ├── InterviewReportPage.jsx    # Route: /interview/:id/report
│       │   ├── RoadmapPage.jsx            # Route: /roadmap
│       │   └── ResumeBuilderPage.jsx      # Route: /resume-builder
│       ├── services/
│       │   ├── api.js                     # Axios client targeting Gateway (http://localhost:5000/api)
│       │   └── firebase.js                # Firebase JS SDK initialization
│       └── lib/
│           └── utils.js
├── packages/
│   └── shared/                            # Common package for all services
│       ├── package.json
│       ├── logger.js                      # Centralized structured logger
│       ├── errorCodes.js                  # Standardized error codes & custom error classes
│       ├── zodSchemas.js                  # Zod validation schemas for all requests/responses
│       ├── redisClient.js                 # Shared ioredis factory with reconnection handling
│       └── llmFactory.js                  # LangChain / LangGraph LLM factory (Gemini / OpenAI / fallback)
├── services/
│   ├── api-gateway/ (port 5000)           # Express + http-proxy-middleware + rate-limit + Firebase Admin Auth
│   ├── user-service/ (port 5001)          # User profile, coins balance & transactions, dashboard stats
│   ├── resume-service/ (port 5002)        # Resume upload (pdf-parse), ATS scoring agent, resume builder AI
│   ├── interview-service/ (port 5003)     # LangGraph interview session flow, 60s server timer, BullMQ producer
│   ├── feedback-service/ (port 5004)      # Answer evaluation chain, BullMQ worker for comprehensive report
│   └── roadmap-service/ (port 5005)       # LangChain roadmap generation with salary/resume personalization
├── docker-compose.yml                     # Full stack Docker orchestration (Mongo, Redis, Gateway, Services, Client)
├── .env.example                           # Comprehensive environment configuration template
├── seed.js                                # Database seeder script for instant demo data
├── README.md                              # Comprehensive guide & College presentation script
├── API.md                                 # Full REST API specification
├── TESTING.md                             # Testing instructions & test suite
└── DEPLOYMENT.md                          # AWS EC2 & Docker deployment guide
```

---

## 2. Microservices & Communication Blueprint

| Service | Port | Database Collections | Redis Keys / Queue |
| :--- | :--- | :--- | :--- |
| **api-gateway** | 5000 | - | Rate-limiting buckets |
| **user-service** | 5001 | `users`, `cointransactions` | `cache:dashboard:{userId}` |
| **resume-service** | 5002 | `resumeanalyses`, `resumedrafts` | - |
| **interview-service**| 5003 | `interviews` | `session:interview:{id}` (timer), BullMQ `report-generation` producer |
| **feedback-service** | 5004 | - | BullMQ `report-generation` consumer |
| **roadmap-service** | 5005 | `roadmaps` | - |

---

## 3. Sensible Defaults for [INFERRED] Items

1. **Dashboard Recent Interviews**: Table/card list showing role, type, completion date, score, status, and direct link to report or active interview.
2. **Add Coins Modal**: Triggered by the `+` button in the sidebar coin card; provides instant demo coin top-ups (+200, +500, +1000) using `POST /api/me/coins/add`.
3. **Scorer Score Bands**: <40: Weak, 40-59: Below Average, 60-79: Average, 80-100: Strong.
4. **Interview Cost & Initial Balance**: 50 coins per interview, 1000 coins for new accounts.
5. **Interview Difficulty Ramping**: Q1-2 Easy, Q3-4 Medium, Q5-6 Hard.
6. **Timeout Response**: `{ answer: "No answer provided. Time over.", scores: { all: 0 }, feedback: "No answer was provided...", improvements: ["Provide an answer."] }`.
7. **Roadmap Module Details**: Sub-topics list + curated free documentation/courses links.
8. **Resume Builder**: Full multi-step form + AI bullet point enhancer + ATS live preview + PDF export + draft persistence.
9. **College Demo Mode**: Built-in 1-click "Demo Student" authentication and smart AI fallback so the platform runs flawlessly offline or without API keys.

