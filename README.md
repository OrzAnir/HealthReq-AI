# HealthReq AI

Generate healthcare software requirements with a small local LLM, then let a second agent choose the software development life cycle (SDLC) that fits them.

## The two objectives

| # | Objective | How HealthReq AI does it |
| --- | --- | --- |
| 1 | Feed a lightweight LLM existing requirement documents from a domain, and generate the requirements for one functionality with reasoning | BM25 search picks the most relevant passages from the real **iTrust2** healthcare requirements (26 use cases) and the **NIST Cybersecurity Framework 2.0**. The **Requirements Writer** agent (Qwen3-8B) reads them and writes functional and non-functional requirements, each with a *Why* and a *Source* column. |
| 2 | Feed those requirements back into an LLM to identify the most appropriate SDLC, with a software engineering justification | The generated requirements are used to search the SDLC notes, then passed with the best notes to the **SDLC Advisor** agent, which returns a project profile, a fit score for every model, the recommendation, the justification and a life cycle plan. |

## Pipeline

The work is one Mastra workflow, `healthreq-pipeline` (`src/mastra/pipeline.ts`):

| Step | What happens |
| --- | --- |
| 1. `find-domain-passages` | BM25 search of `corpus/healthcare` and `corpus/security` for the functionality; keeps 4 passages, tagged D1–D4 |
| 2. `write-requirements` | Requirements Writer generates the requirements from the passages (Objective 1) |
| 3. `find-sdlc-passages` | BM25 search of `corpus/sdlc`, using the generated requirements as the query; keeps 3 notes, tagged S1–S3 |
| 4. `recommend-sdlc` | SDLC Advisor reads the generated requirements and the notes, and recommends an SDLC (Objective 2) |
| 5. `save-report` | Writes `reports/latest.md` and a dated copy, including which passages each agent read |

## Requirements

- Node.js 22.13 or newer
- [LM Studio](https://lmstudio.ai) with `qwen/qwen3-8b` downloaded (use `qwen/qwen3-4b` on machines with 8 GB of RAM or less)
- In LM Studio, load the model with **Context Length 8192** and start the local server (port 1234)

## Getting started

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev
```

- Dashboard: http://localhost:4111/healthreq. Type a functionality or pick an example and press **Run the pipeline**. The five steps light up as they finish, and the requirements appear as soon as step 2 is done.
- Mastra Studio: http://localhost:4111. Inspect the two agents, run `healthreq-pipeline` and look at the input and output of every step.

A run takes a few minutes on a laptop. The terminal prints `Step 1/5` to `Step 5/5`.

## Configuration (`.env`)

| Variable | Default | Meaning |
| --- | --- | --- |
| `LLM_BASE_URL` | `http://127.0.0.1:1234/v1` | LM Studio's server |
| `LLM_MODEL` | `qwen/qwen3-8b` | Model name exactly as LM Studio shows it |
| `PORT` | `4111` | Port of the dashboard and Studio |

Retrieval sizes, answer length and temperature are in `src/mastra/settings.ts`.

## Code map

| File | Purpose |
| --- | --- |
| `src/mastra/index.ts` | Creates the Mastra app: agents, pipeline, corpus, run storage, web routes |
| `src/mastra/settings.ts` | All settings |
| `src/mastra/model.ts` | Connection to the model in LM Studio (with a 10-minute wait limit) |
| `src/mastra/corpus.ts` | The document corpus and its BM25 index |
| `src/mastra/retrieval.ts` | Finds and formats the passages for each agent |
| `src/mastra/instructions.ts` | The two agents' instructions |
| `src/mastra/agents.ts` | The Requirements Writer and the SDLC Advisor |
| `src/mastra/pipeline.ts` | The five-step workflow |
| `src/mastra/report.ts` | Cleans the model's answers and saves the report |
| `src/mastra/routes.ts` | Serves the dashboard and a status check |
| `web/dashboard.html` | The dashboard; runs the pipeline through Mastra's built-in workflow API |
| `corpus/` | The documents (sources and licences in `corpus/SOURCES.md`) |

## Checking the project

```bash
npm run verify
```

Runs the TypeScript type check and a full Mastra build.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Dashboard says *LM Studio not running* | Start LM Studio's server and load the model |
| A step fails with a context-length or token error | Reload the model in LM Studio with Context Length 8192 or more |
| A step fails mentioning the model | Set `LLM_MODEL` in `.env` to the exact name LM Studio shows |
| Runs are very slow | Use `qwen/qwen3-4b` and close other heavy applications |

## Notes

The generated requirements and recommendation are drafts for a person to review; the project gives no medical or legal advice. Code: MIT licence. iTrust2 documents: Eclipse Public License 2.0 (`corpus/healthcare/itrust2/LICENSE`). NIST CSF 2.0: US Government work.
