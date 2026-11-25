// The language model: Qwen3 running in LM Studio on this computer.
// LM Studio speaks the OpenAI API format, so we use the "OpenAI-compatible" provider.
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { Agent as ConnectionPool, fetch as patientFetch } from 'undici';
import { settings } from './settings';

// Node normally stops waiting for an HTTP answer after 5 minutes. A laptop model can be
// slower than that, so requests to the model use a connection pool with a longer limit.
const waitLimit = settings.llmTimeoutMinutes * 60_000;
const modelConnection = new ConnectionPool({ headersTimeout: waitLimit, bodyTimeout: waitLimit });

const lmStudioServer = createOpenAICompatible({
  name: 'local-llm',
  baseURL: settings.llmUrl,
  apiKey: settings.llmApiKey,
  fetch: (url, options) =>
    patientFetch(String(url), { ...(options as object), dispatcher: modelConnection }) as unknown as Promise<Response>,
});

export const qwenModel = lmStudioServer.chatModel(settings.llmModel);

// Used at start-up and by the dashboard: is LM Studio's server answering?
export async function modelServerIsUp(): Promise<boolean> {
  try {
    const response = await fetch(`${settings.llmUrl}/models`);
    return response.ok;
  } catch {
    return false;
  }
}
