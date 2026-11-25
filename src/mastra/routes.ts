// Two extra web addresses added to Mastra's server.
// Running the pipeline itself uses Mastra's built-in workflow API (see web/dashboard.html).
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { registerApiRoute } from '@mastra/core/server';
import { projectFolder } from './corpus';
import { modelServerIsUp } from './model';
import { settings } from './settings';

export const dashboardRoutes = [
  // The dashboard page.
  registerApiRoute('/healthreq', {
    method: 'GET',
    requiresAuth: false,
    handler: async () => {
      const page = await readFile(join(projectFolder, 'web', 'dashboard.html'), 'utf8');
      return new Response(page, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    },
  }),

  // Status shown at the top of the dashboard: which model, and whether LM Studio is answering.
  registerApiRoute('/healthreq/status', {
    method: 'GET',
    requiresAuth: false,
    handler: async (c) => c.json({ model: settings.llmModel, modelServerUp: await modelServerIsUp() }),
  }),
];
