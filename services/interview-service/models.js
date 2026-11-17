import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  askedAt: { type: Date, default: Date.now },
  answer: { type: String, default: '' },
  code: { type: String, default: '' },
  timedOut: { type: Boolean, default: false },
  scores: {
    score: { type: Number, default: 0 },
    clarity: { type: Number, default: 0 },
    relevance: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    correctness: { type: Number, default: 0 },
    detail: { type: Number, default: 0 },
    efficiency: { type: Number, default: 0 },
    creativity: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 }
  },
  feedback: { type: String, default: '' },
  suggestedImprovements: [{ type: String }]
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['technical', 'hr'],
    required: true
  },
  useResume: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress',
    index: true
  },
  totalQuestions: {
    type: Number,
    default: 6
  },
  currentIndex: {
    type: Number,
    default: 1
  },
  questions: [questionSchema],
  overallScore: {
    type: Number,
    default: 0
  },
  summary: {
    type: String,
    default: ''
  },
  strengths: [{ type: String }],
  areasToImprove: [{ type: String }],
  recommendations: [{ type: String }],
  reportStatus: {
    type: String,
    enum: ['pending', 'ready', 'failed'],
    default: 'pending'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Compound indexes
interviewSchema.index({ userId: 1, createdAt: -1 });
interviewSchema.index({ userId: 1, status: 1, type: 1 });

export const Interview = mongoose.model('Interview', interviewSchema);

