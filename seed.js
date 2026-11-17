import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fresher_ai';

async function seed() {
  console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2500 });
    console.log('Connected to MongoDB successfully.');
  } catch (connErr) {
    console.log(`\nNote: MongoDB is currently offline or unreachable (${connErr.message}).`);
    console.log('Fresher.AI microservices have automated in-memory persistence and will serve seeded demo data automatically.');
    return;
  }

  const db = mongoose.connection.db;

  // 1. Seed Demo User: Kisara Harini
  const usersCollection = db.collection('users');
  const demoFirebaseUid = 'demo_user_harini_123';

  let user = await usersCollection.findOne({ firebaseUid: demoFirebaseUid });
  const userData = {
    firebaseUid: demoFirebaseUid,
    name: 'Kisara Harini',
    email: 'harini.kisara@college.edu',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    coins: 3590,
    resume: {
      fileName: 'Harini_Kisara_Resume.pdf',
      text: 'Kisara Harini. Computer Science and Engineering student proficient in JavaScript, TypeScript, React.js, Node.js, Express, MongoDB, and Redis. Built multi-agent AI systems and high-throughput REST APIs.',
      uploadedAt: new Date()
    },
    updatedAt: new Date()
  };

  if (user) {
    await usersCollection.updateOne({ _id: user._id }, { $set: userData });
    console.log(`Updated existing demo user: ${user._id}`);
  } else {
    userData.createdAt = new Date();
    const insertRes = await usersCollection.insertOne(userData);
    user = { _id: insertRes.insertedId, ...userData };
    console.log(`Created new demo user: ${user._id}`);
  }

  // 2. Clear previous demo interviews and transactions
  const interviewsCollection = db.collection('interviews');
  const coinTransactionsCollection = db.collection('cointransactions');
  const roadmapsCollection = db.collection('roadmaps');
  const resumeAnalysesCollection = db.collection('resumeanalyses');

  await interviewsCollection.deleteMany({ userId: user._id });
  await coinTransactionsCollection.deleteMany({ userId: user._id });
  await roadmapsCollection.deleteMany({ userId: user._id });
  await resumeAnalysesCollection.deleteMany({ userId: user._id });

  // 3. Seed Coin Transactions
  await coinTransactionsCollection.insertMany([
    {
      userId: user._id,
      amount: 1000,
      reason: 'Welcome bonus credit',
      balanceAfter: 1000,
      createdAt: new Date(Date.now() - 7 * 86400000)
    },
    {
      userId: user._id,
      amount: 3000,
      reason: 'Pro Pack Purchase (+3000)',
      balanceAfter: 4000,
      createdAt: new Date(Date.now() - 3 * 86400000)
    },
    {
      userId: user._id,
      amount: -50,
      reason: 'Mock Interview: Backend Developer (TECHNICAL)',
      balanceAfter: 3950,
      createdAt: new Date(Date.now() - 2 * 86400000)
    },
    {
      userId: user._id,
      amount: -50,
      reason: 'Mock Interview: Frontend Engineer (HR)',
      balanceAfter: 3900,
      createdAt: new Date(Date.now() - 1 * 86400000)
    }
  ]);

  // 4. Seed Completed Technical Interview
  const techQuestions = [
    {
      index: 1,
      text: 'What is the difference between null and undefined in JavaScript, and how do they behave in type comparisons?',
      difficulty: 'easy',
      askedAt: new Date(Date.now() - 7200000),
      answer: 'undefined means a variable has been declared but has not yet been assigned a value, whereas null is an assignment value that represents the intentional absence of any object value. With typeof, undefined returns undefined, while null returns object due to a legacy design. With loose equality (==), they are equal, but with strict equality (===), they are not.',
      code: '',
      timedOut: false,
      scores: {
        score: 88,
        clarity: 85,
        relevance: 90,
        communication: 86,
        correctness: 90,
        detail: 84,
        efficiency: 85,
        creativity: 80,
        problemSolving: 88
      },
      feedback: 'Excellent explanation covering both primitive semantics and strict equality comparisons.',
      suggestedImprovements: ['Mention practical use cases in API payloads.']
    },
    {
      index: 2,
      text: 'How do you handle state management in a React application? When would you choose Context API versus external state libraries?',
      difficulty: 'easy',
      askedAt: new Date(Date.now() - 7100000),
      answer: 'For local component state, useState and useReducer are ideal. For low-frequency global data like theme or current user authentication, React Context API works well. For high-frequency state updates across diverse components, external libraries like Redux Toolkit or Zustand prevent unnecessary re-renders with selectors.',
      code: '',
      timedOut: false,
      scores: {
        score: 85,
        clarity: 86,
        relevance: 88,
        communication: 84,
        correctness: 86,
        detail: 82,
        efficiency: 85,
        creativity: 80,
        problemSolving: 85
      },
      feedback: 'Very clear distinction between local component state and global selector-based architectures.',
      suggestedImprovements: ['You can also mention server state tools like TanStack Query.']
    },
    {
      index: 3,
      text: 'Explain the concept of closures in JavaScript and provide an example use case.',
      difficulty: 'medium',
      askedAt: new Date(Date.now() - 7000000),
      answer: 'A closure is the combination of a function bundled together with references to its surrounding lexical environment. Closures allow an inner function to retain access to variables from an outer function even after the outer function has finished executing. Common use cases include data privacy and factory functions.',
      code: 'function createCounter() {\n  let count = 0;\n  return () => ++count;\n}',
      timedOut: false,
      scores: {
        score: 90,
        clarity: 92,
        relevance: 90,
        communication: 90,
        correctness: 92,
        detail: 88,
        efficiency: 90,
        creativity: 85,
        problemSolving: 92
      },
      feedback: 'Strong definition accompanied by a concise, working code snippet.',
      suggestedImprovements: ['Mention memory considerations if closures retain large object references.']
    },
    {
      index: 4,
      text: 'How do you design database indexes in MongoDB to optimize search queries on a large collection?',
      difficulty: 'medium',
      askedAt: new Date(Date.now() - 6900000),
      answer: 'Indexes support efficient execution of queries in MongoDB by storing a small portion of the collection data set in an easy-to-traverse B-tree structure. For compound indexes, the Equality, Sort, Range (ESR) rule should be followed. While indexes speed up read queries dramatically, every index incurs write and storage overhead.',
      code: 'db.users.createIndex({ status: 1, createdAt: -1 });',
      timedOut: false,
      scores: {
        score: 82,
        clarity: 80,
        relevance: 85,
        communication: 82,
        correctness: 84,
        detail: 80,
        efficiency: 82,
        creativity: 78,
        problemSolving: 84
      },
      feedback: 'Good citation of the ESR rule and acknowledgement of write trade-offs.',
      suggestedImprovements: ['Mention explain("executionStats") for query profiling.']
    },
    {
      index: 5,
      text: 'Write a JavaScript function to find the maximum subarray sum (Kadane’s algorithm) in O(N) time.',
      difficulty: 'hard',
      askedAt: new Date(Date.now() - 6800000),
      answer: 'Here is the implementation of Kadane algorithm that tracks current subarray sum and updates the global maximum:',
      code: 'function maxSubArray(nums) {\n  let currentMax = nums[0];\n  let globalMax = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentMax = Math.max(nums[i], currentMax + nums[i]);\n    globalMax = Math.max(globalMax, currentMax);\n  }\n  return globalMax;\n}',
      timedOut: false,
      scores: {
        score: 95,
        clarity: 94,
        relevance: 96,
        communication: 92,
        correctness: 96,
        detail: 90,
        efficiency: 98,
        creativity: 88,
        problemSolving: 96
      },
      feedback: 'Optimal O(N) time and O(1) space complexity solution. Clean syntax.',
      suggestedImprovements: ['Discuss handling edge cases when array is completely negative.']
    },
    {
      index: 6,
      text: 'How would you architect a distributed rate limiter that handles 100,000 requests per second across microservices?',
      difficulty: 'hard',
      askedAt: new Date(Date.now() - 6700000),
      answer: 'I would use Redis with a sliding window log or token bucket algorithm implemented via Lua scripts to ensure atomic execution. For high availability at 100k req/sec, Redis cluster mode or local in-memory token buffering at the API gateway level before batching updates to Redis minimizes network round-trips.',
      code: '',
      timedOut: false,
      scores: {
        score: 86,
        clarity: 85,
        relevance: 88,
        communication: 85,
        correctness: 88,
        detail: 84,
        efficiency: 88,
        creativity: 84,
        problemSolving: 88
      },
      feedback: 'Solid architectural proposal emphasizing atomicity with Redis Lua scripts and gateway batching.',
      suggestedImprovements: ['Mention Redis Sentinel for automatic failover.']
    }
  ];

  await interviewsCollection.insertOne({
    userId: user._id,
    role: 'Backend Developer',
    type: 'technical',
    useResume: true,
    status: 'completed',
    totalQuestions: 6,
    currentIndex: 6,
    questions: techQuestions,
    overallScore: 88,
    summary: 'Kisara Harini demonstrated strong technical proficiency across JavaScript runtime internals, asynchronous patterns, database design, algorithms, and distributed caching systems. Her responses were structured, articulate, and backed by working code snippets.',
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
    startedAt: new Date(Date.now() - 7200000),
    completedAt: new Date(Date.now() - 6600000),
    createdAt: new Date(Date.now() - 7200000)
  });

  // 5. Seed Completed HR Interview
  const hrQuestions = [
    {
      index: 1,
      text: 'Tell me about yourself, your educational background, and what inspired you to pursue a career in software development.',
      difficulty: 'easy',
      askedAt: new Date(Date.now() - 17200000),
      answer: 'I am a final-year Computer Science engineering student. From an early age, I enjoyed building software and seeing ideas turn into working tools. Throughout college, I built multiple full-stack projects, completed an internship, and contributed to open source.',
      code: '',
      timedOut: false,
      scores: {
        score: 84,
        clarity: 88,
        relevance: 90,
        communication: 86,
        correctness: 82,
        detail: 80,
        efficiency: 80,
        creativity: 82,
        problemSolving: 80
      },
      feedback: 'Good introductory summary touching on academic background and practical passion.',
      suggestedImprovements: ['Highlight one landmark project early in your introduction.']
    },
    {
      index: 2,
      text: 'Describe a challenging situation in a team academic project where there was a disagreement. How did you handle it?',
      difficulty: 'easy',
      askedAt: new Date(Date.now() - 17100000),
      answer: 'During our capstone project, our team had conflicting opinions regarding whether to use SQL or MongoDB. Instead of debating subjectively, I scheduled a meeting where we listed our data access patterns, structured benchmark tests, and unanimously agreed that document-based storage was best suited.',
      code: '',
      timedOut: false,
      scores: {
        score: 88,
        clarity: 90,
        relevance: 92,
        communication: 90,
        correctness: 88,
        detail: 85,
        efficiency: 85,
        creativity: 85,
        problemSolving: 90
      },
      feedback: 'Strong conflict resolution example relying on data-driven benchmarking.',
      suggestedImprovements: ['Emphasize individual empathy alongside the benchmarks.']
    },
    {
      index: 3,
      text: 'How do you prioritize your time when facing multiple conflicting deadlines or exam schedules?',
      difficulty: 'medium',
      askedAt: new Date(Date.now() - 17000000),
      answer: 'I use the Eisenhower Matrix to categorize tasks by urgency and importance. I break big milestones into sprint tasks, communicate with project leads upfront if there is a scheduling risk, and eliminate low-priority distractions during crunch phases.',
      code: '',
      timedOut: false,
      scores: {
        score: 86,
        clarity: 88,
        relevance: 90,
        communication: 88,
        correctness: 86,
        detail: 82,
        efficiency: 86,
        creativity: 82,
        problemSolving: 86
      },
      feedback: 'Structured methodology demonstrating mature time-management habits.',
      suggestedImprovements: ['Cite an instance where proactive communication saved a deadline.']
    },
    {
      index: 4,
      text: 'Tell me about a time you made a significant mistake or bug in your code. What did you learn and how did you resolve it?',
      difficulty: 'medium',
      askedAt: new Date(Date.now() - 16900000),
      answer: 'During an internship, I deployed a change that overlooked a database index, causing query latency to spike. I immediately rolled back the deployment, reproduced the issue locally with realistic data, added the necessary compound index, and introduced automated performance regression tests.',
      code: '',
      timedOut: false,
      scores: {
        score: 92,
        clarity: 92,
        relevance: 94,
        communication: 92,
        correctness: 90,
        detail: 90,
        efficiency: 90,
        creativity: 88,
        problemSolving: 94
      },
      feedback: 'Outstanding ownership mindset with immediate remediation and regression prevention.',
      suggestedImprovements: ['None, great response.']
    },
    {
      index: 5,
      text: 'Where do you see yourself professionally in the next 3 to 5 years, and how does this role align with your aspirations?',
      difficulty: 'hard',
      askedAt: new Date(Date.now() - 16800000),
      answer: 'In the next 3 to 5 years, I aspire to grow from a junior engineer into an autonomous technical lead who designs resilient systems and mentors fresh hires. This role provides the ideal blend of high-scale challenges and collaborative culture to accelerate that trajectory.',
      code: '',
      timedOut: false,
      scores: {
        score: 85,
        clarity: 86,
        relevance: 88,
        communication: 88,
        correctness: 84,
        detail: 80,
        efficiency: 84,
        creativity: 82,
        problemSolving: 82
      },
      feedback: 'Clear trajectory balancing technical mastery with team leadership.',
      suggestedImprovements: ['Mention specific tech domains you want to master.']
    },
    {
      index: 6,
      text: 'Why do you want to join our organization, and what unique value do you bring as a fresh graduate?',
      difficulty: 'hard',
      askedAt: new Date(Date.now() - 16700000),
      answer: 'Your company is known for building high-impact consumer and developer products. As a fresh graduate, I bring immense curiosity, up-to-date knowledge of modern AI frameworks and cloud architectures, and a strong work ethic to contribute from day one.',
      code: '',
      timedOut: false,
      scores: {
        score: 86,
        clarity: 88,
        relevance: 90,
        communication: 88,
        correctness: 84,
        detail: 82,
        efficiency: 84,
        creativity: 85,
        problemSolving: 84
      },
      feedback: 'Enthusiastic and respectful closure with a clear value proposition.',
      suggestedImprovements: ['Mention specific company products or initiatives.']
    }
  ];

  await interviewsCollection.insertOne({
    userId: user._id,
    role: 'Junior Software Engineer',
    type: 'hr',
    useResume: false,
    status: 'completed',
    totalQuestions: 6,
    currentIndex: 6,
    questions: hrQuestions,
    overallScore: 87,
    summary: 'The candidate exhibited remarkable professionalism, structured thought processes, and proactive problem-solving abilities throughout the HR behavioral simulation.',
    strengths: [
      'High degree of personal accountability and honest mistake-ownership',
      'Data-driven collaborative mindset when resolving team disagreements',
      'Articulate communication aligned with industry STAR framework'
    ],
    areasToImprove: [
      'Mention specific product initiatives when answering why you want to join',
      'Balance technical data with interpersonal empathy in leadership scenarios'
    ],
    recommendations: [
      'Research company culture and recent releases before executive interviews.',
      'Keep a running achievement journal to quickly pull concrete stories.'
    ],
    reportStatus: 'ready',
    startedAt: new Date(Date.now() - 17200000),
    completedAt: new Date(Date.now() - 16600000),
    createdAt: new Date(Date.now() - 17200000)
  });

  // 6. Seed In-Progress Interview
  await interviewsCollection.insertOne({
    userId: user._id,
    role: 'Full Stack Engineer',
    type: 'technical',
    useResume: true,
    status: 'in_progress',
    totalQuestions: 6,
    currentIndex: 3,
    questions: [
      {
        index: 1,
        text: 'What are React Hooks and what problem did they solve compared to class components?',
        difficulty: 'easy',
        askedAt: new Date(Date.now() - 3600000),
        answer: 'React Hooks allow functional components to manage local state, lifecycle methods, and side effects without writing class components. They simplify state reuse through custom hooks.',
        code: '',
        timedOut: false,
        scores: { score: 85, clarity: 85, relevance: 88, communication: 82, correctness: 86, detail: 80, efficiency: 84, creativity: 80, problemSolving: 84 },
        feedback: 'Good fundamental definition.',
        suggestedImprovements: ['Mention avoid wrapper hell.']
      },
      {
        index: 2,
        text: 'How do you optimize slow database read queries in a MongoDB cluster?',
        difficulty: 'easy',
        askedAt: new Date(Date.now() - 3500000),
        answer: 'I use index optimization, projection to return only needed fields, and Redis in-memory caching.',
        code: '',
        timedOut: false,
        scores: { score: 80, clarity: 80, relevance: 85, communication: 80, correctness: 82, detail: 76, efficiency: 80, creativity: 75, problemSolving: 80 },
        feedback: 'Solid key points.',
        suggestedImprovements: ['Include explain plans.']
      },
      {
        index: 3,
        text: 'Explain how Node.js handles concurrent I/O operations despite having a single-threaded JavaScript execution context.',
        difficulty: 'medium',
        askedAt: new Date(Date.now() - 3400000),
        answer: '',
        code: '',
        timedOut: false
      }
    ],
    overallScore: 0,
    startedAt: new Date(Date.now() - 3600000),
    createdAt: new Date(Date.now() - 3600000)
  });

  // 7. Seed Sample Resume Analysis
  await resumeAnalysesCollection.insertOne({
    userId: user._id,
    fileName: 'Harini_Kisara_Resume.pdf',
    candidateName: 'Kisara Harini',
    detectedRole: 'Full Stack Developer',
    score: 85,
    label: 'Strong',
    strengths: [
      'Strong proficiency in modern JavaScript, TypeScript, React, and Node.js',
      'Solid architectural experience with microservices, Redis caching, and BullMQ',
      'Clean single-column ATS formatting with clear project descriptions'
    ],
    weaknesses: [
      'Could quantify metrics even further using the Google XYZ formula',
      'Include mentions of automated CI/CD pipeline deployments'
    ],
    missingSkills: [
      'Docker Containerization in Production',
      'Kubernetes Orchestration',
      'AWS CloudFormation / Terraform'
    ],
    recommendations: [
      'Highlight live URLs and GitHub repository links for all listed projects.',
      'Add numbers demonstrating % performance improvements or user load.',
      'Include automated testing frameworks (Jest, Playwright) in technical skills.'
    ],
    createdAt: new Date()
  });

  // 8. Seed Sample Roadmap
  await roadmapsCollection.insertOne({
    userId: user._id,
    targetRole: 'Full Stack Engineer',
    targetSalaryLPA: '15 LPA',
    usedResume: true,
    title: 'Full Stack Engineering Roadmap',
    difficulty: 'Intermediate',
    durationMonths: 12,
    modules: [
      {
        order: 1,
        title: 'Advanced JavaScript & TypeScript',
        durationMonths: 2,
        difficulty: 'Easy',
        description: 'Master strict typing, generics, utility types, and modern ES2024 features.',
        topics: ['Generics & Utility Types', 'Prototypes & Scopes', 'Asynchronous Flow', 'TS Config'],
        resources: ['TypeScript Handbook', 'Total TypeScript by Matt Pocock']
      },
      {
        order: 2,
        title: 'Modern Frontend Architecture',
        durationMonths: 2,
        difficulty: 'Medium',
        description: 'Scale React applications with custom hooks, Tailwind CSS, and performance profiling.',
        topics: ['React 18 Concurrent Mode', 'Custom Hooks', 'Tailwind CSS', 'Performance Optimization'],
        resources: ['React.dev', 'Web.dev Performance']
      },
      {
        order: 3,
        title: 'Backend Microservices & Node.js',
        durationMonths: 3,
        difficulty: 'Medium',
        description: 'Build modular, containerized Express and Fastify microservices with central error handling.',
        topics: ['Microservices Patterns', 'Express Middleware', 'Zod Validation', 'API Gateway'],
        resources: ['Microservices.io', 'Node.js Best Practices']
      },
      {
        order: 4,
        title: 'Database Mastery & In-Memory Caching',
        durationMonths: 2,
        difficulty: 'Hard',
        description: 'Architect MongoDB aggregations, PostgreSQL schemas, and Redis cache invalidation.',
        topics: ['MongoDB Aggregation Pipeline', 'Compound Indexes', 'Redis Caching Strategies', 'ACID Transactions'],
        resources: ['MongoDB University', 'Redis University']
      },
      {
        order: 5,
        title: 'Message Queues & Background Workers',
        durationMonths: 1,
        difficulty: 'Hard',
        description: 'Decouple CPU-intensive workloads using Redis and BullMQ asynchronous worker queues.',
        topics: ['BullMQ Queues', 'Job Retry Backoff', 'Worker Concurrency', 'Event-Driven Architectures'],
        resources: ['BullMQ Official Docs', 'Patterns of Distributed Systems']
      },
      {
        order: 6,
        title: 'DevOps & Cloud Deployment',
        durationMonths: 2,
        difficulty: 'Hard',
        description: 'Deploy resilient containerized workloads to AWS EC2 using Docker Compose.',
        topics: ['Docker Multi-Stage Builds', 'Docker Compose', 'Nginx Reverse Proxy', 'AWS EC2'],
        resources: ['Docker Documentation', 'AWS Free Tier Architecture']
      }
    ],
    createdAt: new Date()
  });

  console.log('Seed completed successfully! Demo user "Kisara Harini" is ready with full mock interviews and stats.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
