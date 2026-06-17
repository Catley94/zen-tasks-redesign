// Zen AI integration — the Anthropic client and the system-prompt builder.
// Kept out of React so the controller hook only manages chat UI state (messages/busy).
//
// SECURITY NOTE: this runs in the browser with `dangerouslyAllowBrowser` and a VITE_* key,
// which means the key ships in the client bundle. The real fix is to proxy these calls
// through a backend; isolated here for now, behaviour unchanged.

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

// Build Zen's system prompt from the user's goals + projects.
// (Currently fed the seed goals/projects to match existing behaviour; wiring this to live
// app state is a follow-up.)
export function buildZenSystemPrompt(goals, projects, extraCtx = '') {
  return [
    "You are Zen, a calm AI companion inside a to-do app. Keep replies short (1–3 sentences), warm, grounded, never urgent. No emoji.",
    `User goals: ${goals.map(g => `${g.name} — ${g.overarching}`).join(' | ')}`,
    `Active phases: ${goals.map(g => g.phases[0] && `${g.name}: ${g.phases[0].name}`).filter(Boolean).join(' | ')}`,
    `Projects: ${projects.map(p => `${p.name} (${Math.round(p.progress * 100)}%, ${p.status})`).join('; ')}`,
    ...goals.map(g => `Enthusiasm note for "${g.name}" ${g.enthusiasmWhen}: "${g.enthusiasm}"`),
    extraCtx,
  ].join("\n");
}

// Send one user turn to Zen; resolves to the reply text (or '' if none).
export async function callZen(systemPrompt, userText) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    system: systemPrompt,
    messages: [{ role: 'user', content: userText }],
  });
  return response.content[0]?.type === 'text' ? response.content[0].text : '';
}
