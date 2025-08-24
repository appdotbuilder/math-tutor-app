import { db } from '../db';
import { mathProblemsTable } from '../db/schema';
import { type CreateMathProblemInput, type MathProblem } from '../schema';

export const createMathProblem = async (input: CreateMathProblemInput): Promise<MathProblem> => {
  try {
    // Insert math problem record
    const result = await db.insert(mathProblemsTable)
      .values({
        title: input.title,
        question: input.question,
        type: input.type,
        explanation: input.explanation,
        svg_content: input.svg_content
        // created_at and updated_at will be set automatically by database defaults
      })
      .returning()
      .execute();

    // Return the created math problem
    return result[0];
  } catch (error) {
    console.error('Math problem creation failed:', error);
    throw error;
  }
};