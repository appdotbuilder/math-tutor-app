import { db } from '../db';
import { mathProblemsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetMathProblemByIdInput, type MathProblem } from '../schema';

export const getMathProblemById = async (input: GetMathProblemByIdInput): Promise<MathProblem | null> => {
  try {
    // Query for the math problem by ID
    const results = await db.select()
      .from(mathProblemsTable)
      .where(eq(mathProblemsTable.id, input.id))
      .execute();

    // Return the first result if found, otherwise null
    if (results.length === 0) {
      return null;
    }

    const problem = results[0];
    return {
      id: problem.id,
      title: problem.title,
      question: problem.question,
      type: problem.type,
      explanation: problem.explanation,
      svg_content: problem.svg_content,
      created_at: problem.created_at,
      updated_at: problem.updated_at
    };
  } catch (error) {
    console.error('Failed to get math problem by ID:', error);
    throw error;
  }
};