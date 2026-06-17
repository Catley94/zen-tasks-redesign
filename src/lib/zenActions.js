// Client-side execution of the tools Claude can call in Manager mode. The task
// state lives here in the React app, so the model's tool calls are applied
// against `app` and a short result string is returned to feed back to Claude.

function matchProjectId(app, name) {
  const projects = app.projects || [];
  const lower = String(name || '').toLowerCase();
  if (!lower) return null;
  const exact = projects.find((p) => p.name.toLowerCase() === lower);
  if (exact) return exact.id;
  const partial = projects.find(
    (p) => p.name.toLowerCase().includes(lower) || lower.includes(p.name.toLowerCase()),
  );
  return partial ? partial.id : null;
}

export function applyZenAction(app, name, input = {}) {
  try {
    if (name === 'add_task') {
      if (!input.title) return 'No title provided; task not created.';
      const projectId = input.project ? matchProjectId(app, input.project) : null;
      app.addTask({ title: input.title, projectId, due: input.due || '—' });
      const where = projectId
        ? ` in ${(app.projects || []).find((p) => p.id === projectId)?.name}`
        : '';
      return `Created task "${input.title}"${where}.`;
    }

    if (name === 'complete_task') {
      const task = (app.tasks || []).find((t) => t.id === input.task_id);
      if (!task) return `No task found with id ${input.task_id}.`;
      if (!task.done) app.toggleTask(task.id);
      return `Marked "${task.title}" as done.`;
    }

    if (name === 'add_to_focus') {
      const task = (app.tasks || []).find((t) => t.id === input.task_id);
      if (!task) return `No task found with id ${input.task_id}.`;
      if (!app.focusIds?.has(task.id)) app.toggleFocus(task.id);
      return `Added "${task.title}" to Focus.`;
    }

    return `Unknown action: ${name}.`;
  } catch (err) {
    return `Failed to run ${name}: ${err?.message || 'error'}.`;
  }
}
