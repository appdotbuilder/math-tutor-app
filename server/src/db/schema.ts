import { serial, text, pgTable, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Define the enum for math problem types
export const mathProblemTypeEnum = pgEnum('math_problem_type', [
  'triangle_rectangle',
  'triangle_equilateral',
  'square', 
  'rectangle',
  'circle',
  'arc'
]);

// Math problems table
export const mathProblemsTable = pgTable('math_problems', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  question: text('question').notNull(),
  type: mathProblemTypeEnum('type').notNull(),
  explanation: text('explanation').notNull(),
  svg_content: text('svg_content').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type MathProblem = typeof mathProblemsTable.$inferSelect; // For SELECT operations
export type NewMathProblem = typeof mathProblemsTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { 
  mathProblems: mathProblemsTable 
};