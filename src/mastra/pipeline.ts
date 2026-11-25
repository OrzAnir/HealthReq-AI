// The pipeline: a Mastra workflow of five steps that run one after another.
// Each step receives everything gathered so far and adds one new piece.
//
//   find-domain-passages -> write-requirements -> find-sdlc-passages -> recommend-sdlc -> save-report
//        (BM25)            (Objective 1)             (BM25)              (Objective 2)
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { askAgent, requirementsWriter, sdlcAdvisor } from './agents';
import { saveReport } from './report';
import { findPassages, passagesAsText } from './retrieval';
import { settings } from './settings';

// The shape of the data after each step (checked by Mastra between steps).
const passages = z.array(z.object({ tag: z.string(), file: z.string(), score: z.number(), text: z.string() }));
const start = z.object({ functionality: z.string().min(5) });
const withDomainPassages = start.extend({ domainPassages: passages });
const withRequirements = withDomainPassages.extend({ requirements: z.string() });
const withSdlcPassages = withRequirements.extend({ sdlcPassages: passages });
const withRecommendation = withSdlcPassages.extend({ recommendation: z.string() });
const finished = withRecommendation.extend({ reportFile: z.string(), archivedReport: z.string() });

// Step 1: search the healthcare documents for passages about the functionality.
const findDomainPassages = createStep({
  id: 'find-domain-passages',
  description: 'BM25 search of the healthcare documents for the functionality',
  inputSchema: start,
  outputSchema: withDomainPassages,
  execute: async ({ inputData }) => {
    const domainPassages = await findPassages(inputData.functionality, 'domain', settings.domainPassages);
    console.log(`Step 1/5: found ${domainPassages.map((p) => p.file).join(', ')}`);
    return { ...inputData, domainPassages };
  },
});

// Step 2 (Objective 1): the Requirements Writer reads the passages and writes the requirements.
const writeRequirements = createStep({
  id: 'write-requirements',
  description: 'Requirements Writer generates requirements with reasoning (Objective 1)',
  inputSchema: withDomainPassages,
  outputSchema: withRequirements,
  execute: async ({ inputData }) => {
    console.log('Step 2/5: Requirements Writer is working...');
    const requirements = await askAgent(requirementsWriter,
      `FUNCTIONALITY: ${inputData.functionality}\n\nPASSAGES:\n\n${passagesAsText(inputData.domainPassages)}`);
    return { ...inputData, requirements };
  },
});

// Step 3: use the generated requirements as the search query for the SDLC notes.
const findSdlcPassages = createStep({
  id: 'find-sdlc-passages',
  description: 'BM25 search of the SDLC notes, using the generated requirements as the query',
  inputSchema: withRequirements,
  outputSchema: withSdlcPassages,
  execute: async ({ inputData }) => {
    const sdlcPassages = await findPassages(inputData.requirements, 'sdlc', settings.sdlcPassages);
    console.log(`Step 3/5: found ${sdlcPassages.map((p) => p.file).join(', ')}`);
    return { ...inputData, sdlcPassages };
  },
});

// Step 4 (Objective 2): the generated requirements are fed back into the LLM, via the SDLC Advisor.
const recommendSdlc = createStep({
  id: 'recommend-sdlc',
  description: 'SDLC Advisor recommends a life cycle for the generated requirements (Objective 2)',
  inputSchema: withSdlcPassages,
  outputSchema: withRecommendation,
  execute: async ({ inputData }) => {
    console.log('Step 4/5: SDLC Advisor is working...');
    const requirements = inputData.requirements.slice(0, settings.requirementsLengthForSdlc);
    const recommendation = await askAgent(sdlcAdvisor,
      `REQUIREMENTS:\n\n${requirements}\n\nSDLC NOTES:\n\n${passagesAsText(inputData.sdlcPassages)}`);
    return { ...inputData, recommendation };
  },
});

// Step 5: save everything as a Markdown report.
const saveReportStep = createStep({
  id: 'save-report',
  description: 'Save the requirements, recommendation and sources to reports/',
  inputSchema: withRecommendation,
  outputSchema: finished,
  execute: async ({ inputData }) => {
    const { latest, archived } = await saveReport(inputData);
    console.log(`Step 5/5: saved ${latest}`);
    return { ...inputData, reportFile: latest, archivedReport: archived };
  },
});

export const healthreqPipeline = createWorkflow({
  id: 'healthreq-pipeline',
  description: 'Healthcare requirements with reasoning, then an SDLC recommendation for them',
  inputSchema: start,
  outputSchema: finished,
})
  .then(findDomainPassages)
  .then(writeRequirements)
  .then(findSdlcPassages)
  .then(recommendSdlc)
  .then(saveReportStep)
  .commit();
