import { db } from '../db';
import { mathProblemsTable } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { type MathProblem, type MathProblemType } from '../schema';

export const getRandomProblem = async (type?: MathProblemType): Promise<MathProblem | null> => {
  try {
    // Build query with proper conditional structure
    const baseQuery = db.select().from(mathProblemsTable);

    let results;
    if (type) {
      // Query with type filter
      results = await baseQuery
        .where(eq(mathProblemsTable.type, type))
        .orderBy(sql`RANDOM()`)
        .limit(1)
        .execute();
    } else {
      // Query without filter
      results = await baseQuery
        .orderBy(sql`RANDOM()`)
        .limit(1)
        .execute();
    }

    // Return null if no problems found
    if (results.length === 0) {
      return null;
    }

    // Return the random problem (dates are already Date objects from drizzle)
    return results[0];
  } catch (error) {
    console.error('Failed to fetch random problem:', error);
    throw error;
  }
};