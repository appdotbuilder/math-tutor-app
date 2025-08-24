import { db } from '../db';
import { mathProblemsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetMathProblemByIdInput, type SvgDownloadResponse } from '../schema';

export const downloadSvg = async (input: GetMathProblemByIdInput): Promise<SvgDownloadResponse | null> => {
  try {
    // Fetch math problem by ID
    const results = await db.select()
      .from(mathProblemsTable)
      .where(eq(mathProblemsTable.id, input.id))
      .execute();

    // Return null if problem not found
    if (results.length === 0) {
      return null;
    }

    const mathProblem = results[0];

    // Create sanitized filename from title and ID
    const sanitizedTitle = mathProblem.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    const filename = `math_problem_${input.id}_${sanitizedTitle}.svg`;

    return {
      filename,
      content: mathProblem.svg_content,
      mimeType: 'image/svg+xml'
    };
  } catch (error) {
    console.error('SVG download failed:', error);
    throw error;
  }
};