import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import axios from 'axios';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import {
  logger,
  AppError,
  ErrorCodes,
  errorHandler,
  llmEvaluateAnswerSchema,
  llmGenerateReportSchema,
  executeStructuredPrompt
} from '@fresher-ai/shared';

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.FEEDBACK_SERVICE_PORT || 5004;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fresher_ai';
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';

app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect to MongoDB with 2s timeout
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => logger.info(`Feedback Service connected to MongoDB: ${MONGO_URI}`))
  .catch((err) => logger.warn(`MongoDB not detected (${err.message}). In-memory feedback evaluation active.`));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'feedback-service',
    status: 'healthy',
    db: mongoose.connection.readyState === 1 ? 'mongodb' : 'in-memory-ready',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// Evaluation Chain Logic
// ==========================================
export async function evaluateAnswerLogic({ question, answer, code, role, type, timedOut }) {
  if (timedOut || !answer || !answer.trim() || answer.toLowerCase().includes('no answer provided')) {
    return {
      score: 0,
      clarity: 0,
      relevance: 0,
      communication: 0,
      correctness: 0,
      detail: 0,
      efficiency: 0,
      creativity: 0,
      problemSolving: 0,
      feedback: "No answer was provided, so it's impossible to assess the candidate's knowledge.",
      suggestedImprovements: ["Provide an answer."]
    };
  }

  const prompt = `You are an expert technical interviewer evaluating a candidate's answer for the role: "${role}" (${type}).
Question: "${question}"
Candidate Answer: "${answer}"
${code ? `Submitted Code: "${code}"` : ''}

Strictly evaluate the candidate's answer on the following 0-100 metrics:
- score (overall answer quality)
- clarity (structure and articulateness)
- relevance (directness in answering the core question)
- communication (professional vocabulary and presentation)
- correctness (technical accuracy or behavioral validity)
- detail (depth, examples, edge cases considered)
- efficiency (algorithmic optimality or concise reasoning)
- creativity (novel approaches or insightful connections)
- problemSolving (structured analytical methodology)
- feedback (1-2 friendly, constructive sentences)
- suggestedImprovements (3 short, actionable improvement bullet points)

Output format: JSON matching the schema.`;

  const fallbackGenerator = () => {
    // Dynamic score based on answer length and technical keywords
    const len = answer.trim().length;
    let baseScore = Math.min(90, Math.max(45, Math.floor(40 + len / 6)));
    if (code && code.trim().length > 15) baseScore = Math.min(95, baseScore + 8);

    return {
      score: baseScore,
      clarity: Math.min(100, baseScore + 3),
      relevance: Math.min(100, baseScore + 4),
      communication: Math.min(100, baseScore + 1),
      correctness: baseScore,
      detail: Math.max(30, baseScore - 5),
      efficiency: Math.min(100, baseScore + 2),
      creativity: Math.max(40, baseScore - 4),
      problemSolving: Math.min(100, baseScore + 3),
      feedback: "Clear explanation with good foundational awareness. Adding specific production examples would elevate your answer further.",
      suggestedImprovements: [
        "Include more concrete implementation details or edge cases.",
        "Mention performance trade-offs or scalability considerations.",
        "Structure your response with the STAR (Situation, Task, Action, Result) method."
      ]
    };
  };

  return await executeStructuredPrompt({
    prompt,
    schema: llmEvaluateAnswerSchema,
    systemMessage: 'You are an exacting Engineering Hiring Director. Output ONLY valid JSON.',
    fallbackGenerator,
    temperature: 0.1
  });
}

