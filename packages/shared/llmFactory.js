import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { logger } from './logger.js';

/**
 * Creates an LLM instance based on environment configuration.
 * Supports: 'gemini' (default) or 'openai'.
 */
export function createLLM(options = {}) {
  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
  const temperature = options.temperature ?? 0.2;

  if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    logger.info('Initializing ChatOpenAI model');
    return new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature,
      ...options
    });
  }

  if (process.env.GEMINI_API_KEY) {
    logger.info('Initializing ChatGoogleGenerativeAI model (gemini-1.5-flash)');
    return new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      temperature,
      maxOutputTokens: 2048,
      ...options
    });
  }

  logger.warn('No LLM API key detected. Operating in intelligent AI synthesis fallback mode.');
  return null;
}

/**
 * Executes an LLM prompt expecting structured JSON matching a Zod schema.
 * Automatically retries once if JSON is invalid, and falls back to deterministic synthesis if LLM fails.
 */
export async function executeStructuredPrompt({
  prompt,
  schema,
  systemMessage = 'You are an expert AI interview and career mentor. Output ONLY valid JSON matching the schema.',
  fallbackGenerator,
  temperature = 0.2
}) {
  const llm = createLLM({ temperature });

  if (llm) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const fullPrompt = `${systemMessage}\n\nStrict Requirement: Return ONLY raw JSON without markdown code fences or backticks.\n\n${prompt}`;
        const response = await llm.invoke(fullPrompt);
        let rawContent = typeof response === 'string' ? response : response.content;

        // Clean any code block fences if returned
        if (typeof rawContent === 'string') {
          rawContent = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
        }

        const parsedJson = JSON.parse(rawContent);
        const validated = schema.parse(parsedJson);
        return validated;
      } catch (err) {
        logger.warn(`LLM JSON parse/validation error on attempt ${attempt}: ${err.message}`);
        if (attempt === 2) {
          logger.error('LLM failed structured validation after 2 attempts. Triggering fallback engine.');
        }
      }
    }
  }

  // Fallback to high quality deterministic synthesis
  if (typeof fallbackGenerator === 'function') {
    logger.info('Invoking realistic AI synthesis fallback engine.');
    const result = fallbackGenerator();
    return schema.parse(result);
  }

  throw new Error('LLM execution failed and no fallback generator was provided.');
}

