import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { mathProblemsTable } from '../db/schema';
import { type GetMathProblemByIdInput, type CreateMathProblemInput } from '../schema';
import { downloadSvg } from '../handlers/download_svg';

// Test data
const testMathProblem: Omit<CreateMathProblemInput, 'id'> = {
  title: 'Triangle Area Problem',
  question: 'Calculate the area of this triangle',
  type: 'triangle_rectangle',
  explanation: 'Use the formula: Area = (base × height) / 2',
  svg_content: '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><polygon points="50,120 50,50 130,120" fill="lightblue" stroke="blue" stroke-width="2"/></svg>'
};

const testMathProblemWithSpecialChars: Omit<CreateMathProblemInput, 'id'> = {
  title: 'Circle & Arc Problem #1!',
  question: 'Find the circumference',
  type: 'circle',
  explanation: 'Use C = 2πr',
  svg_content: '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="none" stroke="red"/></svg>'
};

describe('downloadSvg', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return SVG download data for existing math problem', async () => {
    // Create test math problem
    const insertResult = await db.insert(mathProblemsTable)
      .values(testMathProblem)
      .returning()
      .execute();

    const mathProblem = insertResult[0];

    const input: GetMathProblemByIdInput = { id: mathProblem.id };
    const result = await downloadSvg(input);

    // Verify result structure
    expect(result).not.toBeNull();
    expect(result!.filename).toBe(`math_problem_${mathProblem.id}_triangle_area_problem.svg`);
    expect(result!.content).toBe(testMathProblem.svg_content);
    expect(result!.mimeType).toBe('image/svg+xml');
  });

  it('should sanitize filename with special characters', async () => {
    // Create test math problem with special characters in title
    const insertResult = await db.insert(mathProblemsTable)
      .values(testMathProblemWithSpecialChars)
      .returning()
      .execute();

    const mathProblem = insertResult[0];

    const input: GetMathProblemByIdInput = { id: mathProblem.id };
    const result = await downloadSvg(input);

    // Verify filename sanitization
    expect(result).not.toBeNull();
    expect(result!.filename).toBe(`math_problem_${mathProblem.id}_circle_arc_problem_1.svg`);
    expect(result!.content).toBe(testMathProblemWithSpecialChars.svg_content);
    expect(result!.mimeType).toBe('image/svg+xml');
  });

  it('should return null for non-existent math problem', async () => {
    const input: GetMathProblemByIdInput = { id: 999 };
    const result = await downloadSvg(input);

    expect(result).toBeNull();
  });

  it('should handle math problems with different types', async () => {
    // Create math problems of different types
    const squareProblem = {
      ...testMathProblem,
      title: 'Square Area',
      type: 'square' as const,
      svg_content: '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="60" height="60" fill="green"/></svg>'
    };

    const insertResult = await db.insert(mathProblemsTable)
      .values(squareProblem)
      .returning()
      .execute();

    const mathProblem = insertResult[0];

    const input: GetMathProblemByIdInput = { id: mathProblem.id };
    const result = await downloadSvg(input);

    expect(result).not.toBeNull();
    expect(result!.filename).toBe(`math_problem_${mathProblem.id}_square_area.svg`);
    expect(result!.content).toBe(squareProblem.svg_content);
    expect(result!.mimeType).toBe('image/svg+xml');
  });

  it('should handle empty title gracefully', async () => {
    const problemWithEmptyTitle = {
      ...testMathProblem,
      title: '',
      svg_content: '<svg><circle/></svg>'
    };

    const insertResult = await db.insert(mathProblemsTable)
      .values(problemWithEmptyTitle)
      .returning()
      .execute();

    const mathProblem = insertResult[0];

    const input: GetMathProblemByIdInput = { id: mathProblem.id };
    const result = await downloadSvg(input);

    expect(result).not.toBeNull();
    expect(result!.filename).toBe(`math_problem_${mathProblem.id}_.svg`);
    expect(result!.content).toBe(problemWithEmptyTitle.svg_content);
  });

  it('should handle title with only special characters', async () => {
    const problemWithSpecialTitle = {
      ...testMathProblem,
      title: '!@#$%^&*()',
      svg_content: '<svg><rect/></svg>'
    };

    const insertResult = await db.insert(mathProblemsTable)
      .values(problemWithSpecialTitle)
      .returning()
      .execute();

    const mathProblem = insertResult[0];

    const input: GetMathProblemByIdInput = { id: mathProblem.id };
    const result = await downloadSvg(input);

    expect(result).not.toBeNull();
    expect(result!.filename).toBe(`math_problem_${mathProblem.id}_.svg`);
    expect(result!.content).toBe(problemWithSpecialTitle.svg_content);
  });
});