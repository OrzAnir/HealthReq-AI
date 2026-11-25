// Entry point. `npm run dev` loads this file, then Mastra starts its web server and Studio.
import { join } from 'node:path';
import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { requirementsWriter, sdlcAdvisor } from './agents';
import { corpus, projectFolder } from './corpus';
import { modelServerIsUp } from './model';
import { healthreqPipeline } from './pipeline';
import { ensureCorpusIndexed } from './retrieval';
import { dashboardRoutes } from './routes';
import { settings } from './settings';

export const mastra = new Mastra({
  agents: { requirementsWriter, sdlcAdvisor },
  workflows: { healthreqPipeline },
  workspace: corpus,
  // A small database file where Mastra records every pipeline run and the result of each step.
  // The dashboard reads a run's progress from here through Mastra's built-in API.
  storage: new LibSQLStore({ id: 'healthreq-runs', url: `file:${join(projectFolder, 'healthreq.db')}` }),
  server: { port: settings.port, apiRoutes: dashboardRoutes },
});

// Before accepting work: index the documents, and warn if LM Studio is not running yet.
await corpus.init();
await ensureCorpusIndexed();
if (!(await modelServerIsUp())) {
  console.warn(`LM Studio is not answering at ${settings.llmUrl}. Start its server before running the pipeline.`);
}
