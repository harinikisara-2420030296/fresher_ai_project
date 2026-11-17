# Fresher.AI — Testing & Verification Guide

This document describes the automated test suites, manual verification flows, and quality criteria for **Fresher.AI**.

---

## 1. Automated Test Suites

### A. Unit & Schema Validation Suite
Runs in under 1 second without external services using the native Node.js test runner:

```bash
node --test tests/api.test.js
```

**Validated Areas:**
1. **User Sync Schema**: Verifies email formatting, required UIDs, and payload normalization.
2. **Interview Creation Schema**: Enforces role character limits, enum checks (`technical` | `hr`), and boolean `useResume`.
3. **Answer Submission Contract**: Validates text, optional code string, and timeout boolean flag.
4. **Roadmap Generation Schema**: Checks salary LPA options and default fallbacks.
5. **8-Axis Radar Scoring Metrics**: Confirms numbers 0-100 for Correctness, Clarity, Relevance, Detail, Efficiency, Communication, Problem Solving, and Creativity.
6. **Resume Score Bands**: Validates bands (<40: Weak, 40-59: Below Average, 60-79: Average, >=80: Strong).
7. **Coin Deduction Arithmetic**: Validates 50-coin deduction logic and rejects negative/insufficient balances.
8. **Report Overall Score Calculation**: Tests rounded mean calculations over 6 questions.

### B. Microservices Live Integration & Health Suite
Starts the API Gateway and all 5 microservices, verifies every `/health` endpoint, and tests end-to-end proxying:

```bash
node tests/verify-servers.js
```

**Verified Endpoints:**
- `GET http://localhost:5000/health` (API Gateway)
- `GET http://localhost:5001/health` (User Service)
- `GET http://localhost:5002/health` (Resume Service)
- `GET http://localhost:5003/health` (Interview Service)
- `GET http://localhost:5004/health` (Feedback Service)
- `GET http://localhost:5005/health` (Roadmap Service)
- `GET http://localhost:5000/api/me` (Gateway -> User Service)
- `GET http://localhost:5000/api/dashboard/stats` (Gateway -> User Service Redis/Aggregation)
- `GET http://localhost:5000/api/roadmaps` (Gateway -> Roadmap Service)

### C. Client Production Build Verification
Ensures all JSX, Tailwind classes, and Recharts components bundle cleanly:

```bash
npm --prefix client run build
```

---

## 2. End-to-End Manual Testing Walkthrough

Follow this script to verify all 9 core views and features in the browser:

### Step 1: Landing Page (`/`)
1. Open `http://localhost:5173`.
2. Verify the minimalist monochrome SaaS styling with the 3-line headline:
   - Line 1: **Job Interviews** (near-black)
   - Line 2: **Don't Have to Suck** (mid-grey)
   - Line 3: **Anymore!** (near-black)
3. Check the interactive **Product Preview card** below the hero showing a replica of the dashboard (21 interviews, 126 questions, 15 completed, 23/100 score, and spider radar charts).
4. Scroll to the **AI Powered Agents** section: verify the 4 dark cards (Resume, Interview, Feedback, Roadmap Agent).

### Step 2: Sign-In Modal & Instant Demo Student Login
1. Click **"Get started for free →"** or **"Log In →"**.
2. Verify the dark modal (~420px) appears with the blurred backdrop.
3. Test **"Continue as Demo Student (Kisara Harini)"** for zero-setup demoing:
   - Logs in immediately as **Kisara Harini** (`demo_user_harini_123`).
   - Redirects cleanly to `/dashboard`.
   - Toast displays: *"Logged in as Demo Student: Kisara Harini"*.

### Step 3: Dashboard (`/dashboard`)
1. Verify greeting: *"Hello, Harini 👋"*.
2. Review the 4 dark stat cards: Total Interviews, Questions Solved, Completed, Average Score.
3. Examine both spider radar charts side by side:
   - **Technical Interviews (N)** with 8 axes: Correctness, Clarity, Relevance, Detail, Efficiency, Communication, Problem solving, Creativity.
   - **HR Interviews (N)** with 8 axes.
4. Verify the **Recent Interviews** table with status pills ("Completed" vs "In Progress") and action links ("View Report" / "Resume").
5. In the sidebar, click the round `+` button on the **Interview Coins** card:
   - Opens the Top Up Coins modal.
   - Select "+500 Pro Pack" and click **Add Coins**.
   - Balance updates immediately in the sidebar and database.

