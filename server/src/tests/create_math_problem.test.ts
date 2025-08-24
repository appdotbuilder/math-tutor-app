import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { mathProblemsTable } from '../db/schema';
import { type CreateMathProblemInput } from '../schema';
import { createMathProblem } from '../handlers/create_math_problem';
import { eq } from 'drizzle-orm';

// Test input data
const testInput: CreateMathProblemInput = {
  title: 'Right Triangle Area',
  question: 'Find the area of a right triangle with base 6 and height 8.',
  type: 'triangle_rectangle',
  explanation: 'The area of a right triangle is calculated using the formula: Area = (1/2) × base × height. So Area = (1/2) × 6 × 8 = 24 square units.',
  svg_content: '<svg width="200" height="150"><polygon points="10,140 130,140 130,40" fill="lightblue" stroke="black" stroke-width="2"/><text x="70" y="155" font-size="14">base = 6</text><text x="140" y="90" font-size="14">height = 8</text></svg>'
};

const circleInput: CreateMathProblemInput = {
  title: 'Circle Area',
  question: 'Calculate the area of a circle with radius 5.',
  type: 'circle',
  explanation: 'The area of a circle is π × r². With radius 5, the area is π × 5² = 25π ≈ 78.54 square units.',
  svg_content: '<svg width="200" height="200"><circle cx="100" cy="100" r="80" fill="lightgreen" stroke="black" stroke-width="2"/><text x="90" y="110" font-size="14">r = 5</text></svg>'
};

describe('createMathProblem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a math problem', async () => {
    const result = await createMathProblem(testInput);

    // Basic field validation
    expect(result.title).toEqual('Right Triangle Area');
    expect(result.question).toEqual(testInput.question);
    expect(result.type).toEqual('triangle_rectangle');
    expect(result.explanation).toEqual(testInput.explanation);
    expect(result.svg_content).toEqual(testInput.svg_content);
    expect(result.id).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save math problem to database', async () => {
    const result = await createMathProblem(testInput);

    // Query using proper drizzle syntax
    const mathProblems = await db.select()
      .from(mathProblemsTable)
      .where(eq(mathProblemsTable.id, result.id))
      .execute();

    expect(mathProblems).toHaveLength(1);
    expect(mathProblems[0].title).toEqual('Right Triangle Area');
    expect(mathProblems[0].question).toEqual(testInput.question);
    expect(mathProblems[0].type).toEqual('triangle_rectangle');
    expect(mathProblems[0].explanation).toEqual(testInput.explanation);
    expect(mathProblems[0].svg_content).toEqual(testInput.svg_content);
    expect(mathProblems[0].created_at).toBeInstanceOf(Date);
    expect(mathProblems[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle different math problem types', async () => {
    // Test with circle type
    const circleResult = await createMathProblem(circleInput);

    expect(circleResult.title).toEqual('Circle Area');
    expect(circleResult.type).toEqual('circle');
    expect(circleResult.question).toEqual(circleInput.question);
    expect(circleResult.explanation).toEqual(circleInput.explanation);
    expect(circleResult.svg_content).toEqual(circleInput.svg_content);

    // Verify in database
    const savedCircle = await db.select()
      .from(mathProblemsTable)
      .where(eq(mathProblemsTable.id, circleResult.id))
      .execute();

    expect(savedCircle).toHaveLength(1);
    expect(savedCircle[0].type).toEqual('circle');
  });

  it('should create multiple math problems with unique IDs', async () => {
    const result1 = await createMathProblem(testInput);
    const result2 = await createMathProblem(circleInput);

    // Ensure different IDs
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.id).toBeGreaterThan(0);
    expect(result2.id).toBeGreaterThan(0);

    // Verify both exist in database
    const allProblems = await db.select()
      .from(mathProblemsTable)
      .execute();

    expect(allProblems).toHaveLength(2);
    
    const ids = allProblems.map(p => p.id);
    expect(ids).toContain(result1.id);
    expect(ids).toContain(result2.id);
  });

  it('should handle all enum types correctly', async () => {
    const enumTypes = [
      'triangle_rectangle',
      'triangle_equilateral',
      'square',
      'rectangle', 
      'circle',
      'arc'
    ] as const;

    const results = [];

    // Create a problem for each type
    for (const type of enumTypes) {
      const input: CreateMathProblemInput = {
        title: `${type} Problem`,
        question: `Question about ${type}`,
        type: type,
        explanation: `Explanation for ${type}`,
        svg_content: `<svg><text>${type}</text></svg>`
      };

      const result = await createMathProblem(input);
      results.push(result);
      expect(result.type).toEqual(type);
    }

    // Verify all were saved
    const allProblems = await db.select()
      .from(mathProblemsTable)
      .execute();

    expect(allProblems).toHaveLength(enumTypes.length);

    // Check that each type is present
    const savedTypes = allProblems.map(p => p.type);
    enumTypes.forEach(type => {
      expect(savedTypes).toContain(type);
    });
  });

  it('should set created_at and updated_at automatically', async () => {
    const beforeCreation = new Date();
    const result = await createMathProblem(testInput);
    const afterCreation = new Date();

    // Check that timestamps are within reasonable range
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime() - 1000); // 1 second tolerance
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime() + 1000);
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime() - 1000);
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime() + 1000);

    // Initially, created_at and updated_at should be very close or equal
    const timeDiff = Math.abs(result.updated_at.getTime() - result.created_at.getTime());
    expect(timeDiff).toBeLessThan(1000); // Less than 1 second difference
  });
});