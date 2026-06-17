// Calls the `/api/zen-chat` backend route (server/index.js), which proxies to
// the Claude API with the server-held ANTHROPIC_API_KEY.
//
// `messages` must be Claude-format turns ([{ role, content }], content is a
// string or an array of content blocks) and start with a user turn. `mode`
// ('assistant' | 'manager') tells the server whether to offer task tools.
// Returns { stop_reason, content, text }.
export async function askZen({ system, messages, mode }) {
  const res = await fetch('/api/zen-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, messages, mode }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.error) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return data;
}
