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
// M9: starter template for new tasks' Context field.
const CONTEXT_TEMPLATE = `## Background

## Constraints

## Tried so far

## Pick up
`;

// M9: "2 h ago" style hint.
function timeAgo(iso) {
  const sec = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} h ago`;
  return `${Math.round(hr / 24)} d ago`;
}

// M10: the Markdown briefing that gets copied. Reads as a natural message to an AI.
function buildPromptContext(task) {
  const stage = STAGES.find((st) => st.id === task.status)?.label ?? task.status;
  const typeLabel = task.type === 'bug' ? 'Bug' : 'Feature';
  return [
    "I'm continuing work on a task from my project tracker. Here's the briefing.",
    '',
    `# ${task.title}`,
    '',
    `- **Type:** ${typeLabel}`,
    `- **Status:** ${stage}`,
    `- **Assignee:** ${task.assignee}`,
    task.dueDate ? `- **Due:** ${task.dueDate}` : null,
    task.contextTool ? `- **Last worked on in:** ${task.contextTool}` : null,
    '',
    '## Description',
    '',
    task.description.trim() || '_No description._',
    '',
    '## Context',
    '',
    task.context.trim() || '_No context written yet._',
    '',
    'Please read this briefing and help me continue from here.',
  ]
    .filter((line) => line !== null)
    .join('\n');
}

// Clipboard with a fallback for browsers that block the async API.
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

// M12: a soft two-note chime (no audio files needed).
let audioCtx = null;

// One shared audio context. Browsers only let it run after the person has
// interacted with the page, so App unlocks it on the first click or touch.
function getAudioCtx() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
}

function unlockAudio() {
  const ctx = getAudioCtx();
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

function playChime() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const play = () => {
      const now = ctx.currentTime;
      [523.25, 783.99].forEach((freq, i) => {
        const start = now + i * 0.14;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.4, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.55);
      });
    };
    console.log('[chime] audio state:', ctx.state);
    if (ctx.state === 'suspended') ctx.resume().then(play);
    else play();
  } catch (err) {
    console.warn('Chime blocked:', err);
  }
}

const AI_TOOLS = ['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other'];

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
    context: CONTEXT_TEMPLATE,
    contextTool: null,
    contextUpdatedAt: null,
  };
}

const fieldClass =
  'w-full rounded-md border border-stone-300 bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30';

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

// M6: one source of truth for how feature vs. bug look everywhere.
const TYPE_STYLES = {
  feature: {
    label: 'Feature',
    stripe: 'border-l-type-feature',
    top: 'border-t-type-feature',
    text: 'text-type-feature-text',
    border: 'border-type-feature',
  },
  bug: {
    label: 'Bug',
    stripe: 'border-l-type-bug',
    top: 'border-t-type-bug',
    text: 'text-type-bug-text',
    border: 'border-type-bug',
  },
};

function TypeIcon({ type, className = 'h-3.5 w-3.5' }) {
  const common = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    'aria-hidden': true,
  };
  return type === 'bug' ? (
    <svg {...common}>
      <path d="m8 2 1.88 1.88" />
      <path d="M14.12 3.88 16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
  ) : (
    <svg {...common}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

function TypeBadge({ type }) {
  const t = TYPE_STYLES[type];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded border bg-white px-1.5 py-0.5 font-mono text-xs font-medium ${t.border} ${t.text}`}
    >
      <TypeIcon type={type} />
      {t.label}
    </span>
  );
}

// M7: initials avatar.
function initials(name) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function Avatar({ name, muted = false }) {
  return (
    <span
      aria-hidden="true"
      title={name}
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${
        muted ? 'bg-text-muted' : 'bg-brand-primary'
      }`}
    >
      {initials(name)}
    </span>
  );
}

// M8: due-date state. Compared by calendar day, so "today" means due today.
//   done            -> neutral (always, even if it was overdue)
//   before today    -> overdue
//   today           -> warning (less than 24 hours left)
//   later           -> safe
function dueInfo(task, today) {
  if (task.status === 'done' && !task.dueDate) return { state: 'neutral', label: null };
  if (!task.dueDate) return { state: 'none', label: null };
  const [y, m, d] = task.dueDate.split('-').map(Number);
  const pretty = new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
  if (task.status === 'done') return { state: 'neutral', label: `Due ${pretty}` };
  if (task.dueDate < today) return { state: 'overdue', label: `Overdue · ${pretty}` };
  if (task.dueDate === today) return { state: 'warning', label: 'Due today' };
  return { state: 'safe', label: `Due ${pretty}` };
}

