import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createMathProblemInputSchema,
  updateMathProblemInputSchema,
  getMathProblemsInputSchema,
  getMathProblemByIdInputSchema,
  mathProblemTypeSchema
} from './schema';

// Import handlers
import { createMathProblem } from './handlers/create_math_problem';
import { getMathProblems } from './handlers/get_math_problems';
import { getMathProblemById } from './handlers/get_math_problem_by_id';
import { updateMathProblem } from './handlers/update_math_problem';
import { deleteMathProblem } from './handlers/delete_math_problem';
import { downloadSvg } from './handlers/download_svg';
import { getRandomProblem } from './handlers/get_random_problem';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Create a new math problem
  createMathProblem: publicProcedure
    .input(createMathProblemInputSchema)
    .mutation(({ input }) => createMathProblem(input)),

  // Get all math problems with optional filtering
  getMathProblems: publicProcedure
    .input(getMathProblemsInputSchema.optional())
    .query(({ input }) => getMathProblems(input)),

  // Get a specific math problem by ID
  getMathProblemById: publicProcedure
    .input(getMathProblemByIdInputSchema)
    .query(({ input }) => getMathProblemById(input)),

  // Update an existing math problem
  updateMathProblem: publicProcedure
    .input(updateMathProblemInputSchema)
    .mutation(({ input }) => updateMathProblem(input)),

  // Delete a math problem
  deleteMathProblem: publicProcedure
    .input(getMathProblemByIdInputSchema)
    .mutation(({ input }) => deleteMathProblem(input)),

  // Download SVG for a specific math problem
  downloadSvg: publicProcedure
    .input(getMathProblemByIdInputSchema)
    .query(({ input }) => downloadSvg(input)),

  // Get a random math problem (for "Exercice suivant" functionality)
  getRandomProblem: publicProcedure
    .input(mathProblemTypeSchema.optional())
    .query(({ input }) => getRandomProblem(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC Math Tutor server listening at port: ${port}`);
}

start();