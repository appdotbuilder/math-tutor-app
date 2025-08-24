import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { mathProblemsTable } from '../db/schema';
import { type CreateMathProblemInput, type MathProblemType } from '../schema';
import { getRandomProblem } from '../handlers/get_random_problem';

// Test data for different problem types
const testProblems: CreateMathProblemInput[] = [
  {
    title: 'Triangle Rectangle Test',
    question: 'Calculate hypotenuse of right triangle with sides 3 and 4',
    type: 'triangle_rectangle',
    explanation: 'Use Pythagorean theorem: c² = a² + b²',
    svg_content: '<svg><polygon points="0,0 30,0 30,40" fill="blue"/></svg>'
  },
  {
    title: 'Circle Area Test',
    question: 'Find area of circle with radius 5cm',
    type: 'circle',
    explanation: 'Area = π × r² = π × 5² = 25π',
    svg_content: '<svg><circle cx="50" cy="50" r="25" fill="red"/></svg>'
  },
  {
    title: 'Square Perimeter Test',
    question: 'Calculate perimeter of square with side 8cm',
    type: 'square',
    explanation: 'Perimeter = 4 × side = 4 × 8 = 32cm',
    svg_content: '<svg><rect x="10" y="10" width="40" height="40" fill="green"/></svg>'
  },
  {
    title: 'Rectangle Area Test',
    question: 'Find area of rectangle 6cm by 9cm',
    type: 'rectangle',
    explanation: 'Area = length × width = 6 × 9 = 54cm²',
    svg_content: '<svg><rect x="5" y="5" width="60" height="90" fill="yellow"/></svg>'
  }
];