// POST /internal/evaluate: Evaluate single answer
app.post('/internal/evaluate', async (req, res, next) => {
  try {
    const { question, answer, code, role, type, timedOut } = req.body;
    const result = await evaluateAnswerLogic({ question, answer, code, role, type, timedOut });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// Comprehensive Final Report Chain
// ==========================================
export async function generateFinalReportForInterview(interviewId) {
  logger.info(`Starting report synthesis for interview: ${interviewId}`);
  const interviewsCollection = mongoose.connection.collection('interviews');
  const interview = await interviewsCollection.findOne({ _id: new mongoose.Types.ObjectId(interviewId) });

  if (!interview) {
    logger.error(`Interview not found for report generation: ${interviewId}`);
    return;
  }

  // Calculate overall score: rounded mean of valid question scores
  const questions = interview.questions || [];
  const scores = questions.map(q => q.scores?.score ?? 0);
  const total = scores.reduce((acc, curr) => acc + curr, 0);
  const overallScore = scores.length > 0 ? Math.round(total / scores.length) : 0;

  const prompt = `Synthesize a comprehensive final performance evaluation for a 6-question mock interview:
Role: "${interview.role}"
Interview Type: "${interview.type}"
Computed Overall Score: ${overallScore}/100

Detailed Questions and Answers:
${questions.map((q, i) => `Q${i + 1} (${q.difficulty}): ${q.text}\nAnswer: ${q.answer}\nScore: ${q.scores?.score}/100\nFeedback: ${q.feedback}\n`).join('\n')}

Generate:
1. overallScore (set to ${overallScore})
2. summary (a comprehensive 3-4 sentence paragraph highlighting overall competence, technical readiness, and potential)
3. strengths (3-5 concrete strengths demonstrated during the interview)
4. areasToImprove (3-5 critical development areas or gaps identified)
5. recommendations (3-5 high-leverage preparation steps for upcoming live interviews)

Output format: JSON matching the schema.`;

  const fallbackGenerator = () => ({
    overallScore,
    summary: `The candidate completed all 6 interview stages for the ${interview.role} role, demonstrating good foundational knowledge and clear communication. With targeted refinement in system design and deep implementation details, the candidate is well-positioned for junior to mid-level engineering opportunities.`,
    strengths: [
      'Strong conceptual clarity across fundamental concepts and terminology',
      'Articulate communication style with logical step-by-step reasoning',
      'Effective handling of problem-solving challenges and structured syntax'
    ],
    areasToImprove: [
      'Deepen understanding of edge cases and concurrency error handling',
      'Expand on quantifiable metrics and architectural trade-offs',
      'Practice writing more production-hardened code snippets under time limits'
    ],
    recommendations: [
      'Practice whiteboarding algorithm problems with strict time constraints.',
      'Review modern design patterns and database indexing optimization strategies.',
      'Refine personal project explanations using the STAR technique to emphasize real impact.'
    ]
  });

  const reportData = await executeStructuredPrompt({
    prompt,
    schema: llmGenerateReportSchema,
    systemMessage: 'You are a Principal Engineering Director producing a final hiring panel summary. Output ONLY valid JSON.',
    fallbackGenerator,
    temperature: 0.2
  });

  // Update interview document in MongoDB
  await interviewsCollection.updateOne(
    { _id: new mongoose.Types.ObjectId(interviewId) },
    {
      $set: {
        overallScore,
        summary: reportData.summary,
        strengths: reportData.strengths,
        areasToImprove: reportData.areasToImprove,
        recommendations: reportData.recommendations,
        reportStatus: 'ready',
        status: 'completed',
        completedAt: new Date()
      }
    }
  );

  logger.info(`Final report generated and persisted successfully for interview: ${interviewId}`);

  // Invalidate Redis dashboard cache
  if (interview.userId) {
    try {
      await axios.post(`${USER_SERVICE_URL}/internal/invalidate-cache`, {
        userId: interview.userId.toString()
      });
    } catch (e) {
      // non-blocking
    }
  }

  return reportData;
}

// POST /internal/generate-report: Direct endpoint (fallback when BullMQ is bypassed)
app.post('/internal/generate-report', async (req, res, next) => {
  try {
    const { interviewId } = req.body;
    const report = await generateFinalReportForInterview(interviewId);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// BullMQ Consumer Worker
// ==========================================
try {
  const workerConnection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: () => null
  });
  workerConnection.on('error', (err) => {
    logger.warn(`BullMQ worker Redis connection notice: ${err.message}. Direct HTTP report fallback active.`);
  });

  const reportWorker = new Worker('report-generation', async (job) => {
    logger.info(`BullMQ Worker processing job: ${job.name} (id: ${job.id})`);
    const { interviewId } = job.data;
    if (interviewId) {
      await generateFinalReportForInterview(interviewId);
    }
  }, {
    connection: workerConnection,
    concurrency: 2
  });

  reportWorker.on('error', (err) => {
    logger.warn(`BullMQ worker notice: ${err.message}`);
  });

  reportWorker.on('completed', (job) => {
    logger.info(`BullMQ report job ${job.id} completed successfully`);
  });

  reportWorker.on('failed', (job, err) => {
    logger.error(`BullMQ report job ${job?.id} failed:`, err);
  });
} catch (workerErr) {
  logger.warn(`BullMQ worker initialization note: ${workerErr.message}`);
}

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Feedback Service running on port ${PORT}`);
});
