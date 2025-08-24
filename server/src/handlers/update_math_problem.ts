import { db } from '../db';
import { mathProblemsTable } from '../db/schema';
import { type UpdateMathProblemInput, type MathProblem } from '../schema';
import { eq } from 'drizzle-orm';

export const updateMathProblem = async (input: UpdateMathProblemInput): Promise<MathProblem | null> => {
  try {
    // Build the update object with only provided fields
    const updateData: Partial<typeof mathProblemsTable.$inferInsert> = {
      updated_at: new Date() // Always update the timestamp
    };

    // Only include fields that are provided in the input
    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.question !== undefined) {
      updateData.question = input.question;
    }
    if (input.type !== undefined) {
      updateData.type = input.type;
    }
    if (input.explanation !== undefined) {
      updateData.explanation = input.explanation;
    }
    if (input.svg_content !== undefined) {
      updateData.svg_content = input.svg_content;
    }

    // Update the math problem
    const result = await db.update(mathProblemsTable)
      .set(updateData)
      .where(eq(mathProblemsTable.id, input.id))
      .returning()
      .execute();

    // Return the updated record if found, null otherwise
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Math problem update failed:', error);
    throw error;
  }
};