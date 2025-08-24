import { z } from 'zod';

// Math problem types enum
export const mathProblemTypeSchema = z.enum([
  'triangle_rectangle',
  'triangle_equilateral', 
  'square',
  'rectangle',
  'circle',
  'arc'
]);

export type MathProblemType = z.infer<typeof mathProblemTypeSchema>;

// Math problem schema
export const mathProblemSchema = z.object({
  id: z.number(),
  title: z.string(),
  question: z.string(),
  type: mathProblemTypeSchema,
  explanation: z.string(),
  svg_content: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type MathProblem = z.infer<typeof mathProblemSchema>;

// Input schema for creating math problems
export const createMathProblemInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  question: z.string().min(1, "Question is required"),
  type: mathProblemTypeSchema,
  explanation: z.string().min(1, "Explanation is required"),
  svg_content: z.string().min(1, "SVG content is required")
});

export type CreateMathProblemInput = z.infer<typeof createMathProblemInputSchema>;

// Input schema for updating math problems
export const updateMathProblemInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  question: z.string().min(1).optional(),
  type: mathProblemTypeSchema.optional(),
  explanation: z.string().min(1).optional(),
  svg_content: z.string().min(1).optional()
});

export type UpdateMathProblemInput = z.infer<typeof updateMathProblemInputSchema>;

// Query schema for filtering math problems
export const getMathProblemsInputSchema = z.object({
  type: mathProblemTypeSchema.optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional()
});

export type GetMathProblemsInput = z.infer<typeof getMathProblemsInputSchema>;

// Schema for getting a single math problem by ID
export const getMathProblemByIdInputSchema = z.object({
  id: z.number().int().positive()
});

export type GetMathProblemByIdInput = z.infer<typeof getMathProblemByIdInputSchema>;

// Schema for generating SVG download response
export const svgDownloadResponseSchema = z.object({
  filename: z.string(),
  content: z.string(),
  mimeType: z.string()
});

export type SvgDownloadResponse = z.infer<typeof svgDownloadResponseSchema>;