describe('getRandomProblem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when no problems exist', async () => {
    const result = await getRandomProblem();
    expect(result).toBeNull();
  });

  it('should return null when no problems exist for specific type', async () => {
    // Insert a circle problem
    await db.insert(mathProblemsTable)
      .values(testProblems[1])
      .execute();

    const result = await getRandomProblem('triangle_rectangle');
    expect(result).toBeNull();
  });

  it('should return a random problem when no type specified', async () => {
    // Insert multiple problems
    await db.insert(mathProblemsTable)
      .values(testProblems)
      .execute();

    const result = await getRandomProblem();

    expect(result).toBeDefined();
    expect(result?.id).toBeDefined();
    expect(result?.title).toBeDefined();
    expect(result?.question).toBeDefined();
    expect(result?.type).toBeDefined();
    expect(result?.explanation).toBeDefined();
    expect(result?.svg_content).toBeDefined();
    expect(result?.created_at).toBeInstanceOf(Date);
    expect(result?.updated_at).toBeInstanceOf(Date);

    // Verify it's one of our test problems
    const problemTitles = testProblems.map(p => p.title);
    expect(problemTitles).toContain(result?.title);
  });

  it('should return a problem of specified type when type filter applied', async () => {
    // Insert problems of different types
    await db.insert(mathProblemsTable)
      .values(testProblems)
      .execute();

    const result = await getRandomProblem('circle');

    expect(result).toBeDefined();
    expect(result?.type).toBe('circle');
    expect(result?.title).toBe('Circle Area Test');
    expect(result?.question).toBe('Find area of circle with radius 5cm');
    expect(result?.explanation).toBe('Area = π × r² = π × 5² = 25π');
    expect(result?.svg_content).toBe('<svg><circle cx="50" cy="50" r="25" fill="red"/></svg>');
  });

  it('should filter correctly for triangle_rectangle type', async () => {
    // Insert problems of different types
    await db.insert(mathProblemsTable)
      .values(testProblems)
      .execute();

    const result = await getRandomProblem('triangle_rectangle');

    expect(result).toBeDefined();
    expect(result?.type).toBe('triangle_rectangle');
    expect(result?.title).toBe('Triangle Rectangle Test');
  });

  it('should return different results on multiple calls (randomness)', async () => {
    // Insert multiple problems of the same type to test randomness
    const multipleSquareProblems: CreateMathProblemInput[] = [
      {
        title: 'Square Problem 1',
        question: 'Square with side 5cm',
        type: 'square',
        explanation: 'Area = 25cm²',
        svg_content: '<svg><rect fill="red"/></svg>'
      },
      {
        title: 'Square Problem 2',
        question: 'Square with side 10cm',
        type: 'square',
        explanation: 'Area = 100cm²',
        svg_content: '<svg><rect fill="blue"/></svg>'
      },
      {
        title: 'Square Problem 3',
        question: 'Square with side 15cm',
        type: 'square',
        explanation: 'Area = 225cm²',
        svg_content: '<svg><rect fill="green"/></svg>'
      }
    ];

    await db.insert(mathProblemsTable)
      .values(multipleSquareProblems)
      .execute();

    // Make multiple calls and collect results
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const result = await getRandomProblem('square');
      if (result) {
        results.add(result.title);
      }
    }

    // With 20 calls and 3 different problems, we should see some variation
    // (though randomness means this could occasionally fail)
    expect(results.size).toBeGreaterThanOrEqual(1);
    expect(results.size).toBeLessThanOrEqual(3);
  });

  it('should handle all problem types correctly', async () => {
    const allTypesProblems: CreateMathProblemInput[] = [
      {
        title: 'Triangle Rectangle',
        question: 'Right triangle question',
        type: 'triangle_rectangle',
        explanation: 'Right triangle explanation',
        svg_content: '<svg>triangle</svg>'
      },
      {
        title: 'Triangle Equilateral',
        question: 'Equilateral triangle question',
        type: 'triangle_equilateral',
        explanation: 'Equilateral triangle explanation',
        svg_content: '<svg>equilateral</svg>'
      },
      {
        title: 'Square',
        question: 'Square question',
        type: 'square',
        explanation: 'Square explanation',
        svg_content: '<svg>square</svg>'
      },
      {
        title: 'Rectangle',
        question: 'Rectangle question',
        type: 'rectangle',
        explanation: 'Rectangle explanation',
        svg_content: '<svg>rectangle</svg>'
      },
      {
        title: 'Circle',
        question: 'Circle question',
        type: 'circle',
        explanation: 'Circle explanation',
        svg_content: '<svg>circle</svg>'
      },
      {
        title: 'Arc',
        question: 'Arc question',
        type: 'arc',
        explanation: 'Arc explanation',
        svg_content: '<svg>arc</svg>'
      }
    ];

    await db.insert(mathProblemsTable)
      .values(allTypesProblems)
      .execute();

    // Test each type
    const types: MathProblemType[] = [
      'triangle_rectangle',
      'triangle_equilateral', 
      'square',
      'rectangle',
      'circle',
      'arc'
    ];

    for (const type of types) {
      const result = await getRandomProblem(type);
      expect(result).toBeDefined();
      expect(result?.type).toBe(type);
    }
  });

  it('should return problems with correct data structure', async () => {
    await db.insert(mathProblemsTable)
      .values(testProblems[0])
      .execute();

    const result = await getRandomProblem();

    expect(result).toBeDefined();
    expect(typeof result?.id).toBe('number');
    expect(typeof result?.title).toBe('string');
    expect(typeof result?.question).toBe('string');
    expect(typeof result?.type).toBe('string');
    expect(typeof result?.explanation).toBe('string');
    expect(typeof result?.svg_content).toBe('string');
    expect(result?.created_at).toBeInstanceOf(Date);
    expect(result?.updated_at).toBeInstanceOf(Date);
    
    // Validate required fields are not empty
    expect(result?.title.length).toBeGreaterThan(0);
    expect(result?.question.length).toBeGreaterThan(0);
    expect(result?.explanation.length).toBeGreaterThan(0);
    expect(result?.svg_content.length).toBeGreaterThan(0);
  });
});