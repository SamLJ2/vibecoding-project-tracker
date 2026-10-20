import { useState, useEffect } from 'react';

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

function TaskCard({ task }) {
  // M6 will add the type icon; for now the stripe color carries type.
  const stripe = task.type === 'bug' ? 'border-l-type-bug' : 'border-l-type-feature';

  return (
    <article
      className={`rounded-md border border-stone-200 border-l-4 ${stripe} bg-surface-card p-3 transition-shadow hover:shadow-md`}
    >
      <h3 className="text-sm font-medium text-text-primary">{task.title}</h3>
      <p className="mt-2 text-xs text-text-muted">{task.assignee}</p>
    </article>
  );
}

function Column({ stage, tasks }) {
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
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [tasks] = useLocalStorage('breadcrumb.tasks', SEED_TASKS);

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="flex items-center justify-between bg-surface-card px-6 py-4 shadow-[0_1px_0_0_rgb(231,229,228)]">
        <Wordmark />
        {/* M5 turns this into the "+ Task" button that opens the modal. */}
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-4 gap-4 p-6">
        {STAGES.map((stage) => (
          <Column
            key={stage.id}
            stage={stage}
            tasks={tasks.filter((t) => t.status === stage.id)}
          />
        ))}
      </main>
    </div>
  );
}
