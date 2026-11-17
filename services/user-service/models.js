import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  photoURL: {
    type: String,
    default: ''
  },
  coins: {
    type: Number,
    default: 1000,
    min: 0
  },
  resume: {
    fileName: { type: String, default: null },
    text: { type: String, default: null },
    uploadedAt: { type: Date, default: null }
  }
}, { timestamps: true });

const coinTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    default: 'Transaction'
  },
  balanceAfter: {
    type: Number,
    required: true
  }
}, { timestamps: { createdAt: true, updatedAt: false } });

export const User = mongoose.model('User', userSchema);
export const CoinTransaction = mongoose.model('CoinTransaction', coinTransactionSchema);