### Step 4: Resume Scorer (`/scorer`)
1. In the sidebar, click **"Resume Scorer"**.
2. **Step 1 Upload**:
   - Drag a non-PDF file: verify error toast *"Please select a valid PDF file"*.
   - Upload any valid PDF resume (e.g. `Harini_Kisara_Resume.pdf`).
   - Click **Analyze**. Button transitions to *"Analyzing..."*.
3. **Step 2 Results**:
   - Dynamic score ring (<40 red, 40-79 amber, >=80 purple).
   - Candidate Name heading ("Kisara Harini") and detected role pill (e.g., "Full Stack Developer").
   - Strengths card with green-tinted chips.
   - Weaknesses card with amber chips.
   - Missing Skills card with red chips.
   - Numbered Recommendations card (1, 2, 3).
   - Click **"Re-upload"** to return to Step 1.

### Step 5: Start Interview (`/interview/new`)
1. Click **"+ Create Interview"** in the sidebar.
2. Verify split panel layout:
   - Left: Overview, Welcome back greeting, 4 feature benefit checkboxes.
   - Right: Configuration form.
3. Target Role defaults to *"Backend Developer"*.
4. Switch between **"Technical"** and **"Hr"** using the segmented toggle.
5. Toggle **"Use Resume"** ON:
   - Since Harini has a resume, the green-tinted **"Resume Ready"** banner displays with a green checkmark.
6. Click **"Start Interview →"**:
   - Deducts 50 coins.
   - Navigates to `/interview/:id`.

### Step 6: Live AI Interview Room (`/interview/:id`)
1. **Left Column**:
   - Video tile displays the illustrated AI interviewer in a yellow top working at a laptop in a modern office.
   - When the question is read aloud, the **"AI Speaking"** badge animates with green equalizer bars.
   - Below, the user tile shows the user initial or live webcam stream (click the Camera icon to test webcam).
   - Control buttons: Microphone (SpeechRecognition), Camera, Code `</>`.
2. **Right Column**:
   - Difficulty pill ("easy", "medium", "hard") updates per question.
   - Circular countdown ring (60s limit) with red digits and depleting green stroke.
   - Type an answer or speak into the microphone to stream transcript into the answer box.
   - Click the `</>` button to open the monospace code editor, write JavaScript, and submit.
   - Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to submit.
   - Green-tinted **"AI FEEDBACK"** box displays instant feedback for 2 seconds.
3. Test Timeout:
   - Let the timer run down to 0: auto-submits *"No answer provided. Time over."* with score 0 and advances smoothly.
4. Refresh restoration:
   - Refresh the page on Question 3: state is restored from Redis/database without losing progress.
5. Complete all 6 questions: automatically transitions to the final report.

### Step 7: Interview Report (`/interview/:id/report`)
1. Stat cards: Overall Score (e.g., 88/100), Questions (6), Status (Completed).
2. AI-written Executive Summary paragraph.
3. Strengths and Areas to Improve cards.
4. Recommendations card.
5. 6 Question cards showing: question text, user answer/code block, 4 score tiles (Score, Clarity, Relevance, Communication), green AI feedback box, and suggested improvements.
6. Click **"Download PDF"**:
   - Dedicated print stylesheet opens `window.print()` with dark backgrounds preserved and non-essential UI hidden.

### Step 8: AI Roadmap Generator (`/roadmap`)
1. Click **"Roadmap Builder"** in the sidebar.
2. Click quick-pick **"Frontend Dev"**:
   - Generates an 8-module chronological learning path.
3. Test custom prompt:
   - Input *"Cloud DevOps Engineer"*, select *"20 LPA"* from the dropdown, toggle *"Resume"*, and click Send.
4. Expand accordion rows:
   - Review description, key concepts to master, and free learning resources (MDN, freeCodeCamp).

### Step 9: Resume Builder (`/resume-builder`)
1. Click **"Resume Builder"** in the sidebar.
2. Step through tabs: Personal info, Education, Skills, Projects, Experience, Certifications.
3. In Projects, click **"Generate ATS Bullets with AI"**:
   - AI transforms plain text into high-impact action-verb bullet points.
4. Review the live single-column ATS A4 preview on the right.
5. Click **"Save Draft"** (persisted in MongoDB).
6. Click **"Download PDF"** to export.

### Step 10: Logout & ProtectedRoute Guard
1. Click the Logout icon at the bottom of the sidebar.
2. Try visiting `http://localhost:5173/dashboard` or `http://localhost:5173/scorer`.
3. Verifies immediate redirect back to `/`.

