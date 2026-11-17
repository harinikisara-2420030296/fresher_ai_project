import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  logger,
  AppError,
  ErrorCodes,
  errorHandler,
  createRoadmapSchema,
  llmGenerateRoadmapSchema,
  executeStructuredPrompt
} from '@fresher-ai/shared';
import { Roadmap } from './models.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.ROADMAP_SERVICE_PORT || 5005;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fresher_ai';

app.use(helmet());
app.use(cors());
app.use(express.json());

// In-Memory Fallback
const memRoadmaps = new Map();

// Connect to MongoDB with 2s timeout
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => logger.info(`Roadmap Service connected to MongoDB: ${MONGO_URI}`))
  .catch((err) => logger.warn(`MongoDB not detected (${err.message}). High-performance memory persistence active.`));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'roadmap-service',
    status: 'healthy',
    db: mongoose.connection.readyState === 1 ? 'mongodb' : 'in-memory-ready',
    timestamp: new Date().toISOString()
  });
});

// User middleware via headers
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

  return {
    _id: '6650a1b2c3d4e5f6a7b8c9d0',
    firebaseUid,
    name: req.headers['x-user-name'] || 'Kisara Harini'
  };
};

// ==========================================
// REST API Routes
// ==========================================

// POST /api/roadmaps: Generate personalized roadmap
app.post('/api/roadmaps', async (req, res, next) => {
  try {
    const user = await getUserIdFromHeader(req);
    const { role, salaryLPA, useResume } = createRoadmapSchema.parse(req.body);

    const resumeContext = (useResume && user.resume) ? user.resume.text : '';

    const prompt = `You are a Career Architect and Senior Engineering Mentor.
Generate a structured, professional, chronological learning roadmap for:
Target Role: "${role}"
Target Salary Goal: "${salaryLPA}"
${resumeContext ? `Candidate Background / Existing Skills: "${resumeContext.slice(0, 1500)}"` : ''}

Generate between 8 and 10 sequential modules ordered from foundational to advanced.
Each module must have:
- order (1, 2, ...)
- title (e.g. "Introduction To HTML", "CSS Fundamentals", "JavaScript Basics", "DOM Manipulation")
- durationMonths (e.g. 1, 2)
- difficulty ("Easy", "Medium", or "Hard")
- description (concise 1-2 sentence overview)
- topics (array of 4-6 specific concepts to master)
- resources (array of 2-3 free authoritative resources, e.g. "MDN Web Docs", "freeCodeCamp", "roadmap.sh")

Output format: JSON matching the schema.`;

    const fallbackGenerator = () => {
      const isFrontend = /front|react|ui|web/i.test(role);
      const isMl = /ml|ai|machine|data/i.test(role);

      if (isFrontend) {
        return {
          title: 'Frontend Development Roadmap',
          difficulty: 'Intermediate',
          durationMonths: 12,
          modules: [
            {
              order: 1,
              title: 'Introduction To HTML',
              durationMonths: 1,
              difficulty: 'Easy',
              description: 'Master modern semantic HTML5 elements, accessibility principles, and document structuring.',
              topics: ['Semantic Tags', 'Forms & Validations', 'Accessibility (ARIA)', 'SEO Fundamentals'],
              resources: ['MDN HTML Guide', 'freeCodeCamp Responsive Web Design']
            },
            {
              order: 2,
              title: 'CSS Fundamentals',
              durationMonths: 2,
              difficulty: 'Easy',
              description: 'Learn modern styling, CSS Grid, Flexbox, responsive layouts, and Tailwind CSS.',
              topics: ['Box Model', 'Flexbox & CSS Grid', 'Tailwind CSS', 'Media Queries & Animations'],
              resources: ['CSS-Tricks Flexbox Guide', 'Tailwind CSS Official Docs']
            },
            {
              order: 3,
              title: 'JavaScript Basics',
              durationMonths: 2,
              difficulty: 'Easy',
              description: 'Deep dive into JavaScript syntax, ES6+ features, scope, closures, and data types.',
              topics: ['ES6 Syntax & Destructuring', 'Arrow Functions', 'Closures & Scopes', 'Prototypes'],
              resources: ['JavaScript.info', 'You Don\'t Know JS (Book)']
            },
            {
              order: 4,
              title: 'DOM Manipulation',
              durationMonths: 1,
              difficulty: 'Medium',
              description: 'Understand browser APIs, DOM events, bubbling, capturing, and dynamic DOM updates.',
              topics: ['Event Listeners & Delegation', 'DOM Traversal', 'Local & Session Storage', 'Canvas & Web APIs'],
              resources: ['MDN DOM Documentation', 'Wes Bos JS30']
            },
            {
              order: 5,
              title: 'Asynchronous JavaScript & APIs',
              durationMonths: 1,
              difficulty: 'Medium',
              description: 'Master asynchronous flows, Promises, async/await, and RESTful API consumption.',
              topics: ['Event Loop & Microtasks', 'Promises & Async/Await', 'Fetch & Axios', 'Error Handling'],
              resources: ['JavaScript Event Loop Explained', 'MDN Async JS']
            },
            {
              order: 6,
              title: 'React Core & Hooks',
              durationMonths: 2,
              difficulty: 'Medium',
              description: 'Build component-driven single page applications with React, custom hooks, and state management.',
              topics: ['JSX & Virtual DOM', 'useState & useEffect', 'Custom Hooks', 'React Router v6'],
              resources: ['React.dev Official Documentation', 'FullStackOpen']
            },
            {
              order: 7,
              title: 'State Management & Performance',
              durationMonths: 1,
              difficulty: 'Hard',
              description: 'Scale complex UI state with Context API, Redux Toolkit, and performance memoization.',
              topics: ['Context API', 'Redux Toolkit', 'useMemo & useCallback', 'Code Splitting & Lazy Loading'],
              resources: ['Redux Essentials Tutorial', 'Web.dev Performance']
            },
            {
              order: 8,
              title: 'Testing & Production Deployment',
              durationMonths: 2,
              difficulty: 'Hard',
              description: 'Test client applications with Jest & React Testing Library, and deploy to Vercel/AWS.',
              topics: ['Unit Testing with Jest', 'Component Testing with RTL', 'CI/CD GitHub Actions', 'Vercel Deployment'],
              resources: ['Testing Library Documentation', 'AWS S3 & CloudFront Hosting']
            }
          ]
        };
      }

      if (isMl) {
        return {
          title: 'Machine Learning & AI Engineering Roadmap',
          difficulty: 'Advanced',
          durationMonths: 14,
          modules: [
            {
              order: 1,
              title: 'Python for Data Science',
              durationMonths: 2,
              difficulty: 'Easy',
              description: 'Master Python syntax, object-oriented programming, and essential data libraries.',
              topics: ['NumPy Arrays', 'Pandas DataFrames', 'Matplotlib & Seaborn', 'Data Cleaning'],
              resources: ['Kaggle Python Course', 'Real Python']
            },
            {
              order: 2,
              title: 'Mathematics & Statistics',
              durationMonths: 2,
              difficulty: 'Medium',
              description: 'Linear algebra, multivariate calculus, probability distributions, and hypothesis testing.',
              topics: ['Matrix Decomposition', 'Gradient Descent Calculus', 'Bayes Theorem', 'Statistical Inference'],
              resources: ['3Blue1Brown Essence of Linear Algebra', 'Khan Academy Statistics']
            },
            {
              order: 3,
              title: 'Classical Machine Learning',
              durationMonths: 2,
              difficulty: 'Medium',
              description: 'Supervised and unsupervised algorithms using Scikit-Learn.',
              topics: ['Linear & Logistic Regression', 'Decision Trees & Random Forests', 'K-Means Clustering', 'Cross Validation'],
              resources: ['Scikit-Learn Documentation', 'Coursera Machine Learning Specialization']
            },
            {
              order: 4,
              title: 'Deep Learning & Neural Networks',
              durationMonths: 3,
              difficulty: 'Hard',
              description: 'Build and train neural networks using PyTorch and TensorFlow.',
              topics: ['Backpropagation', 'Convolutional Networks (CNN)', 'Recurrent Networks (RNN)', 'PyTorch Tensors'],
              resources: ['Fast.ai Practical Deep Learning', 'PyTorch Official Tutorials']
            },
            {
              order: 5,
              title: 'Transformers & Large Language Models',
              durationMonths: 3,
              difficulty: 'Hard',
              description: 'Understand attention mechanisms, HuggingFace transformers, and LLM fine-tuning.',
              topics: ['Self-Attention & Transformers', 'HuggingFace Ecosystem', 'PEFT & LoRA Fine-Tuning', 'LangChain Agents'],
              resources: ['The Illustrated Transformer', 'HuggingFace NLP Course']
            },
            {
              order: 6,
              title: 'MLOps & Model Deployment',
              durationMonths: 2,
              difficulty: 'Hard',
              description: 'Deploy models as scalable REST APIs using Docker, FastAPI, and cloud monitoring.',
              topics: ['FastAPI Serving', 'Docker Containers', 'MLflow Model Tracking', 'AWS SageMaker'],
              resources: ['Made With ML (MLOps Guide)', 'FastAPI Official Docs']
            }
          ]
        };
      }

      // Default: Backend Engineering Roadmap
      return {
        title: 'Backend Engineering Roadmap',
        difficulty: 'Intermediate',
        durationMonths: 12,
        modules: [
          {
            order: 1,
            title: 'Computer Science Fundamentals',
            durationMonths: 1,
            difficulty: 'Easy',
            description: 'Core foundations in computer networking, HTTP/HTTPS protocols, and OS concepts.',
            topics: ['TCP/IP & DNS', 'HTTP Methods & Status Codes', 'Processes & Threads', 'Memory Management'],
            resources: ['roadmap.sh/backend', 'CS50 Hard Harvard Online']
          },
          {
            order: 2,
            title: 'Node.js & Runtime Internals',
            durationMonths: 2,
            difficulty: 'Easy',
            description: 'Master Node.js runtime, event loop, buffer streams, and modular architectures.',
            topics: ['Libuv & Event Loop', 'Node Streams & Buffers', 'File System Operations', 'ES Modules vs CommonJS'],
            resources: ['Node.js Official Documentation', 'Node.js Design Patterns']
          },
          {
            order: 3,
            title: 'REST API Design with Express',
            durationMonths: 2,
            difficulty: 'Medium',
            description: 'Build production-grade REST APIs, middleware chains, input validation, and security headers.',
            topics: ['Express Routing & Middleware', 'Zod Validation', 'Helmet & CORS Security', 'Central Error Handling'],
            resources: ['Express.js Guide', 'RESTful API Best Practices']
          },
          {
            order: 4,
            title: 'Relational & NoSQL Databases',
            durationMonths: 2,
            difficulty: 'Medium',
            description: 'Design schemas, indexes, and transactions in MongoDB (Mongoose) and PostgreSQL.',
            topics: ['MongoDB Aggregations', 'Index Types (Compound, TTL)', 'Mongoose Models', 'ACID Transactions'],
            resources: ['MongoDB University', 'Use The Index, Luke!']
          },
          {
            order: 5,
            title: 'Authentication & Authorization',
            durationMonths: 1,
            difficulty: 'Medium',
            description: 'Implement JWT tokens, OAuth2, Firebase Auth, password hashing, and role-based access.',
            topics: ['JWT Verification', 'bcrypt Password Hashing', 'Role-Based Access Control (RBAC)', 'Session Security'],
            resources: ['OWASP Top 10 API Security', 'Auth0 Architecture Guide']
          },
          {
            order: 6,
            title: 'Caching & Message Queues',
            durationMonths: 2,
            difficulty: 'Hard',
            description: 'Scale backend throughput using Redis caching and BullMQ background asynchronous workers.',
            topics: ['Redis In-Memory Key-Values', 'Cache Invalidation Strategies', 'BullMQ Job Queues', 'Rate Limiting'],
            resources: ['Redis Official University', 'BullMQ Documentation']
          },
          {
            order: 7,
            title: 'Microservices & Dockerization',
            durationMonths: 2,
            difficulty: 'Hard',
            description: 'Split monoliths into resilient microservices communicating over HTTP and Docker Compose.',
            topics: ['API Gateway Pattern', 'Service Discovery', 'Docker Multi-Stage Builds', 'Docker Compose Orchestration'],
            resources: ['Microservices.io Patterns', 'Docker Docs']
          }
        ]
      };
    };

    const roadmapData = await executeStructuredPrompt({
      prompt,
      schema: llmGenerateRoadmapSchema,
      systemMessage: 'You are an elite Engineering Career Mentor. Output ONLY valid JSON.',
      fallbackGenerator,
      temperature: 0.2
    });

    const roadmapDoc = {
      _id: 'roadmap_' + Date.now(),
      userId: user._id,
      targetRole: role,
      targetSalaryLPA: salaryLPA,
      usedResume: Boolean(useResume),
      title: roadmapData.title,
      difficulty: roadmapData.difficulty,
      durationMonths: roadmapData.durationMonths,
      modules: roadmapData.modules,
      createdAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await Roadmap.create(roadmapDoc);
        roadmapDoc._id = doc._id;
      } catch (e) {
        // fallback
      }
    }

    memRoadmaps.set(roadmapDoc._id.toString(), roadmapDoc);

    res.json({ success: true, data: roadmapDoc });
  } catch (err) {
    next(err);
  }
});

// GET /api/roadmaps: List user roadmaps
app.get('/api/roadmaps', async (req, res, next) => {
  try {
    const user = await getUserIdFromHeader(req);
    if (mongoose.connection.readyState === 1) {
      try {
        const roadmaps = await Roadmap.find({ userId: user._id }).sort({ createdAt: -1 });
        if (roadmaps.length > 0) return res.json({ success: true, data: roadmaps });
      } catch (e) {
        // fallback
      }
    }

    const list = Array.from(memRoadmaps.values()).filter(r => r.userId.toString() === user._id.toString());
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

// GET /api/roadmaps/:id: Get specific roadmap
app.get('/api/roadmaps/:id', async (req, res, next) => {
  try {
    const user = await getUserIdFromHeader(req);
    let roadmap = null;

    if (mongoose.connection.readyState === 1) {
      try {
        roadmap = await Roadmap.findById(req.params.id);
      } catch (e) {
        // fallback
      }
    }

    if (!roadmap) {
      roadmap = memRoadmaps.get(req.params.id);
    }

    if (!roadmap) {
      return next(new AppError('Roadmap not found', 404, ErrorCodes.NOT_FOUND));
    }

    res.json({ success: true, data: roadmap });
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Roadmap Service running on port ${PORT}`);
});
