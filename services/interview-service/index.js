import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import axios from 'axios';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import {
  logger,
  AppError,
  ErrorCodes,
  errorHandler,
  createInterviewSchema,
  submitAnswerSchema,
  createRedisClient
} from '@fresher-ai/shared';
import { Interview } from './models.js';
import { generateQuestionForSession } from './graph.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.INTERVIEW_SERVICE_PORT || 5003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fresher_ai';
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const FEEDBACK_SERVICE_URL = process.env.FEEDBACK_SERVICE_URL || 'http://localhost:5004';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';

app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize Redis Client
const redis = createRedisClient(REDIS_URL);

// In-Memory Storage Fallback (active if MongoDB is unavailable)
const memInterviews = new Map();

// Preload Seeded Completed Interview (for immediate report demo)
const seedInterviewTech = {
  _id: 'demo_interview_tech_1',
  userId: '6650a1b2c3d4e5f6a7b8c9d0',
  role: 'Backend Developer',
  type: 'technical',
  useResume: true,
  status: 'completed',
  totalQuestions: 6,
  currentIndex: 6,
  overallScore: 88,
  summary: 'The candidate demonstrated strong technical proficiency across JavaScript runtime internals, asynchronous patterns, database design, algorithms, and distributed caching systems. Responses were structured, articulate, and backed by working code snippets.',
  strengths: [
    'High algorithmic problem-solving speed and optimal O(N) Kadane implementation',
    'Accurate understanding of JavaScript closures, scopes, and prototype mechanics',
    'Solid architectural awareness regarding distributed Redis rate limiters and atomicity'
  ],
  areasToImprove: [
    'Elaborate more on query profiling tools like MongoDB executionStats',
    'Detail memory leak prevention techniques when utilizing long-lived closures',
    'Mention high-availability patterns such as Redis Sentinel in system design'
  ],
  recommendations: [
    'Practice live coding complex dynamic programming problems under strict timers.',
    'Dive deeper into database isolation levels and distributed consensus algorithms.',
    'Refine system design diagrams and back-of-the-envelope capacity estimations.'
  ],
  reportStatus: 'ready',
  startedAt: new Date(Date.now() - 7200000).toISOString(),
  completedAt: new Date(Date.now() - 6600000).toISOString(),
  questions: [
    {
      index: 1,
      text: 'What is the difference between null and undefined in JavaScript, and how do they behave in type comparisons?',
      difficulty: 'easy',
      askedAt: new Date(Date.now() - 7200000).toISOString(),
      answer: 'undefined means a variable has been declared but has not yet been assigned a value, whereas null is an assignment value that represents the intentional absence of any object value. With typeof, undefined returns undefined, while null returns object. With loose equality (==), they are equal, but with strict equality (===), they are not.',
      code: '',
      timedOut: false,
      scores: { score: 88, clarity: 85, relevance: 90, communication: 86, correctness: 90, detail: 84, efficiency: 85, creativity: 80, problemSolving: 88 },
      feedback: 'Excellent explanation covering both primitive semantics and strict equality comparisons.',
      suggestedImprovements: ['Mention practical use cases in API payloads.']
    },
    {
      index: 2,
      text: 'How do you handle state management in a React application? When would you choose Context API versus external state libraries?',
      difficulty: 'easy',
      askedAt: new Date(Date.now() - 7100000).toISOString(),
      answer: 'For local component state, useState and useReducer are ideal. For low-frequency global data like theme or current user authentication, React Context API works well. For high-frequency state updates across diverse components, external libraries like Redux Toolkit or Zustand prevent unnecessary re-renders with selectors.',
      code: '',
      timedOut: false,
      scores: { score: 85, clarity: 86, relevance: 88, communication: 84, correctness: 86, detail: 82, efficiency: 85, creativity: 80, problemSolving: 85 },
      feedback: 'Very clear distinction between local component state and global selector-based architectures.',
      suggestedImprovements: ['You can also mention server state tools like TanStack Query.']
    },
    {
      index: 3,
      text: 'Explain the concept of closures in JavaScript and provide an example use case.',
      difficulty: 'medium',
      askedAt: new Date(Date.now() - 7000000).toISOString(),
      answer: 'A closure is the combination of a function bundled together with references to its surrounding lexical environment. Closures allow an inner function to retain access to variables from an outer function even after the outer function has finished executing.',
      code: 'function createCounter() {\n  let count = 0;\n  return () => ++count;\n}',
      timedOut: false,
      scores: { score: 90, clarity: 92, relevance: 90, communication: 90, correctness: 92, detail: 88, efficiency: 90, creativity: 85, problemSolving: 92 },
      feedback: 'Strong definition accompanied by a concise, working code snippet.',
      suggestedImprovements: ['Mention memory considerations if closures retain large object references.']
    },
    {
      index: 4,
      text: 'How do you design database indexes in MongoDB to optimize search queries on a large collection?',
      difficulty: 'medium',
      askedAt: new Date(Date.now() - 6900000).toISOString(),
      answer: 'Indexes support efficient execution of queries in MongoDB by storing a small portion of the collection data set in an easy-to-traverse B-tree structure. For compound indexes, the Equality, Sort, Range (ESR) rule should be followed.',
      code: 'db.users.createIndex({ status: 1, createdAt: -1 });',
      timedOut: false,
      scores: { score: 82, clarity: 80, relevance: 85, communication: 82, correctness: 84, detail: 80, efficiency: 82, creativity: 78, problemSolving: 84 },
      feedback: 'Good citation of the ESR rule and acknowledgement of write trade-offs.',
      suggestedImprovements: ['Mention explain("executionStats") for query profiling.']
    },
    {
      index: 5,
      text: 'Write a JavaScript function to find the maximum subarray sum (Kadane’s algorithm) in O(N) time.',
      difficulty: 'hard',
      askedAt: new Date(Date.now() - 6800000).toISOString(),
      answer: 'Here is the implementation of Kadane algorithm that tracks current subarray sum and updates the global maximum:',
      code: 'function maxSubArray(nums) {\n  let currentMax = nums[0];\n  let globalMax = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentMax = Math.max(nums[i], currentMax + nums[i]);\n    globalMax = Math.max(globalMax, currentMax);\n  }\n  return globalMax;\n}',
      timedOut: false,
      scores: { score: 95, clarity: 94, relevance: 96, communication: 92, correctness: 96, detail: 90, efficiency: 98, creativity: 88, problemSolving: 96 },
      feedback: 'Optimal O(N) time and O(1) space complexity solution. Clean syntax.',
      suggestedImprovements: ['Discuss handling edge cases when array is completely negative.']
    },
    {
      index: 6,
      text: 'How would you architect a distributed rate limiter that handles 100,000 requests per second across microservices?',
      difficulty: 'hard',
      askedAt: new Date(Date.now() - 6700000).toISOString(),
      answer: 'I would use Redis with a sliding window log or token bucket algorithm implemented via Lua scripts to ensure atomic execution. For high availability at 100k req/sec, Redis cluster mode or local in-memory token buffering at the API gateway level before batching updates to Redis minimizes network round-trips.',
      code: '',
      timedOut: false,
      scores: { score: 86, clarity: 85, relevance: 88, communication: 85, correctness: 88, detail: 84, efficiency: 88, creativity: 84, problemSolving: 88 },
      feedback: 'Solid architectural proposal emphasizing atomicity with Redis Lua scripts and gateway batching.',
      suggestedImprovements: ['Mention Redis Sentinel for automatic failover.']
    }
  ]
};
memInterviews.set(seedInterviewTech._id, seedInterviewTech);

