// The two AI agents. An agent = a model + its instructions.
import { Agent } from '@mastra/core/agent';
import { ADVISOR_INSTRUCTIONS, WRITER_INSTRUCTIONS } from './instructions';
import { qwenModel } from './model';
import { stripThinking } from './report';
import { settings } from './settings';

const modelSettings = { maxOutputTokens: settings.answerTokens, temperature: settings.temperature };

// Objective 1: writes requirements, with reasoning, for one functionality.
export const requirementsWriter = new Agent({
  id: 'requirements-writer',
  name: 'Requirements Writer',
  description: 'Writes the software requirements, with reasoning and sources, for one healthcare functionality.',
  instructions: WRITER_INSTRUCTIONS,
  model: qwenModel,
  defaultOptions: { modelSettings },
});

// Objective 2: reads those requirements and recommends an SDLC.
export const sdlcAdvisor = new Agent({
  id: 'sdlc-advisor',
  name: 'SDLC Advisor',
  description: 'Recommends and justifies a software development life cycle for a set of requirements.',
  instructions: ADVISOR_INSTRUCTIONS,
  model: qwenModel,
  defaultOptions: { modelSettings },
});

// Send one message to an agent and return its cleaned answer.
// "/no_think" tells Qwen3 to answer directly instead of writing a long hidden reasoning first.
export async function askAgent(agent: Agent, message: string): Promise<string> {
  const reply = await agent.generate(`${message}\n\n/no_think`);
  const answer = stripThinking(reply.text);
  if (!answer) throw new Error(`The ${agent.name} returned an empty answer.`);
  return answer;
}
