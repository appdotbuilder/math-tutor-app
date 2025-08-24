import { db } from '../db';
import { mathProblemsTable } from '../db/schema';
import { type GetMathProblemsInput, type MathProblem } from '../schema';
import { eq, desc } from 'drizzle-orm';
import { SQL } from 'drizzle-orm';

export const getMathProblems = async (input?: GetMathProblemsInput): Promise<MathProblem[]> => {
  try {
    // Set pagination defaults
    const limit = input?.limit ?? 50;
    const offset = input?.offset ?? 0;

    // Build query in a single chain based on whether type filter is provided
    const results = input?.type
      ? await db.select()
          .from(mathProblemsTable)
          .where(eq(mathProblemsTable.type, input.type))
          .orderBy(desc(mathProblemsTable.created_at))
          .limit(limit)
          .offset(offset)
          .execute()
      : await db.select()
          .from(mathProblemsTable)
          .orderBy(desc(mathProblemsTable.created_at))
          .limit(limit)
          .offset(offset)
          .execute();

    // Return results (no numeric conversion needed for this table)
    return results;
  } catch (error) {
    console.error('Failed to fetch math problems:', error);
    throw error;
  }
};