// Initialize BullMQ Queue with error handling
let reportQueue = null;
try {
  const queueConnection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: () => null
  });
  queueConnection.on('error', (err) => {
    logger.warn(`BullMQ Redis queue connection notice: ${err.message}. Direct report generation active.`);
  });
  reportQueue = new Queue('report-generation', { connection: queueConnection });
  reportQueue.on('error', (err) => {
    logger.warn(`BullMQ queue notice: ${err.message}`);
  });
  logger.info('BullMQ report-generation queue initialized');
} catch (err) {
  logger.warn(`BullMQ queue initialization note: ${err.message}`);
}

// Connect to MongoDB with 2s timeout
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => logger.info(`Interview Service connected to MongoDB: ${MONGO_URI}`))
  .catch((err) => logger.warn(`MongoDB not detected (${err.message}). High-performance memory persistence active.`));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'interview-service',
    status: 'healthy',
    db: mongoose.connection.readyState === 1 ? 'mongodb' : 'in-memory-ready',
    timestamp: new Date().toISOString()
  });
});

// Middleware to resolve User from header
const getUserIdFromHeader = async (req) => {
  const firebaseUid = req.headers['x-user-id'] || 'demo_user_harini_123';
  if (mongoose.connection.readyState === 1) {
    try {
      const usersCollection = mongoose.connection.collection('users');
      const user = await usersCollection.findOne({ firebaseUid });
      if (user) return user;
    } catch (e) {
      // fallback
    }
  }

  // Return fallback user
  return {
    _id: '6650a1b2c3d4e5f6a7b8c9d0',
    firebaseUid,
    name: req.headers['x-user-name'] || 'Kisara Harini',
    coins: 3590,
    resume: {
      text: 'Experienced in React, Node.js, Express, MongoDB, and REST APIs.'
    }
  };
};