const DUE_BG = {
  none: 'bg-surface-card',
  safe: 'bg-due-safe',
  warning: 'bg-due-warning',
  overdue: 'bg-due-overdue',
  neutral: 'bg-due-neutral',
};

function TaskModal({ task, isNew, onSave, onDelete, onHandoff, onCopy, onClose }) {
  const [form, setForm] = useState(task);
  const [errors, setErrors] = useState({ title: '', description: '' });
  const titleRef = useRef(null);
  const descRef = useRef(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Focus the title on open, close on Esc, and give focus back to whatever
  // opened the modal when it closes (keyboard and screen reader users).
  useEffect(() => {
    const opener = document.activeElement;
    titleRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (opener && document.body.contains(opener)) opener.focus();
    };
  }, [onClose]);

  // Clean the form and stamp contextUpdatedAt when the Context text changed.
  const finalize = (f) => ({
    ...f,
    title: f.title.trim(),
    dueDate: f.dueDate || null,
    contextTool: f.contextTool || null,
    contextUpdatedAt:
      isNew || f.context !== task.context ? new Date().toISOString() : f.contextUpdatedAt,
  });

  const contextChanged = form.context !== task.context;
  const contextHint = contextChanged
    ? 'Edited just now. Saves with the task.'
    : task.contextUpdatedAt
      ? `Last updated ${timeAgo(task.contextUpdatedAt)}`
      : 'Not updated yet';

  // Title and description are both required.
  const validate = () => {
    const next = {
      title: form.title.trim() ? '' : 'Give the task a title.',
      description: form.description.trim() ? '' : 'Add a short description.',
    };
    setErrors(next);
    if (next.title) titleRef.current?.focus();
    else if (next.description) descRef.current?.focus();
    return !next.title && !next.description;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(finalize(form));
  };

  // M7: reassign immediately, keeping any other edits made in the form.
  const handleHandoff = (name) => {
    if (!name) return;
    if (!validate()) return;
    onHandoff(finalize({ ...form, assignee: name }));
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
        className={`max-h-full w-full max-w-lg overflow-y-auto rounded-lg border-t-4 ${TYPE_STYLES[form.type].top} bg-surface-card p-6 shadow-xl`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-text-primary">
            {isNew ? 'New task' : 'Edit task'}
          </h2>
          <TypeBadge type={form.type} />
        </div>

        <div className="space-y-4">
          <Field label="Title" htmlFor="task-title">
            <input
              id="task-title"
              ref={titleRef}
              className={fieldClass}
              value={form.title}
              aria-required="true"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'task-title-error' : undefined}
              onChange={(e) => {
                setErrors({ ...errors, title: '' });
                set('title')(e);
              }}
            />
            {errors.title && (
              <p id="task-title-error" role="alert" className="mt-1 text-xs text-type-bug-text">
                {errors.title}
              </p>
            )}
          </Field>

          <Field label="Description" htmlFor="task-description">
            <textarea
              id="task-description"
              ref={descRef}
              rows={3}
              className={fieldClass}
              value={form.description}
              aria-required="true"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'task-description-error' : undefined}
              onChange={(e) => {
                setErrors({ ...errors, description: '' });
                set('description')(e);
              }}
            />
            {errors.description && (
              <p id="task-description-error" role="alert" className="mt-1 text-xs text-type-bug-text">
                {errors.description}
              </p>
            )}
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

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="task-context" className="text-xs font-medium text-text-muted">
                Context
              </label>
              <button
                type="button"
                onClick={() => onCopy(form)}
                className="rounded border border-stone-300 px-2 py-1 text-xs font-medium text-brand-primary hover:bg-stone-100"
              >
                Copy Context
              </button>
            </div>
            <textarea
              id="task-context"
              rows={9}
              className={`${fieldClass} font-mono text-xs leading-relaxed`}
              value={form.context}
              onChange={set('context')}
            />
            <p className="mt-1 text-xs text-text-muted">{contextHint}</p>
          </div>

          <Field label="AI tool (optional)" htmlFor="task-tool">
            <select
              id="task-tool"
              className={fieldClass}
              value={form.contextTool || ''}
              onChange={set('contextTool')}
            >
              <option value="">None</option>
              {AI_TOOLS.map((tool) => (
                <option key={tool} value={tool}>
                  {tool}
                </option>
              ))}
            </select>
          </Field>

          {!isNew && (
            <Field label="Hand off to…" htmlFor="task-handoff">
              <select
                id="task-handoff"
                className={fieldClass}
                value=""
                onChange={(e) => handleHandoff(e.target.value)}
              >
                <option value="">Choose a teammate…</option>
                {TEAM.filter((n) => n !== form.assignee).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <p className="font-mono text-xs text-text-muted">Created {form.createdDate}</p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          {isNew ? (
            <span />
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md px-3 py-2 text-sm font-medium text-type-bug-text hover:bg-type-bug/10"
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

function TaskCard({ task, today, flash, dragging, onDragStart, onDragEnd, onOpen, onCopy }) {
  const t = TYPE_STYLES[task.type];
  const due = dueInfo(task, today);
  const done = due.state === 'neutral';

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(task.id);
      }}
      onDragEnd={onDragEnd}
      className={`cursor-grab active:cursor-grabbing ${dragging ? 'opacity-40' : ''} rounded-md border border-stone-200 border-l-4 ${t.stripe} ${DUE_BG[due.state]} transition-shadow focus-within:ring-2 focus-within:ring-brand-primary/40 hover:shadow-md ${
        flash ? 'ring-2 ring-brand-accent' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(task.id)}
        className="block w-full p-3 pb-2 text-left focus:outline-none"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className={`min-w-0 break-words text-sm font-medium ${done ? 'text-text-muted' : 'text-text-primary'}`}>
            {task.title}
          </h3>
          <TypeBadge type={task.type} />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Avatar name={task.assignee} muted={done} />
            <span className="text-xs text-text-muted">{task.assignee}</span>
          </span>
          {due.label && (
            <span className="font-mono text-xs text-text-primary">{due.label}</span>
          )}
        </div>
      </button>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => onCopy(task)}
          aria-label={`Copy context for ${task.title}`}
          className="rounded border border-stone-300 bg-white/70 px-2 py-1 text-xs font-medium text-brand-primary hover:bg-white"
        >
          Copy Context
        </button>
      </div>
    </div>
  );
}

function Column({ stage, tasks, today, flashId, draggingId, onDragStart, onDragEnd, onMove, onOpen, onCopy }) {
  const [over, setOver] = useState(false);

  return (
    <section
      onDragOver={(e) => {
        if (!draggingId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onMove(e.dataTransfer.getData('text/plain'), stage.id);
        onDragEnd();
      }}
      className={`flex min-h-[24rem] flex-col rounded-lg p-3 transition-colors ${
        over ? 'bg-brand-accent/20 ring-2 ring-brand-accent' : 'bg-stone-200/50'
      }`}
    >
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
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              today={today}
              flash={task.id === flashId}
              onOpen={onOpen}
              dragging={task.id === draggingId}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onCopy={onCopy}
            />
          ))
        )}
      </div>
    </section>
  );
}

// M11: the four pinned deliverables (PRD §5 Anchor model).
const ANCHOR_DEFAULTS = [
  { id: 'presentation', label: 'Presentation', url: null },
  { id: 'demo', label: 'Demo', url: null },
  { id: 'report', label: 'Report', url: null },
  { id: 'documentation', label: 'Documentation', url: null },
];

function AnchorCard({ anchor, onChange }) {
  const filled = Boolean(anchor.url);

  // Add https:// when someone pastes a bare domain, so the link actually opens.
  const normalize = () => {
    if (anchor.url && !/^https?:\/\//i.test(anchor.url)) {
      onChange(anchor.id, `https://${anchor.url}`);
    }
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-surface-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <label
          htmlFor={`anchor-${anchor.id}`}
          className="text-xs font-semibold uppercase text-text-primary"
        >
          {anchor.label}
        </label>
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 rounded-full border ${
              filled ? 'border-type-feature bg-type-feature' : 'border-stone-300 bg-transparent'
            }`}
          />
          {filled ? 'Linked' : 'Empty'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          id={`anchor-${anchor.id}`}
          type="text"
          inputMode="url"
          placeholder="Paste link…"
          className={fieldClass}
          value={anchor.url || ''}
          onChange={(e) => onChange(anchor.id, e.target.value.trim())}
          onBlur={normalize}
        />
        {filled && (
          <a
            href={anchor.url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded px-2 py-1 text-xs font-medium text-brand-primary hover:bg-stone-100"
          >
            Open
          </a>
        )}
      </div>
    </div>
  );
}

function AnchorBoard({ anchors, onChange }) {
  return (
    <section aria-label="Deliverables" className="mx-auto grid max-w-7xl grid-cols-4 gap-4 px-6 pt-6">
      {anchors.map((a) => (
        <AnchorCard key={a.id} anchor={a} onChange={onChange} />
      ))}
    </section>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-md bg-text-primary px-4 py-2 text-sm text-white shadow-lg transition-opacity duration-200 ${
        toast.show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {toast.message}
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage('breadcrumb.tasks', SEED_TASKS);
  const [draggingId, setDraggingId] = useState(null);
  const [soundOn, setSoundOn] = useLocalStorage('breadcrumb.sound', true);
  const [anchors, setAnchors] = useLocalStorage('breadcrumb.anchors', ANCHOR_DEFAULTS);
  // null = closed, 'new' = adding, otherwise the id of the task being edited.
  const [openId, setOpenId] = useState(null);
  const [toast, setToast] = useState(null);
  const [flashId, setFlashId] = useState(null);
  const [today, setToday] = useState(todayISO());

  // M12: unlock audio on the first interaction so the chime can play later.
  useEffect(() => {
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // M8: re-check the date every minute so colors update by themselves.
  useEffect(() => {
    const id = setInterval(() => setToday(todayISO()), 60000);
    return () => clearInterval(id);
  }, []);

  const isNew = openId === 'new';
  const activeTask = isNew ? blankTask() : tasks.find((t) => t.id === openId);

  const closeModal = () => setOpenId(null);

  const setAnchorUrl = (id, url) =>
    setAnchors((prev) => prev.map((a) => (a.id === id ? { ...a, url: url || null } : a)));

  // Toast with a 200 ms fade (DESIGN.md §7).
  const showToast = (message) => {
    setToast({ message, show: false });
    requestAnimationFrame(() => setToast({ message, show: true }));
    setTimeout(() => setToast((t) => t && { ...t, show: false }), 2500);
    setTimeout(() => setToast(null), 2750);
  };

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

  // M12: drag a card to another column to change its status.
  const moveTask = (id, status) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === status) return;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    setFlashId(id);
    setTimeout(() => setFlashId(null), 1200);
    if (status === 'done') {
      console.log('[chime] moved to Done, sound on:', soundOn);
      if (soundOn) playChime();
      showToast('Done. One less crumb to follow.');
    }
  };

  // M10: copy the briefing and confirm with a toast.
  const copyContext = async (task) => {
    const ok = await copyText(buildPromptContext(task));
    showToast(ok ? 'Copied. Now paste it into the AI.' : "Couldn't copy. Select the text and copy it by hand.");
  };

  // M7: save the task with its new owner, then acknowledge it visually.
  const handoffTask = (task) => {
    saveTask(task);
    showToast(`Handed off to ${task.assignee}. They've got it.`);
    setFlashId(task.id);
    setTimeout(() => setFlashId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="flex items-center justify-between bg-surface-card px-6 py-4 shadow-[0_1px_0_0_rgb(231,229,228)]">
        <Wordmark />
        <div className="flex items-center gap-3">
        <button
          type="button"
          aria-pressed={soundOn}
          onClick={() => setSoundOn(!soundOn)}
          className="rounded-md px-3 py-2 text-sm font-medium text-text-muted hover:bg-stone-100"
        >
          Sound: {soundOn ? 'on' : 'off'}
        </button>
        <button
          type="button"
          onClick={() => setOpenId('new')}
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-accent"
        >
          + Task
        </button>
        </div>
      </header>

      <AnchorBoard anchors={anchors} onChange={setAnchorUrl} />

      <main className="mx-auto grid max-w-7xl grid-cols-4 gap-4 p-6">
        {STAGES.map((stage) => (
          <Column
            key={stage.id}
            stage={stage}
            tasks={tasks.filter((t) => t.status === stage.id)}
            today={today}
            flashId={flashId}
            draggingId={draggingId}
            onDragStart={setDraggingId}
            onDragEnd={() => setDraggingId(null)}
            onMove={moveTask}
            onOpen={setOpenId}
            onCopy={copyContext}
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
          onHandoff={handoffTask}
          onCopy={copyContext}
          onClose={closeModal}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
