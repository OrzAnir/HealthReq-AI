// Retrieval, the "R" in RAG: pick the corpus passages most relevant to a query,
// so the small local model can read them before it answers.
import { corpus } from './corpus';
import { settings } from './settings';

// One retrieved passage. `tag` is how the agents cite it: D1, D2 ... or S1, S2 ...
export type Passage = { tag: string; file: string; score: number; text: string };

// 'domain' = healthcare requirement documents and the security framework (for the Requirements Writer)
// 'sdlc'   = the SDLC model notes (for the SDLC Advisor)
const AREAS = {
  domain: { folders: ['healthcare', 'security'], tagPrefix: 'D' },
  sdlc: { folders: ['sdlc'], tagPrefix: 'S' },
};

export async function findPassages(query: string, area: keyof typeof AREAS, howMany: number): Promise<Passage[]> {
  const { folders, tagPrefix } = AREAS[area];
  // Ask for extra results, because results from the other area are skipped below.
  const results = await corpus.search(query, { mode: 'bm25', topK: howMany * 5 });

  const passages: Passage[] = [];
  for (const result of results) {
    const file = result.id.slice(settings.corpusFolder.length + 1); // e.g. healthcare/itrust2/UC6.md
    if (!folders.includes(file.split('/')[0])) continue; // belongs to the other area
    passages.push({
      tag: `${tagPrefix}${passages.length + 1}`,
      file,
      score: Math.round(result.score * 100) / 100,
      text: result.content.replace(/\s+/g, ' ').trim().slice(0, settings.passageLength),
    });
    if (passages.length === howMany) break;
  }
  return passages;
}

// The passages as text for the model:  [D1] from healthcare/itrust2/UC6.md: ...
export function passagesAsText(passages: Passage[]): string {
  if (passages.length === 0) return '(No relevant passages were found. Treat every requirement as an assumption.)';
  return passages.map((p) => `[${p.tag}] from ${p.file}:\n${p.text}`).join('\n\n');
}

// Called once at start-up: stop with a clear message if no documents were indexed.
export async function ensureCorpusIndexed(): Promise<void> {
  const [anyResult] = await corpus.search('patient', { mode: 'bm25', topK: 1 });
  if (!anyResult) throw new Error(`No documents were indexed. Check the ${settings.corpusFolder}/ folder.`);
}