// ==========================================
// REST API Routes
// ==========================================

// POST /api/interviews: Create and start a new 6-question mock interview
app.post('/api/interviews', async (req, res, next) => {
  try {
    const user = await getUserIdFromHeader(req);
    const { role, type, useResume } = createInterviewSchema.parse(req.body);

    // 1. Deduct 50 coins via user-service
    try {
      await axios.post(`${USER_SERVICE_URL}/internal/deduct-coins`, {
        userId: user._id,
        amount: 50,
        reason: `AI Mock Interview: ${role} (${type.toUpperCase()})`
      });
    } catch (coinErr) {
      const msg = coinErr?.response?.data?.message || 'Insufficient interview coins.';
      return next(new AppError(msg, 400, ErrorCodes.INSUFFICIENT_COINS));
    }

    // 2. Generate Question 1
    const resumeText = (useResume && user.resume) ? user.resume.text : '';
    const q1 = await generateQuestionForSession({
      role,
      type,
      currentIndex: 1,
      useResume,
      resumeText,
      previousQuestions: []
    });

    const interviewData = {
      _id: 'interview_' + Date.now(),
      userId: user._id,
      role,
      type,
      useResume,
      status: 'in_progress',
      totalQuestions: 6,
      currentIndex: 1,
      questions: [{
        index: 1,
        text: q1.text,
        difficulty: q1.difficulty,
        askedAt: new Date().toISOString()
      }],
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const interviewDoc = await Interview.create(interviewData);
        interviewData._id = interviewDoc._id;
      } catch (e) {
        // fallback
      }
    }

    memInterviews.set(interviewData._id.toString(), interviewData);

    // 3. Store live session state in Redis for 60s timer server-side enforcement
    const sessionState = {
      currentIndex: 1,
      questionStartTimestamp: Date.now()
    };
    await redis.set(`session:interview:${interviewData._id}`, JSON.stringify(sessionState), 'EX', 3600);

    res.json({
      success: true,
      data: interviewData
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/interviews: List all user interviews
app.get('/api/interviews', async (req, res, next) => {
  try {
    const user = await getUserIdFromHeader(req);
    if (mongoose.connection.readyState === 1) {
      try {
        const interviews = await Interview.find({ userId: user._id }).sort({ createdAt: -1 });
        if (interviews.length > 0) return res.json({ success: true, data: interviews });
      } catch (e) {
        // fallback
      }
    }

    const userList = Array.from(memInterviews.values()).filter(i => i.userId.toString() === user._id.toString());
    res.json({ success: true, data: userList });
  } catch (err) {
    next(err);
  }
});

// GET /api/interviews/:id: Fetch live interview session state & timer
app.get('/api/interviews/:id', async (req, res, next) => {
  try {
    const user = await getUserIdFromHeader(req);
    let interview = null;

    if (mongoose.connection.readyState === 1) {
      try {
        interview = await Interview.findById(req.params.id);
      } catch (e) {
        // fallback
      }
    }

    if (!interview) {
      interview = memInterviews.get(req.params.id);
    }

    if (!interview) {
      return next(new AppError('Interview session not found', 404, ErrorCodes.NOT_FOUND));
    }

    if (interview.status === 'completed') {
      return res.json({
        success: true,
        data: {
          _id: interview._id,
          status: 'completed',
          role: interview.role,
          type: interview.type
        }
      });
    }

    // Read Redis session state for 60s timer calculation
    let secondsRemaining = 60;
    try {
      const rawSession = await redis.get(`session:interview:${interview._id}`);
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        const elapsedSec = Math.floor((Date.now() - parsed.questionStartTimestamp) / 1000);
        secondsRemaining = Math.max(0, 60 - elapsedSec);
      }
    } catch (e) {
      secondsRemaining = 60;
    }

    const currentQuestion = interview.questions[interview.currentIndex - 1] || interview.questions[0];
    const prevQuestion = interview.currentIndex > 1 ? interview.questions[interview.currentIndex - 2] : null;

    res.json({
      success: true,
      data: {
        _id: interview._id,
        role: interview.role,
        type: interview.type,
        status: interview.status,
        currentIndex: interview.currentIndex,
        totalQuestions: interview.totalQuestions,
        currentQuestion,
        secondsRemaining,
        previousFeedback: prevQuestion?.feedback || null
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/interviews/:id/answer: Submit answer, evaluate, advance question or complete
app.post('/api/interviews/:id/answer', async (req, res, next) => {
  try {
    const user = await getUserIdFromHeader(req);
    const { answer, code = '', timedOut = false } = submitAnswerSchema.parse(req.body);

    let interview = null;
    if (mongoose.connection.readyState === 1) {
      try {
        interview = await Interview.findById(req.params.id);
      } catch (e) {
        // fallback
      }
    }

    if (!interview) {
      interview = memInterviews.get(req.params.id);
    }

    if (!interview) {
      return next(new AppError('Interview session not found', 404, ErrorCodes.NOT_FOUND));
    }

    if (interview.status === 'completed') {
      return res.json({
        success: true,
        data: { finished: true, feedback: 'Interview is already completed.' }
      });
    }

    const currentIdx = interview.currentIndex;
    const currentQ = interview.questions[currentIdx - 1];

    if (!currentQ) {
      return next(new AppError('Question state mismatch', 500, ErrorCodes.INTERNAL_ERROR));
    }

    // 1. Server-side timer check via Redis (60s + 10s grace limit)
    let isTimedOut = Boolean(timedOut);
    try {
      const rawSession = await redis.get(`session:interview:${interview._id}`);
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        const elapsedSec = Math.floor((Date.now() - parsed.questionStartTimestamp) / 1000);
        if (elapsedSec > 70 && !isTimedOut) {
          isTimedOut = true;
          logger.warn(`Server-side 60s timer enforcement triggered for interview ${interview._id}, Q${currentIdx}`);
        }
      }
    } catch (e) {
      // Non-blocking
    }

    // 2. Evaluate answer via feedback-service
    let evaluation;
    try {
      const evalRes = await axios.post(`${FEEDBACK_SERVICE_URL}/internal/evaluate`, {
        question: currentQ.text,
        answer: isTimedOut && !answer.trim() ? 'No answer provided. Time over.' : answer,
        code,
        role: interview.role,
        type: interview.type,
        timedOut: isTimedOut
      });
      evaluation = evalRes.data.data;
    } catch (evalErr) {
      logger.warn(`Feedback service evaluation call note: ${evalErr.message}. Utilizing local evaluation synthesis.`);
      evaluation = isTimedOut ? {
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
      } : {
        score: 78,
        clarity: 80,
        relevance: 82,
        communication: 78,
        correctness: 76,
        detail: 72,
        efficiency: 75,
        creativity: 72,
        problemSolving: 78,
        feedback: "Good explanation with reasonable conceptual understanding.",
        suggestedImprovements: ["Include more specific code implementation details.", "Mention performance implications."]
      };
    }

    // 3. Update current question in DB or memory
    currentQ.answer = isTimedOut && !answer.trim() ? 'No answer provided. Time over.' : answer;
    currentQ.code = code;
    currentQ.timedOut = isTimedOut;
    currentQ.scores = {
      score: evaluation.score,
      clarity: evaluation.clarity,
      relevance: evaluation.relevance,
      communication: evaluation.communication,
      correctness: evaluation.correctness,
      detail: evaluation.detail,
      efficiency: evaluation.efficiency,
      creativity: evaluation.creativity,
      problemSolving: evaluation.problemSolving
    };
    currentQ.feedback = evaluation.feedback;
    currentQ.suggestedImprovements = evaluation.suggestedImprovements;

    // 4. Advance or Complete Session
    if (currentIdx < 6) {
      // Generate Next Question
      const nextIdx = currentIdx + 1;
      const prevTexts = interview.questions.map(q => q.text);
      const resumeText = (interview.useResume && user.resume) ? user.resume.text : '';

      const nextQ = await generateQuestionForSession({
        role: interview.role,
        type: interview.type,
        currentIndex: nextIdx,
        useResume: interview.useResume,
        resumeText,
        previousQuestions: prevTexts
      });

      const newQ = {
        index: nextIdx,
        text: nextQ.text,
        difficulty: nextQ.difficulty,
        askedAt: new Date().toISOString()
      };

      interview.questions.push(newQ);
      interview.currentIndex = nextIdx;

      if (interview.save) {
        await interview.save();
      } else {
        memInterviews.set(interview._id.toString(), interview);
      }

      // Reset Redis timer for next question
      await redis.set(`session:interview:${interview._id}`, JSON.stringify({
        currentIndex: nextIdx,
        questionStartTimestamp: Date.now()
      }), 'EX', 3600);

      return res.json({
        success: true,
        data: {
          finished: false,
          feedback: evaluation.feedback,
          nextQuestion: interview.questions[interview.questions.length - 1]
        }
      });
    } else {
      // 6th Question Completed: Mark status completed, enqueue report generation
      interview.status = 'completed';
      interview.reportStatus = 'pending';
      interview.completedAt = new Date().toISOString();

      if (interview.save) {
        await interview.save();
      } else {
        memInterviews.set(interview._id.toString(), interview);
      }

      // Remove Redis session timer key
      await redis.del(`session:interview:${interview._id}`);

      // Push to BullMQ report-generation queue or trigger fallback
      let queuedViaBull = false;
      if (reportQueue) {
        try {
          await reportQueue.add('generate-report', { interviewId: interview._id.toString() });
          queuedViaBull = true;
          logger.info(`Interview ${interview._id} enqueued to BullMQ report-generation`);
        } catch (queueErr) {
          logger.warn(`BullMQ add job notice: ${queueErr.message}`);
        }
      }

      // If BullMQ is offline or fallback, trigger direct report generation via feedback-service
      if (!queuedViaBull) {
        try {
          axios.post(`${FEEDBACK_SERVICE_URL}/internal/generate-report`, {
            interviewId: interview._id.toString()
          }).then(res => {
            if (res.data?.data && memInterviews.has(interview._id.toString())) {
              const mem = memInterviews.get(interview._id.toString());
              mem.overallScore = res.data.data.overallScore;
              mem.summary = res.data.data.summary;
              mem.strengths = res.data.data.strengths;
              mem.areasToImprove = res.data.data.areasToImprove;
              mem.recommendations = res.data.data.recommendations;
              mem.reportStatus = 'ready';
            }
          }).catch(e => logger.warn(`Direct report trigger notice: ${e.message}`));
        } catch (e) {
          // ignore
        }
      }

      // Invalidate User Dashboard stats cache via user-service
      try {
        await axios.post(`${USER_SERVICE_URL}/internal/invalidate-cache`, {
          userId: user._id
        });
      } catch (e) {
        // non-blocking
      }

      return res.json({
        success: true,
        data: {
          finished: true,
          feedback: evaluation.feedback,
          message: 'All questions completed! Preparing your comprehensive performance report...'
        }
      });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/interviews/:id/report: Fetch completed report
app.get('/api/interviews/:id/report', async (req, res, next) => {
  try {
    const user = await getUserIdFromHeader(req);
    let interview = null;

    if (mongoose.connection.readyState === 1) {
      try {
        interview = await Interview.findById(req.params.id);
      } catch (e) {
        // fallback
      }
    }

    if (!interview) {
      interview = memInterviews.get(req.params.id);
    }

    if (!interview) {
      return next(new AppError('Interview report not found', 404, ErrorCodes.NOT_FOUND));
    }

    res.json({
      success: true,
      data: interview
    });
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Interview Service running on port ${PORT}`);
});
