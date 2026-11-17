import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  title: { type: String, required: true },
  durationMonths: { type: Number, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  description: { type: String, required: true },
  topics: [{ type: String }],
  resources: [{ type: String }]
}, { _id: false });

const roadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetRole: {
    type: String,
    required: true,
    trim: true
  },
  targetSalaryLPA: {
    type: String,
    default: '10 LPA'
  },
  usedResume: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  durationMonths: {
    type: Number,
    default: 12
  },
  modules: [moduleSchema]
}, { timestamps: true });

export const Roadmap = mongoose.model('Roadmap', roadmapSchema);

