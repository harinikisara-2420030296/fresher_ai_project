import { z } from 'zod';

// ==========================================
// User & Auth Schemas
// ==========================================
export const syncUserSchema = z.object({
  firebaseUid: z.string().min(1, 'Firebase UID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  photoURL: z.string().url().optional().or(z.literal(''))
});

export const addCoinsSchema = z.object({
  amount: z.number().int().positive('Amount must be a positive integer'),
  reason: z.string().optional().default('Demo coin purchase')
});

// ==========================================
// Resume Schemas
// ==========================================
export const resumeScoreRequestSchema = z.object({
  useStoredResume: z.boolean().optional().default(false)
});

export const resumeDraftSchema = z.object({
  personal: z.object({
    fullName: z.string().default(''),
    email: z.string().default(''),
    phone: z.string().default(''),
    location: z.string().default(''),
    linkedin: z.string().default(''),
    github: z.string().default(''),
    portfolio: z.string().default(''),
    summary: z.string().default('')
  }),
  education: z.array(z.object({
    institution: z.string().default(''),
    degree: z.string().default(''),
    fieldOfStudy: z.string().default(''),
    startYear: z.string().default(''),
    endYear: z.string().default(''),
    gpa: z.string().default('')
  })).default([]),
  skills: z.array(z.string()).default([]),
  projects: z.array(z.object({
    title: z.string().default(''),
    description: z.string().default(''),
    technologies: z.array(z.string()).default([]),
    link: z.string().default('')
  })).default([]),
  experience: z.array(z.object({
    company: z.string().default(''),
    role: z.string().default(''),
    duration: z.string().default(''),
    highlights: z.array(z.string()).default([])
  })).default([]),
  certifications: z.array(z.object({
    name: z.string().default(''),
    issuer: z.string().default(''),
    year: z.string().default('')
  })).default([])
});

export const resumeGenerateBulletsSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  rawText: z.string().min(5, 'Raw description text is required')
});

// ==========================================
// Interview Schemas
// ==========================================
export const createInterviewSchema = z.object({
  role: z.string().min(1, 'Target role is required').max(100),
  type: z.enum(['technical', 'hr'], {
    errorMap: () => ({ message: 'Type must be either technical or hr' })
  }),
  useResume: z.boolean().default(false)
});

export const submitAnswerSchema = z.object({
  answer: z.string().default(''),
  code: z.string().optional().default(''),
  timedOut: z.boolean().optional().default(false)
});

// ==========================================
// Roadmap Schemas
// ==========================================
export const createRoadmapSchema = z.object({
  role: z.string().min(1, 'Target role is required').max(100),
  salaryLPA: z.string().default('10 LPA'),
  useResume: z.boolean().default(false)
});

// ==========================================
// Structured LLM Output Schemas
// ==========================================
export const llmResumeScoreSchema = z.object({
  candidateName: z.string().default('Candidate'),
  detectedRole: z.string().default('Software Engineer'),
  score: z.number().min(0).max(100),
  label: z.enum(['Weak', 'Below Average', 'Average', 'Strong']),
  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).min(1),
  missingSkills: z.array(z.string()).min(1),
  recommendations: z.array(z.string()).min(1)
});

export const llmEvaluateAnswerSchema = z.object({
  score: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  relevance: z.number().min(0).max(100),
  communication: z.number().min(0).max(100),
  correctness: z.number().min(0).max(100),
  detail: z.number().min(0).max(100),
  efficiency: z.number().min(0).max(100),
  creativity: z.number().min(0).max(100),
  problemSolving: z.number().min(0).max(100),
  feedback: z.string(),
  suggestedImprovements: z.array(z.string()).min(1)
});

export const llmGenerateReportSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()).min(2),
  areasToImprove: z.array(z.string()).min(2),
  recommendations: z.array(z.string()).min(2)
});

export const llmGenerateRoadmapSchema = z.object({
  title: z.string(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  durationMonths: z.number().positive(),
  modules: z.array(z.object({
    order: z.number().int().positive(),
    title: z.string(),
    durationMonths: z.number().positive(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    description: z.string(),
    topics: z.array(z.string()),
    resources: z.array(z.string()).optional().default([])
  })).min(3)
});

export const llmGenerateQuestionSchema = z.object({
  question: z.string().min(10)
});

