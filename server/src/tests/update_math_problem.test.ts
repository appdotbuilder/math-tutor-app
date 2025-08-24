import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { mathProblemsTable } from '../db/schema';
import { type CreateMathProblemInput, type UpdateMathProblemInput } from '../schema';
import { updateMathProblem } from '../handlers/update_math_problem';
import { eq } from 'drizzle-orm';

// Helper function to create a test math problem
const createTestMathProblem = async () => {
  const testInput = {
    title: 'Original Triangle Problem',
    question: 'Find the area of this triangle',
    type: 'triangle_rectangle' as const,
    explanation: 'Use the formula A = 0.5 * base * height',
    svg_content: '<svg><rect width="100" height="100"/></svg>'
  };

  const result = await db.insert(mathProblemsTable)
    .values(testInput)
    .returning()
    .execute();

  return result[0];
};

describe('updateMathProblem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a single field', async () => {
    const originalProblem = await createTestMathProblem();
    
    const updateInput: UpdateMathProblemInput = {
      id: originalProblem.id,
      title: 'Updated Triangle Problem'
    };

    const result = await updateMathProblem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(originalProblem.id);
    expect(result!.title).toEqual('Updated Triangle Problem');
    expect(result!.question).toEqual('Find the area of this triangle'); // Should remain unchanged
    expect(result!.type).toEqual('triangle_rectangle'); // Should remain unchanged
    expect(result!.explanation).toEqual('Use the formula A = 0.5 * base * height'); // Should remain unchanged
    expect(result!.svg_content).toEqual('<svg><rect width="100" height="100"/></svg>'); // Should remain unchanged
    expect(result!.created_at).toEqual(originalProblem.created_at);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at > originalProblem.updated_at).toBe(true);
  });

  it('should update multiple fields', async () => {
    const originalProblem = await createTestMathProblem();
    
    const updateInput: UpdateMathProblemInput = {
      id: originalProblem.id,
      title: 'Updated Circle Problem',
      question: 'Find the area of this circle',
      type: 'circle',
      explanation: 'Use the formula A = π * r²'
    };

    const result = await updateMathProblem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(originalProblem.id);
    expect(result!.title).toEqual('Updated Circle Problem');
    expect(result!.question).toEqual('Find the area of this circle');
    expect(result!.type).toEqual('circle');
    expect(result!.explanation).toEqual('Use the formula A = π * r²');
    expect(result!.svg_content).toEqual('<svg><rect width="100" height="100"/></svg>'); // Should remain unchanged
    expect(result!.created_at).toEqual(originalProblem.created_at);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at > originalProblem.updated_at).toBe(true);
  });

  it('should update all fields', async () => {
    const originalProblem = await createTestMathProblem();
    
    const updateInput: UpdateMathProblemInput = {
      id: originalProblem.id,
      title: 'Complete Update Problem',
      question: 'Solve this complex geometry problem',
      type: 'arc',
      explanation: 'This requires advanced geometric calculations',
      svg_content: '<svg><circle cx="50" cy="50" r="40"/></svg>'
    };

    const result = await updateMathProblem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(originalProblem.id);
    expect(result!.title).toEqual('Complete Update Problem');
    expect(result!.question).toEqual('Solve this complex geometry problem');
    expect(result!.type).toEqual('arc');
    expect(result!.explanation).toEqual('This requires advanced geometric calculations');
    expect(result!.svg_content).toEqual('<svg><circle cx="50" cy="50" r="40"/></svg>');
    expect(result!.created_at).toEqual(originalProblem.created_at);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at > originalProblem.updated_at).toBe(true);
  });

  it('should return null for non-existent math problem', async () => {
    const updateInput: UpdateMathProblemInput = {
      id: 999999,
      title: 'Non-existent Problem'
    };

    const result = await updateMathProblem(updateInput);

    expect(result).toBeNull();
  });

  it('should update problem in database', async () => {
    const originalProblem = await createTestMathProblem();
    
    const updateInput: UpdateMathProblemInput = {
      id: originalProblem.id,
      title: 'Database Update Test',
      type: 'square'
    };

    const result = await updateMathProblem(updateInput);

    // Verify the update in the database
    const updatedProblem = await db.select()
      .from(mathProblemsTable)
      .where(eq(mathProblemsTable.id, originalProblem.id))
      .execute();

    expect(updatedProblem).toHaveLength(1);
    expect(updatedProblem[0].title).toEqual('Database Update Test');
    expect(updatedProblem[0].type).toEqual('square');
    expect(updatedProblem[0].question).toEqual('Find the area of this triangle'); // Unchanged
    expect(updatedProblem[0].updated_at).toBeInstanceOf(Date);
    expect(updatedProblem[0].updated_at > originalProblem.updated_at).toBe(true);
  });

  it('should handle empty update (only updating timestamp)', async () => {
    const originalProblem = await createTestMathProblem();
    
    const updateInput: UpdateMathProblemInput = {
      id: originalProblem.id
    };

    const result = await updateMathProblem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(originalProblem.id);
    expect(result!.title).toEqual(originalProblem.title);
    expect(result!.question).toEqual(originalProblem.question);
    expect(result!.type).toEqual(originalProblem.type);
    expect(result!.explanation).toEqual(originalProblem.explanation);
    expect(result!.svg_content).toEqual(originalProblem.svg_content);
    expect(result!.created_at).toEqual(originalProblem.created_at);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at > originalProblem.updated_at).toBe(true);
  });

  it('should handle all problem types correctly', async () => {
    const originalProblem = await createTestMathProblem();
    
    const problemTypes = ['triangle_rectangle', 'triangle_equilateral', 'square', 'rectangle', 'circle', 'arc'] as const;
    
    for (const type of problemTypes) {
      const updateInput: UpdateMathProblemInput = {
        id: originalProblem.id,
        type: type
      };

      const result = await updateMathProblem(updateInput);

      expect(result).not.toBeNull();
      expect(result!.type).toEqual(type);
    }
  });
});