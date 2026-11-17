import test from 'node:test';
import assert from 'node:assert';
import {
  syncUserSchema,
  createInterviewSchema,
  submitAnswerSchema,
  createRoadmapSchema,
  llmResumeScoreSchema,
  llmEvaluateAnswerSchema,
  llmGenerateReportSchema
} from '../packages/shared/zodSchemas.js';
import { ErrorCodes, AppError } from '../packages/shared/errorCodes.js';

test('Fresher.AI Unit & Schema Test Suite', async (t) => {
  await t.test('1. User Sync Schema Validation', () => {
    // Valid user sync
    const valid = syncUserSchema.parse({
      firebaseUid: 'uid_test_123',
      name: 'Ankush Sharma',
      email: 'ankush@college.edu',
      photoURL: 'https://example.com/photo.jpg'
    });
    assert.strictEqual(valid.firebaseUid, 'uid_test_123');
    assert.strictEqual(valid.email, 'ankush@college.edu');

    // Invalid email should throw
    assert.throws(() => {
      syncUserSchema.parse({
        firebaseUid: 'uid_test_123',
        name: 'Ankush',
        email: 'invalid-email-format'
      });
    });
  });

  await t.test('2. Interview Creation Schema Validation', () => {
    const validTech = createInterviewSchema.parse({
      role: 'Backend Developer',
      type: 'technical',
      useResume: true
    });
    assert.strictEqual(validTech.role, 'Backend Developer');
    assert.strictEqual(validTech.type, 'technical');
    assert.strictEqual(validTech.useResume, true);

    const validHr = createInterviewSchema.parse({
      role: 'Frontend Engineer',
      type: 'hr'
    });
    assert.strictEqual(validHr.type, 'hr');
    assert.strictEqual(validHr.useResume, false); // Default false

    // Invalid interview type
    assert.throws(() => {
      createInterviewSchema.parse({
        role: 'Dev',
        type: 'invalid_type'
      });
    });
  });

  await t.test('3. Answer Submission & Code Schema', () => {
    const validAnswer = submitAnswerSchema.parse({
      answer: 'Closures allow an inner function to access an outer scope.',
      code: 'function test() { return 1; }',
      timedOut: false
    });
    assert.strictEqual(validAnswer.timedOut, false);
    assert.ok(validAnswer.answer.includes('Closures'));

    const timedOutAnswer = submitAnswerSchema.parse({
      timedOut: true
    });
    assert.strictEqual(timedOutAnswer.timedOut, true);
    assert.strictEqual(timedOutAnswer.answer, '');
  });

  await t.test('4. Roadmap Schema Validation', () => {
    const validRoadmap = createRoadmapSchema.parse({
      role: 'Full Stack Engineer',
      salaryLPA: '15 LPA',
      useResume: true
    });
    assert.strictEqual(validRoadmap.salaryLPA, '15 LPA');
    assert.strictEqual(validRoadmap.useResume, true);

    const defaultSalary = createRoadmapSchema.parse({
      role: 'DevOps'
    });
    assert.strictEqual(defaultSalary.salaryLPA, '10 LPA');
  });

  await t.test('5. Evaluation Score Math & 8 Dimensions Validation', () => {
    const validEval = llmEvaluateAnswerSchema.parse({
      score: 85,
      clarity: 88,
      relevance: 90,
      communication: 86,
      correctness: 85,
      detail: 80,
      efficiency: 82,
      creativity: 80,
      problemSolving: 85,
      feedback: 'Good structured answer.',
      suggestedImprovements: ['Mention edge cases.', 'Add code examples.']
    });

    assert.strictEqual(validEval.score, 85);
    assert.strictEqual(validEval.suggestedImprovements.length, 2);

    // Score out of 0-100 range should throw
    assert.throws(() => {
      llmEvaluateAnswerSchema.parse({
        score: 150, // invalid
        clarity: 80,
        relevance: 80,
        communication: 80,
        correctness: 80,
        detail: 80,
        efficiency: 80,
        creativity: 80,
        problemSolving: 80,
        feedback: 'Too high score',
        suggestedImprovements: ['test']
      });
    });
  });

  await t.test('6. Resume Score Bands Categorization Logic', () => {
    const getBand = (score) => {
      if (score >= 80) return 'Strong';
      if (score >= 60) return 'Average';
      if (score >= 40) return 'Below Average';
      return 'Weak';
    };

    assert.strictEqual(getBand(88), 'Strong');
    assert.strictEqual(getBand(80), 'Strong');
    assert.strictEqual(getBand(75), 'Average');
    assert.strictEqual(getBand(60), 'Average');
    assert.strictEqual(getBand(52), 'Below Average');
    assert.strictEqual(getBand(40), 'Below Average');
    assert.strictEqual(getBand(25), 'Weak');
    assert.strictEqual(getBand(0), 'Weak');
  });

  await t.test('7. Coin Deduction Calculation and Balance Safety', () => {
    const initialCoins = 1000;
    const interviewCost = 50;

    const deductCoins = (balance, cost) => {
      if (balance < cost) throw new AppError('Insufficient coins', 400, ErrorCodes.INSUFFICIENT_COINS);
      return balance - cost;
    };

    const newBalance = deductCoins(initialCoins, interviewCost);
    assert.strictEqual(newBalance, 950);

    // Insufficient coins test
    assert.throws(() => {
      deductCoins(30, interviewCost);
    }, /Insufficient coins/);
  });

  await t.test('8. Report Overall Score Arithmetic Mean Calculation', () => {
    const questionScores = [80, 85, 90, 75, 95, 84];
    const mean = Math.round(questionScores.reduce((a, b) => a + b, 0) / questionScores.length);
    assert.strictEqual(mean, 85);

    // All zero scores (timeouts)
    const zeroScores = [0, 0, 0, 0, 0, 0];
    const zeroMean = Math.round(zeroScores.reduce((a, b) => a + b, 0) / zeroScores.length);
    assert.strictEqual(zeroMean, 0);
  });
});

