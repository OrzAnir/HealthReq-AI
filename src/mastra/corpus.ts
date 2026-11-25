// The corpus: our domain documents, indexed for BM25 keyword search by a Mastra Workspace.
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { LocalFilesystem, Workspace } from '@mastra/core/workspace';
import { settings } from './settings';

// Find the project folder: start where the program runs and walk up until we see corpus/.
// (`mastra dev` runs the compiled code from a folder inside .mastra, below the project.)
function findProjectFolder(start: string): string {
  let folder = start;
  while (!existsSync(join(folder, settings.corpusFolder))) {
    const parent = dirname(folder);
    if (parent === folder) return start; // reached the top of the disk without finding it
    folder = parent;
  }
  return folder;
}

export const projectFolder = findProjectFolder(process.cwd());

export const corpus = new Workspace({
  id: 'healthreq-corpus',
  filesystem: new LocalFilesystem({ basePath: projectFolder, readOnly: true }),
  bm25: true, // keyword index; no embeddings or vector database needed
  autoIndexPaths: [`${settings.corpusFolder}/**/*.md`, `${settings.corpusFolder}/**/*.txt`],
  skills: [],
  tools: { enabled: false }, // agents cannot open files themselves; the pipeline gives them passages
});
