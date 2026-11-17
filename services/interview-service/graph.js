import { executeStructuredPrompt, llmGenerateQuestionSchema, logger } from '@fresher-ai/shared';

export async function generateQuestionForSession({
  role,
  type,
  currentIndex,
  useResume,
  resumeText,
  previousQuestions = []
}) {
  const difficulty = currentIndex <= 2 ? 'easy' : currentIndex <= 4 ? 'medium' : 'hard';

  const prompt = `You are a Senior Technical Interviewer and Engineering Lead conducting a mock interview for the role of "${role}".
Interview Type: "${type}".
Question Number: ${currentIndex} of 6.
Current Difficulty Level: "${difficulty}".
${useResume && resumeText ? `Candidate Resume Context: "${resumeText.slice(0, 1500)}"` : ''}
Previous Questions Asked: ${JSON.stringify(previousQuestions)}

Requirement:
Generate a single, realistic, and highly relevant interview question.
- If Technical: Ask role-specific concepts, algorithms, APIs, or architectural decisions suitable for ${difficulty} level. For Q5 or Q6, include a practical coding or design challenge that invites the candidate to write code.
- If HR: Ask realistic behavioral or situational questions tailored to a fresher or junior engineer.
- If Resume is provided: personalize the question by referencing their projects, tech stack, or experience.
- Do NOT repeat previous questions.
Output format: JSON matching { "question": "..." }`;

  const fallbackGenerator = () => {
    if (type === 'hr') {
      const hrBank = [
        `Tell me about yourself, your educational journey, and what motivated you to pursue a career as a ${role}.`,
        `Describe a team project where you encountered a major disagreement or bottleneck. How did you resolve it?`,
        `How do you organize your tasks and maintain quality when facing tight project deadlines?`,
        `Tell me about a time you received constructive criticism or failed on a coding task. What did you learn from that experience?`,
        `Where do you see your technical growth in the next 3 years, and how do you plan to achieve it?`,
        `Why are you interested in this ${role} position, and what unique strengths do you bring to our team?`
      ];
      return { question: hrBank[currentIndex - 1] || hrBank[0] };
    }

    // Technical Bank
    const techBank = [
      `What is the difference between synchronous and asynchronous execution in JavaScript, and how does the Event Loop handle Promise microtasks?`,
      `How do you manage component state and side effects in React? When would you use Context API versus dedicated state management libraries?`,
      `Explain the concept of database indexing in MongoDB or SQL. How does an index improve read performance, and what are its trade-offs?`,
      `Describe how you would implement secure user authentication and session management in an Express.js REST API.`,
      `Coding Question: Write a JavaScript function to reverse words in a string in-place or detect a palindrome, optimizing for O(N) time. Please use the </> code editor to include your solution.`,
      `System Design: How would you design a caching layer using Redis to prevent database bottlenecks during sudden traffic spikes?`
    ];

    let baseQuestion = techBank[currentIndex - 1] || techBank[0];

    // Personalize with resume if requested
    if (useResume && resumeText && (currentIndex === 2 || currentIndex === 4)) {
      baseQuestion = `I see on your resume that you built applications using modern web technologies. How did you architect the state flow and handle edge-case error scenarios in your featured project?`;
    }

    return { question: baseQuestion };
  };

  try {
    const result = await executeStructuredPrompt({
      prompt,
      schema: llmGenerateQuestionSchema,
      systemMessage: 'You are an elite Technical Hiring Manager. Output ONLY valid JSON.',
      fallbackGenerator,
      temperature: 0.3
    });

    return {
      text: result.question,
      difficulty
    };
  } catch (err) {
    logger.warn(`Question generation error: ${err.message}. Using fallback question.`);
    const fallback = fallbackGenerator();
    return {
      text: fallback.question,
      difficulty
    };
  }
}

