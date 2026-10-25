import { useState, useEffect, useRef } from 'react';

// ---------------------------------------------------------------
// Locked constants (PRD §5, §7, §8). Do not change without a reason.
// ---------------------------------------------------------------

// PRD §8: the only allowed values for Task.assignee.
// Edit these three names to match you / your team.
export const TEAM = ['Alex', 'Sam', 'Jordan'];

// PRD §7: four columns, in this order, with these exact labels.
export const STAGES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

// ---------------------------------------------------------------
// useLocalStorage: state that survives a page reload.
// ---------------------------------------------------------------
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or blocked: keep working in memory */
    }
  }, [key, value]);

  return [value, setValue];
}

// ---------------------------------------------------------------
// Mock tasks (M4): the full Task model from PRD §5.
// ---------------------------------------------------------------
const SEED_TASKS = [
  {
    id: 't1',
    title: 'Sketch the board layout',
    description: 'Rough out the four columns and card anatomy.',
    type: 'feature',
    status: 'todo',
    assignee: TEAM[0],
    dueDate: '2026-10-30',
    createdDate: '2026-10-20',
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
  },
  {
    id: 't2',
    title: 'Fix card overflow on long titles',
    description: 'Long titles push the assignee badge off the card.',
    type: 'bug',
    status: 'in-progress',
    assignee: TEAM[1],
    dueDate: '2026-10-21',
    createdDate: '2026-10-19',
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
  },
  {
    id: 't3',
    title: 'Write the PRD summary',
    description: 'One paragraph for the pitch.',
    type: 'feature',
    status: 'review',
    assignee: TEAM[2],
    dueDate: null,
    createdDate: '2026-10-18',
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
  },
  {
    id: 't4',
    title: 'Pick the color palette',
    description: 'Indigo, amber, warm paper.',
    type: 'feature',
    status: 'done',
    assignee: TEAM[0],
    dueDate: '2026-10-20',
    createdDate: '2026-10-17',
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
  },
];

// ---------------------------------------------------------------
// Components
// ---------------------------------------------------------------
function Wordmark() {
  return (
    <h1 className="font-heading text-2xl font-semibold text-brand-primary">
      Breadcrumb<span className="text-brand-accent">.</span>
    </h1>
  );
}

// Today as a local 'YYYY-MM-DD' string.
function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function blankTask() {
  return {
    id: Date.now().toString(),
    title: '',
    description: '',
    type: 'feature',
    status: 'todo',
    assignee: TEAM[0],
    dueDate: null,
    createdDate: todayISO(),
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
  };
}

const fieldClass =
  'w-full rounded-md border border-stone-300 bg-surface-card px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30';

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

function TaskModal({ task, isNew, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(task);
  const [error, setError] = useState('');
  const titleRef = useRef(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Focus the title on open; close on Esc.
  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Give the task a title.');
      titleRef.current?.focus();
      return;
    }
    onSave({ ...form, title: form.title.trim(), dueDate: form.dueDate || null });
  };

  const handleDelete = () => {
    if (window.confirm("Delete this task? You can't undo.")) onDelete(form.id);
  };

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-brand-primary/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? 'New task' : 'Edit task'}
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-lg bg-surface-card p-6 shadow-xl"
      >
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">
          {isNew ? 'New task' : 'Edit task'}
        </h2>

        <div className="space-y-4">
          <Field label="Title" htmlFor="task-title">
            <input
              id="task-title"
              ref={titleRef}
              className={fieldClass}
              value={form.title}
              onChange={(e) => {
                setError('');
                set('title')(e);
              }}
            />
            {error && <p className="mt-1 text-xs text-type-bug">{error}</p>}
          </Field>

          <Field label="Description" htmlFor="task-description">
            <textarea
              id="task-description"
              rows={3}
              className={fieldClass}
              value={form.description}
              onChange={set('description')}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Type" htmlFor="task-type">
              <select id="task-type" className={fieldClass} value={form.type} onChange={set('type')}>
                <option value="feature">Feature</option>
                <option value="bug">Bug</option>
              </select>
            </Field>
            <Field label="Status" htmlFor="task-status">
              <select id="task-status" className={fieldClass} value={form.status} onChange={set('status')}>
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Assignee" htmlFor="task-assignee">
              <select id="task-assignee" className={fieldClass} value={form.assignee} onChange={set('assignee')}>
                {TEAM.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Due date" htmlFor="task-due">
              <input
                id="task-due"
                type="date"
                className={fieldClass}
                value={form.dueDate || ''}
                onChange={set('dueDate')}
              />
            </Field>
          </div>

          <p className="font-mono text-xs text-text-muted">Created {form.createdDate}</p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          {isNew ? (
            <span />
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md px-3 py-2 text-sm font-medium text-type-bug hover:bg-type-bug/10"
            >
              Delete task
            </button>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-text-muted hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              {isNew ? 'Add task' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function TaskCard({ task, onOpen }) {
  // M6 will add the type icon; for now the stripe color carries type.
  const stripe = task.type === 'bug' ? 'border-l-type-bug' : 'border-l-type-feature';

  return (
    <button
      type="button"
      onClick={() => onOpen(task.id)}
      className={`w-full rounded-md border border-stone-200 border-l-4 ${stripe} bg-surface-card p-3 text-left transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-primary/40`}
    >
      <h3 className="text-sm font-medium text-text-primary">{task.title}</h3>
      <p className="mt-2 text-xs text-text-muted">{task.assignee}</p>
    </button>
  );
}

function Column({ stage, tasks, onOpen }) {
  return (
    <section className="flex min-h-[24rem] flex-col rounded-lg bg-stone-200/50 p-3">
      <header className="mb-3 flex items-baseline justify-between px-1">
        <h2 className="text-base font-semibold uppercase text-text-primary">
          {stage.label}
        </h2>
        <span className="font-mono text-xs text-text-muted">{tasks.length}</span>
      </header>

      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <p className="rounded-md border border-dashed border-stone-300 p-4 text-center text-sm text-text-muted">
            Nothing here yet. Drop a crumb.
          </p>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} onOpen={onOpen} />)
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage('breadcrumb.tasks', SEED_TASKS);
  // null = closed, 'new' = adding, otherwise the id of the task being edited.
  const [openId, setOpenId] = useState(null);

  const isNew = openId === 'new';
  const activeTask = isNew ? blankTask() : tasks.find((t) => t.id === openId);

  const closeModal = () => setOpenId(null);

  const saveTask = (task) => {
    setTasks((prev) =>
      prev.some((t) => t.id === task.id)
        ? prev.map((t) => (t.id === task.id ? task : t))
        : [...prev, task]
    );
    closeModal();
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    closeModal();
  };

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="flex items-center justify-between bg-surface-card px-6 py-4 shadow-[0_1px_0_0_rgb(231,229,228)]">
        <Wordmark />
        <button
          type="button"
          onClick={() => setOpenId('new')}
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-accent"
        >
          + Task
        </button>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-4 gap-4 p-6">
        {STAGES.map((stage) => (
          <Column
            key={stage.id}
            stage={stage}
            tasks={tasks.filter((t) => t.status === stage.id)}
            onOpen={setOpenId}
          />
        ))}
      </main>

      {activeTask && (
        <TaskModal
          // key forces a fresh form whenever a different task is opened
          key={openId}
          task={activeTask}
          isNew={isNew}
          onSave={saveTask}
          onDelete={deleteTask}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
