import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { mathProblemsTable } from '../db/schema';
import { type GetMathProblemByIdInput } from '../schema';
import { getMathProblemById } from '../handlers/get_math_problem_by_id';

// Test data for creating a math problem
const testMathProblem = {
  title: 'Triangle Rectangle - Test Problem',
  question: 'Dans un triangle rectangle ABC, calculez la longueur de l\'hypoténuse.',
  type: 'triangle_rectangle' as const,
  explanation: '1. Identifier les côtés\n2. Appliquer le théorème de Pythagore\n3. Calculer le résultat',
  svg_content: '<svg width="200" height="150"><polygon points="50,120 50,50 130,120" fill="lightblue"/></svg>'
};

describe('getMathProblemById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a math problem when it exists', async () => {
    // Create a test math problem
    const insertResult = await db.insert(mathProblemsTable)
      .values(testMathProblem)
      .returning()
      .execute();

    const createdProblem = insertResult[0];
    const input: GetMathProblemByIdInput = { id: createdProblem.id };

    // Get the math problem by ID
    const result = await getMathProblemById(input);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdProblem.id);
    expect(result!.title).toEqual('Triangle Rectangle - Test Problem');
    expect(result!.question).toEqual(testMathProblem.question);
    expect(result!.type).toEqual('triangle_rectangle');
    expect(result!.explanation).toEqual(testMathProblem.explanation);
    expect(result!.svg_content).toEqual(testMathProblem.svg_content);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when math problem does not exist', async () => {
    const input: GetMathProblemByIdInput = { id: 999 };

    const result = await getMathProblemById(input);

    expect(result).toBeNull();
  });

  it('should return the correct problem when multiple problems exist', async () => {
    // Create multiple test math problems
    const problem1 = await db.insert(mathProblemsTable)
      .values({
        ...testMathProblem,
        title: 'First Problem'
      })
      .returning()
      .execute();

    const problem2 = await db.insert(mathProblemsTable)
      .values({
        ...testMathProblem,
        title: 'Second Problem',
        type: 'circle' as const
      })
      .returning()
      .execute();

    const problem3 = await db.insert(mathProblemsTable)
      .values({
        ...testMathProblem,
        title: 'Third Problem',
        type: 'square' as const
      })
      .returning()
      .execute();

    // Request the second problem specifically
    const input: GetMathProblemByIdInput = { id: problem2[0].id };
    const result = await getMathProblemById(input);

    // Verify we got the correct problem
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(problem2[0].id);
    expect(result!.title).toEqual('Second Problem');
    expect(result!.type).toEqual('circle');
  });

  it('should handle different math problem types correctly', async () => {
    // Test with different problem types
    const types = ['triangle_equilateral', 'square', 'rectangle', 'circle', 'arc'] as const;
    
    const createdProblems = [];
    for (const type of types) {
      const result = await db.insert(mathProblemsTable)
        .values({
          ...testMathProblem,
          title: `${type} Problem`,
          type: type
        })
        .returning()
        .execute();
      createdProblems.push(result[0]);
    }

    // Verify each problem type is returned correctly
    for (let i = 0; i < types.length; i++) {
      const input: GetMathProblemByIdInput = { id: createdProblems[i].id };
      const result = await getMathProblemById(input);

      expect(result).not.toBeNull();
      expect(result!.type).toEqual(types[i]);
      expect(result!.title).toEqual(`${types[i]} Problem`);
    }
  });

  it('should preserve timestamps correctly', async () => {
    // Create a test problem and wait a bit
    const insertResult = await db.insert(mathProblemsTable)
      .values(testMathProblem)
      .returning()
      .execute();

    const createdProblem = insertResult[0];
    const input: GetMathProblemByIdInput = { id: createdProblem.id };

    const result = await getMathProblemById(input);

    expect(result).not.toBeNull();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
    
    // Verify timestamps match what was stored in the database
    expect(result!.created_at.getTime()).toEqual(createdProblem.created_at.getTime());
    expect(result!.updated_at.getTime()).toEqual(createdProblem.updated_at.getTime());
  });
});