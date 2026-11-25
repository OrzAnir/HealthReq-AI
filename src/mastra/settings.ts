// Every setting of the project in one place. Most can be changed in the .env file.
const fromEnv = (key: string, fallback: string): string => process.env[key]?.trim() || fallback;

export const settings = {
  // The language model served by LM Studio
  llmUrl: fromEnv('LLM_BASE_URL', 'http://127.0.0.1:1234/v1'),
  llmModel: fromEnv('LLM_MODEL', 'qwen/qwen3-8b'),
  llmApiKey: fromEnv('LLM_API_KEY', 'not-needed'), // LM Studio does not check it
  llmTimeoutMinutes: 10, // how long to wait for one answer from a slow laptop model
  answerTokens: 1600, // maximum length of each agent's answer
  temperature: 0.2, // low = focused, repeatable answers

  // Retrieval: how many passages each agent reads, and how long each passage may be
  domainPassages: 4,
  sdlcPassages: 3,
  passageLength: 1500,
  requirementsLengthForSdlc: 3500, // how much of the requirements the SDLC Advisor reads

  // Folders (inside the project folder)
  corpusFolder: 'corpus',
  reportsFolder: 'reports',

  port: Number(fromEnv('PORT', '4111')),
};
