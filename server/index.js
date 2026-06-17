// Express backend: serves the built SPA and proxies chat requests to Claude.
// ANTHROPIC_API_KEY is read from the server environment (Render env vars in
// production, or a local .env via `npm run dev:server`) and never reaches the
// browser bundle.
//
// In Manager mode the request includes tools so Claude can act on the task list.
// The tools execute on the CLIENT (where the task state lives) — this endpoint
// just runs one model turn and hands back any tool calls; the client executes
// them, posts the results back, and we loop until Claude is done.

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '1mb' }));

const apiKey = process.env.ANTHROPIC_API_KEY;
const client = apiKey ? new Anthropic({ apiKey }) : null;

// Tool schemas offered to Claude in Manager mode. Execution happens client-side
// (src/lib/zenActions.js) — these only describe the shape of each action.
const MANAGER_TOOLS = [
  {
    name: 'add_task',
    description:
      "Create a new task on the user's list. Use when the user asks to add, create, or capture a task or to-do.",
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The task title.' },
        project: {
          type: 'string',
          description: 'Optional project name to file it under (match an existing project).',
        },
        due: {
          type: 'string',
          description: 'Optional due hint, e.g. "Today", "This week", "Next week".',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'complete_task',
    description: 'Mark an existing task as done. Use the exact task_id from the provided task list.',
    input_schema: {
      type: 'object',
      properties: { task_id: { type: 'string', description: 'The id of the task to complete.' } },
      required: ['task_id'],
    },
  },
  {
    name: 'add_to_focus',
    description:
      "Add an existing task to the user's Focus list for today. Use the exact task_id from the provided task list.",
    input_schema: {
      type: 'object',
      properties: { task_id: { type: 'string', description: 'The id of the task to focus.' } },
      required: ['task_id'],
    },
  },
];

app.post('/api/zen-chat', async (req, res) => {
  if (!client) {
    return res
      .status(500)
      .json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' });
  }

  const { system, messages, mode } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'A non-empty `messages` array is required.' });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      ...(typeof system === 'string' && system.trim() ? { system } : {}),
      ...(mode === 'manager' ? { tools: MANAGER_TOOLS } : {}),
      messages,
    });

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    res.json({ stop_reason: response.stop_reason, content: response.content, text });
  } catch (err) {
    console.error('zen-chat error:', err);
    const status = err instanceof Anthropic.APIError ? err.status ?? 502 : 500;
    res.status(status).json({ error: err?.message || 'Unexpected error.' });
  }
});

// Serve the built SPA and fall back to index.html for client-side routes.
const dist = path.join(__dirname, '..', 'dist');
app.use(express.static(dist));
app.use((_req, res) => res.sendFile(path.join(dist, 'index.html')));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server listening on :${port}`));
