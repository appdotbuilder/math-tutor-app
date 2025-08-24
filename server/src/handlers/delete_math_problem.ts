import { db } from '../db';
import { mathProblemsTable } from '../db/schema';
import { type GetMathProblemByIdInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteMathProblem = async (input: GetMathProblemByIdInput): Promise<boolean> => {
  try {
    // Delete the math problem by ID
    const result = await db.delete(mathProblemsTable)
      .where(eq(mathProblemsTable.id, input.id))
      .execute();

    // Check if any rows were affected (i.e., if the problem existed and was deleted)
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Math problem deletion failed:', error);
    throw error;
  }
};