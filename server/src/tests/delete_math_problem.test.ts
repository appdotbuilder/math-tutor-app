import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { mathProblemsTable } from '../db/schema';
import { type GetMathProblemByIdInput, type CreateMathProblemInput } from '../schema';
import { deleteMathProblem } from '../handlers/delete_math_problem';
import { eq } from 'drizzle-orm';

// Test input for creating a math problem
const testMathProblem: CreateMathProblemInput = {
  title: 'Test Triangle Problem',
  question: 'Find the area of a right triangle with base 5 and height 3',
  type: 'triangle_rectangle',
  explanation: 'The area of a right triangle is (1/2) × base × height = (1/2) × 5 × 3 = 7.5',
  svg_content: '<svg width="200" height="200"><polygon points="50,150 150,150 150,50" fill="lightblue" stroke="black" stroke-width="2"/></svg>'
};

describe('deleteMathProblem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing math problem', async () => {
    // Create a test math problem first
    const createResult = await db.insert(mathProblemsTable)
      .values({
        title: testMathProblem.title,
        question: testMathProblem.question,
        type: testMathProblem.type,
        explanation: testMathProblem.explanation,
        svg_content: testMathProblem.svg_content
      })
      .returning()
      .execute();

    const createdProblem = createResult[0];
    
    // Delete the math problem
    const input: GetMathProblemByIdInput = { id: createdProblem.id };
    const result = await deleteMathProblem(input);

    // Should return true indicating successful deletion
    expect(result).toBe(true);

    // Verify the problem was actually deleted from the database
    const problems = await db.select()
      .from(mathProblemsTable)
      .where(eq(mathProblemsTable.id, createdProblem.id))
      .execute();

    expect(problems).toHaveLength(0);
  });

  it('should return false when trying to delete a non-existent math problem', async () => {
    // Try to delete a problem with an ID that doesn't exist
    const input: GetMathProblemByIdInput = { id: 999999 };
    const result = await deleteMathProblem(input);

    // Should return false indicating no problem was deleted
    expect(result).toBe(false);
  });

  it('should not affect other math problems when deleting one', async () => {
    // Create two test math problems
    const createResult1 = await db.insert(mathProblemsTable)
      .values({
        title: 'First Problem',
        question: testMathProblem.question,
        type: testMathProblem.type,
        explanation: testMathProblem.explanation,
        svg_content: testMathProblem.svg_content
      })
      .returning()
      .execute();

    const createResult2 = await db.insert(mathProblemsTable)
      .values({
        title: 'Second Problem',
        question: 'Find the area of a circle with radius 4',
        type: 'circle',
        explanation: 'The area of a circle is π × r² = π × 4² = 16π',
        svg_content: '<svg width="200" height="200"><circle cx="100" cy="100" r="50" fill="lightgreen" stroke="black" stroke-width="2"/></svg>'
      })
      .returning()
      .execute();

    const problem1 = createResult1[0];
    const problem2 = createResult2[0];

    // Delete only the first problem
    const input: GetMathProblemByIdInput = { id: problem1.id };
    const result = await deleteMathProblem(input);

    expect(result).toBe(true);

    // Verify the first problem was deleted
    const deletedProblem = await db.select()
      .from(mathProblemsTable)
      .where(eq(mathProblemsTable.id, problem1.id))
      .execute();

    expect(deletedProblem).toHaveLength(0);

    // Verify the second problem still exists
    const remainingProblem = await db.select()
      .from(mathProblemsTable)
      .where(eq(mathProblemsTable.id, problem2.id))
      .execute();

    expect(remainingProblem).toHaveLength(1);
    expect(remainingProblem[0].title).toBe('Second Problem');
  });

  it('should handle deletion of problems with different types', async () => {
    // Create problems with different types
    const circleResult = await db.insert(mathProblemsTable)
      .values({
        title: 'Circle Problem',
        question: 'Find the circumference of a circle with radius 5',
        type: 'circle',
        explanation: 'The circumference is 2πr = 2π(5) = 10π',
        svg_content: '<svg><circle cx="100" cy="100" r="50"/></svg>'
      })
      .returning()
      .execute();

    const squareResult = await db.insert(mathProblemsTable)
      .values({
        title: 'Square Problem',
        question: 'Find the area of a square with side length 6',
        type: 'square',
        explanation: 'The area is side² = 6² = 36',
        svg_content: '<svg><rect x="50" y="50" width="100" height="100"/></svg>'
      })
      .returning()
      .execute();

    // Delete the circle problem
    const input: GetMathProblemByIdInput = { id: circleResult[0].id };
    const result = await deleteMathProblem(input);

    expect(result).toBe(true);

    // Verify only the circle problem was deleted
    const allProblems = await db.select()
      .from(mathProblemsTable)
      .execute();

    expect(allProblems).toHaveLength(1);
    expect(allProblems[0].type).toBe('square');
    expect(allProblems[0].title).toBe('Square Problem');
  });
});