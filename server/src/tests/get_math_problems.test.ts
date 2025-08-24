import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { mathProblemsTable } from '../db/schema';
import { type GetMathProblemsInput, type CreateMathProblemInput } from '../schema';
import { getMathProblems } from '../handlers/get_math_problems';
import { eq } from 'drizzle-orm';

// Helper function to create test math problems
const createTestMathProblem = async (overrides: Partial<CreateMathProblemInput> = {}) => {
  const defaultProblem: CreateMathProblemInput = {
    title: 'Test Math Problem',
    question: 'What is 2 + 2?',
    type: 'triangle_rectangle',
    explanation: 'Add the numbers together: 2 + 2 = 4',
    svg_content: '<svg><circle cx="50" cy="50" r="40"/></svg>'
  };

  const problem = { ...defaultProblem, ...overrides };

  const result = await db.insert(mathProblemsTable)
    .values({
      title: problem.title,
      question: problem.question,
      type: problem.type,
      explanation: problem.explanation,
      svg_content: problem.svg_content
    })
    .returning()
    .execute();

  return result[0];
};

describe('getMathProblems', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no problems exist', async () => {
    const result = await getMathProblems();

    expect(result).toEqual([]);
  });

  it('should return all math problems without filters', async () => {
    // Create test problems
    await createTestMathProblem({
      title: 'Triangle Problem',
      type: 'triangle_rectangle'
    });
    await createTestMathProblem({
      title: 'Circle Problem',
      type: 'circle'
    });

    const result = await getMathProblems();

    expect(result).toHaveLength(2);
    expect(result[0].title).toBeDefined();
    expect(result[0].question).toBeDefined();
    expect(result[0].type).toBeDefined();
    expect(result[0].explanation).toBeDefined();
    expect(result[0].svg_content).toBeDefined();
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should filter problems by type', async () => {
    // Create different types of problems
    await createTestMathProblem({
      title: 'Triangle Problem',
      type: 'triangle_rectangle'
    });
    await createTestMathProblem({
      title: 'Circle Problem',
      type: 'circle'
    });
    await createTestMathProblem({
      title: 'Another Triangle',
      type: 'triangle_rectangle'
    });

    const input: GetMathProblemsInput = {
      type: 'triangle_rectangle'
    };

    const result = await getMathProblems(input);

    expect(result).toHaveLength(2);
    result.forEach(problem => {
      expect(problem.type).toEqual('triangle_rectangle');
    });
  });

  it('should apply pagination with limit', async () => {
    // Create multiple problems
    for (let i = 1; i <= 5; i++) {
      await createTestMathProblem({
        title: `Problem ${i}`,
        type: 'square'
      });
    }

    const input: GetMathProblemsInput = {
      limit: 3
    };

    const result = await getMathProblems(input);

    expect(result).toHaveLength(3);
  });

  it('should apply pagination with offset', async () => {
    // Create multiple problems
    const problems = [];
    for (let i = 1; i <= 5; i++) {
      const problem = await createTestMathProblem({
        title: `Problem ${i}`,
        type: 'rectangle'
      });
      problems.push(problem);
    }

    // Get first 2 problems
    const firstBatch = await getMathProblems({ limit: 2, offset: 0 });
    expect(firstBatch).toHaveLength(2);

    // Get next 2 problems
    const secondBatch = await getMathProblems({ limit: 2, offset: 2 });
    expect(secondBatch).toHaveLength(2);

    // Ensure no overlap
    const firstIds = firstBatch.map(p => p.id);
    const secondIds = secondBatch.map(p => p.id);
    expect(firstIds.every(id => !secondIds.includes(id))).toBe(true);
  });

  it('should combine type filter with pagination', async () => {
    // Create mixed types of problems
    await createTestMathProblem({ title: 'Triangle 1', type: 'triangle_rectangle' });
    await createTestMathProblem({ title: 'Circle 1', type: 'circle' });
    await createTestMathProblem({ title: 'Triangle 2', type: 'triangle_rectangle' });
    await createTestMathProblem({ title: 'Triangle 3', type: 'triangle_rectangle' });
    await createTestMathProblem({ title: 'Circle 2', type: 'circle' });

    const input: GetMathProblemsInput = {
      type: 'triangle_rectangle',
      limit: 2,
      offset: 1
    };

    const result = await getMathProblems(input);

    expect(result).toHaveLength(2);
    result.forEach(problem => {
      expect(problem.type).toEqual('triangle_rectangle');
    });
  });

  it('should return problems ordered by created_at descending', async () => {
    // Create problems with small delays to ensure different timestamps
    const problem1 = await createTestMathProblem({ title: 'First Problem' });
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const problem2 = await createTestMathProblem({ title: 'Second Problem' });

    const result = await getMathProblems();

    expect(result).toHaveLength(2);
    // Most recent should be first (descending order)
    expect(result[0].created_at.getTime()).toBeGreaterThanOrEqual(result[1].created_at.getTime());
  });

  it('should handle all problem types correctly', async () => {
    const problemTypes = [
      'triangle_rectangle',
      'triangle_equilateral',
      'square',
      'rectangle',
      'circle',
      'arc'
    ] as const;

    // Create one problem of each type
    for (const type of problemTypes) {
      await createTestMathProblem({
        title: `${type} Problem`,
        type: type
      });
    }

    // Test filtering for each type
    for (const type of problemTypes) {
      const result = await getMathProblems({ type });
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toEqual(type);
      expect(result[0].title).toEqual(`${type} Problem`);
    }
  });

  it('should save problems to database correctly', async () => {
    const testProblem = await createTestMathProblem({
      title: 'Database Test Problem',
      question: 'How to test databases?',
      type: 'circle',
      explanation: 'Create test cases with assertions',
      svg_content: '<svg><rect width="100" height="50"/></svg>'
    });

    // Query directly from database to verify
    const dbProblems = await db.select()
      .from(mathProblemsTable)
      .where(eq(mathProblemsTable.id, testProblem.id))
      .execute();

    expect(dbProblems).toHaveLength(1);
    expect(dbProblems[0].title).toEqual('Database Test Problem');
    expect(dbProblems[0].question).toEqual('How to test databases?');
    expect(dbProblems[0].type).toEqual('circle');
    expect(dbProblems[0].explanation).toEqual('Create test cases with assertions');
    expect(dbProblems[0].svg_content).toEqual('<svg><rect width="100" height="50"/></svg>');
    expect(dbProblems[0].created_at).toBeInstanceOf(Date);
    expect(dbProblems[0].updated_at).toBeInstanceOf(Date);
  });
});