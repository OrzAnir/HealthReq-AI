// Turning the agents' answers into a saved report.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { projectFolder } from './corpus';
import type { Passage } from './retrieval';
import { settings } from './settings';

// Qwen3 may begin its reply with private reasoning inside <think> ... </think>.
// Keep only what comes after the last </think>, and drop any <think> that never closed.
export function stripThinking(reply: string): string {
  const closeTag = '</think>';
  let answer = reply.includes(closeTag) ? reply.slice(reply.lastIndexOf(closeTag) + closeTag.length) : reply;
  const unclosed = answer.indexOf('<think>');
  if (unclosed >= 0) answer = answer.slice(0, unclosed);
  return answer.trim();
}

// A Markdown table of the passages an agent read, so every citation can be checked.
function sourcesTable(title: string, passages: Passage[]): string {
  const rows = passages.map((p) => `| ${p.tag} | ${p.file} | ${p.score} |`).join('\n');
  return `### ${title}\n\n| Tag | File | BM25 score |\n| --- | --- | --- |\n${rows}`;
}

type RunData = {
  functionality: string;
  domainPassages: Passage[];
  requirements: string;
  sdlcPassages: Passage[];
  recommendation: string;
};

// Save the report twice: reports/latest.md, and a dated copy so earlier runs are kept.
export async function saveReport(run: RunData): Promise<{ latest: string; archived: string }> {
  const report = [
    `**Functionality:** ${run.functionality}  \n**Model:** ${settings.llmModel}  \n**Generated:** ${new Date().toLocaleString()}`,
    run.requirements,
    sourcesTable('Passages read by the Requirements Writer', run.domainPassages),
    '---',
    run.recommendation,
    sourcesTable('Notes read by the SDLC Advisor', run.sdlcPassages),
  ].join('\n\n');

  const folder = join(projectFolder, settings.reportsFolder);
  await mkdir(folder, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-'); // e.g. 2026-11-24-16-05
  const name = run.functionality.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const latest = join(folder, 'latest.md');
  const archived = join(folder, `${stamp}-${name}.md`);
  await writeFile(latest, report, 'utf8');
  await writeFile(archived, report, 'utf8');
  return { latest, archived };
}
