import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  candidateName: {
    type: String,
    default: 'Candidate'
  },
  detectedRole: {
    type: String,
    default: 'Software Engineer'
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  label: {
    type: String,
    enum: ['Weak', 'Below Average', 'Average', 'Strong'],
    required: true
  },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  missingSkills: [{ type: String }],
  recommendations: [{ type: String }]
}, { timestamps: true });

const resumeDraftSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  data: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

export const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
export const ResumeDraft = mongoose.model('ResumeDraft', resumeDraftSchema);

